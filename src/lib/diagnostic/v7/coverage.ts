import { getScanAnswers } from "@/content/diagnostic/v7/catalog";
import type {
    AmbitionId,
    AreaAnswerValue,
    AreaId,
    CompanyContext,
    ConfirmationAnswers,
    CoverageState,
    FitCheckState,
} from "@/content/diagnostic/v7/types";

const SOLO_SIZES = new Set(["1", "solo", "just_me"]);

export function isSoloCompany(size?: string): boolean {
    if (!size) return false;
    return SOLO_SIZES.has(size) || size === "1";
}

export function isCovered(state?: CoverageState): boolean {
    return (
        state === "covered" ||
        state === "covered_unknown_fit" ||
        state === "covered_good_fit" ||
        state === "partially_covered" ||
        state === "covered_partial_fit"
    );
}

export function isPotentialGap(state?: CoverageState): boolean {
    return state === "potentially_uncovered" || state === "confirmed_uncovered_relevant";
}

/** Hard filters before the applicability multi-select. */
export function hardApplicableAreas(context: CompanyContext): AreaId[] {
    const all: AreaId[] = [
        "leadership_performance",
        "sales_growth",
        "clients_service",
        "work_operations",
        "team_people",
        "finance_profitability",
        "information_ways",
        "offer_development",
        "tools_systems",
    ];
    return all.filter((area) => {
        if (area === "team_people" && isSoloCompany(context.company_size)) return false;
        return true;
    });
}

function isExclusiveAnswer(option: { id: string; exclusive?: boolean }): boolean {
    return Boolean(
        option.exclusive ||
            /^(no_|too_early|not_|informal_|none_)/.test(option.id) ||
            option.id === "no_overview" ||
            option.id === "no_tools" ||
            option.id === "no_formal_sales",
    );
}

export function resolveCapabilities(input: {
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>;
    confirmationAnswers: ConfirmationAnswers;
    fitChecks: Record<string, FitCheckState>;
}): Record<string, CoverageState> {
    const capabilities: Record<string, CoverageState> = {};

    for (const [areaId, answers] of Object.entries(input.areaAnswers) as [AreaId, AreaAnswerValue][]) {
        const options = getScanAnswers(areaId);
        const selected = new Set(answers || []);
        const exclusiveSelected = options.some((o) => selected.has(o.id) && isExclusiveAnswer(o));

        for (const option of options) {
            if (!option.capability) continue;
            if (selected.has(option.id)) {
                capabilities[option.capability] = "covered";
            } else if (!exclusiveSelected && !selected.has(option.id)) {
                if (!capabilities[option.capability]) {
                    capabilities[option.capability] = "potentially_uncovered";
                }
            }
        }
    }

    const perfConfirm = input.confirmationAnswers.performance_blind_spot;
    if (Array.isArray(perfConfirm)) {
        for (const id of perfConfirm) {
            if (id === "none") continue;
            const capability = capabilityFromAnswerId("leadership_performance", id);
            if (capability) capabilities[capability] = "confirmed_uncovered_relevant";
        }
    }

    const teamConfirm = input.confirmationAnswers.team_gap;
    if (Array.isArray(teamConfirm)) {
        for (const id of teamConfirm) {
            if (id === "none") continue;
            const capability = capabilityFromAnswerId("team_people", id);
            if (capability) capabilities[capability] = "confirmed_uncovered_relevant";
        }
    }

    const clientConfirm = input.confirmationAnswers.client_feedback_gap;
    if (clientConfirm === "yes" || clientConfirm === "maybe") {
        capabilities.customer_feedback =
            clientConfirm === "yes" ? "confirmed_uncovered_relevant" : "potentially_uncovered";
        capabilities.customer_feedback_visibility =
            clientConfirm === "yes" ? "confirmed_uncovered_relevant" : "potentially_uncovered";
    }

    const toolsFit = input.fitChecks.tools_fit?.state;
    if (toolsFit === "fit_gap") {
        capabilities.tool_fit_gap = "partially_covered";
    }

    return capabilities;
}

function capabilityFromAnswerId(areaId: AreaId, answerId: string): string | undefined {
    return getScanAnswers(areaId).find((a) => a.id === answerId)?.capability;
}

export type GapCandidate = {
    id: string;
    confirmationId: "performance_blind_spot" | "team_gap" | "client_feedback_gap";
    capability: string;
    answerId: string;
    label: string;
    areaId: AreaId;
};

export function buildGapCandidates(input: {
    companyContext: CompanyContext;
    primary?: AmbitionId;
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>;
    capabilities: Record<string, CoverageState>;
}): GapCandidate[] {
    const candidates: GapCandidate[] = [];
    const perfAnswers = input.areaAnswers.leadership_performance || [];
    const perfOptions = getScanAnswers("leadership_performance").filter((o) => o.capability);

    if (perfAnswers.includes("revenue") || input.primary === "better_decisions") {
        for (const option of perfOptions) {
            if (!option.capability || perfAnswers.includes(option.id)) continue;
            if (option.id === "other" || option.id === "no_overview") continue;
            if (input.capabilities[option.capability] === "potentially_uncovered") {
                candidates.push({
                    id: `perf_${option.id}`,
                    confirmationId: "performance_blind_spot",
                    capability: option.capability,
                    answerId: option.id,
                    label: option.label_fr,
                    areaId: "leadership_performance",
                });
            }
        }
    }

    const teamAnswers = input.areaAnswers.team_people || [];
    if (!isSoloCompany(input.companyContext.company_size) && teamAnswers.length > 0) {
        for (const option of getScanAnswers("team_people").filter((o) => o.capability)) {
            if (teamAnswers.includes(option.id) || !option.capability || option.exclusive) continue;
            if (input.capabilities[option.capability] === "potentially_uncovered") {
                candidates.push({
                    id: `team_${option.id}`,
                    confirmationId: "team_gap",
                    capability: option.capability,
                    answerId: option.id,
                    label: option.label_fr,
                    areaId: "team_people",
                });
            }
        }
    }

    const clientAnswers = input.areaAnswers.clients_service || [];
    const hasClientActivity = clientAnswers.length > 0 && !clientAnswers.includes("too_early_clients");
    const clientAmbition =
        input.primary === "improve_client_experience" || input.primary === "grow_sales";
    const feedbackCovered =
        isCovered(input.capabilities.customer_feedback) ||
        isCovered(input.capabilities.customer_feedback_visibility) ||
        clientAnswers.includes("feedback") ||
        (input.areaAnswers.leadership_performance || []).includes("customer_feedback");

    if ((hasClientActivity || clientAmbition) && !feedbackCovered) {
        candidates.push({
            id: "client_feedback_gap",
            confirmationId: "client_feedback_gap",
            capability: "customer_feedback",
            answerId: "customer_feedback",
            label: "Retours clients",
            areaId: "clients_service",
        });
    }

    return candidates;
}
