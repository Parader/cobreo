import type {
    AmbitionId,
    AreaAnswerValue,
    AreaId,
    AutomationInterest,
    CompanyContext,
    PrioritySectionCard,
} from "@/content/diagnostic/v7/types";
import { areaLabel, getScanAnswers } from "@/content/diagnostic/v7/catalog";
import { isSoloCompany, resolveCapabilities } from "./coverage";

const AMBITION_AREAS: Partial<Record<AmbitionId, AreaId[]>> = {
    grow_sales: ["sales_growth", "clients_service", "tools_systems"],
    improve_client_experience: ["clients_service", "sales_growth", "information_ways"],
    save_time: ["work_operations", "information_ways", "tools_systems"],
    organize_work: ["work_operations", "information_ways", "tools_systems"],
    improve_team: ["team_people", "work_operations", "information_ways"],
    better_decisions: ["leadership_performance", "finance_profitability", "information_ways"],
    improve_profitability: ["finance_profitability", "leadership_performance", "work_operations", "team_people"],
    improve_offer: ["offer_development", "clients_service", "leadership_performance"],
    prepare_growth: ["work_operations", "team_people", "information_ways", "tools_systems"],
    use_information_better: ["information_ways", "tools_systems", "leadership_performance"],
    improve_tools: ["tools_systems", "information_ways", "work_operations"],
};

function exclusiveIds(areaId: AreaId): Set<string> {
    return new Set(
        getScanAnswers(areaId)
            .filter(
                (a) =>
                    a.exclusive ||
                    /^(no_|too_early|not_|informal_|none_)/.test(a.id) ||
                    a.id === "no_overview" ||
                    a.id === "no_tools" ||
                    a.id === "no_formal_sales",
            )
            .map((a) => a.id),
    );
}

function selectedSignals(areaId: AreaId, answers: string[], locale: string): string[] {
    const excl = exclusiveIds(areaId);
    return answers
        .filter((id) => !excl.has(id) && id !== "other" && id !== "none")
        .map((id) => {
            const opt = getScanAnswers(areaId).find((a) => a.id === id);
            return opt?.label_fr || id;
        })
        .slice(0, 3);
}

function potentialPhrase(areaId: AreaId, en: boolean): string {
    const fr: Record<AreaId, string> = {
        leadership_performance: "Possibilité d’améliorer la visibilité pour mieux décider.",
        sales_growth: "Possibilité de clarifier ou fluidifier le parcours commercial.",
        clients_service: "Possibilité de mieux suivre et servir les clients.",
        work_operations: "Possibilité de simplifier l’organisation du travail.",
        team_people: "Possibilité de mieux organiser ou suivre l’équipe.",
        finance_profitability: "Possibilité de mieux relier activité et rentabilité.",
        information_ways: "Possibilité de simplifier la circulation de l’information.",
        offer_development: "Possibilité de mieux suivre essais, versions et apprentissages.",
        tools_systems: "Possibilité de mieux aligner outils et façon de travailler.",
    };
    const enMap: Record<AreaId, string> = {
        leadership_performance: "Room to improve visibility for better decisions.",
        sales_growth: "Room to clarify or streamline the sales path.",
        clients_service: "Room to better track and serve clients.",
        work_operations: "Room to simplify how work is organized.",
        team_people: "Room to better organize or track the team.",
        finance_profitability: "Room to better connect activity and profitability.",
        information_ways: "Room to simplify how information flows.",
        offer_development: "Room to better track tests, versions and learning.",
        tools_systems: "Room to better align tools with how you work.",
    };
    return en ? enMap[areaId] : fr[areaId];
}

function ambitionAreaSet(declared: AmbitionId[] | undefined): Set<AreaId> {
    const set = new Set<AreaId>();
    for (const id of declared || []) {
        for (const area of AMBITION_AREAS[id] || []) set.add(area);
    }
    return set;
}

/** Build up to 6 business-section cards for respondent prioritization (v7.9). */
export function buildPrioritySectionCards(input: {
    companyContext: CompanyContext;
    declared?: AmbitionId[];
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>;
    automationInterest: AutomationInterest;
    locale?: string;
}): PrioritySectionCard[] {
    const en = input.locale === "en";
    const caps = resolveCapabilities({
        areaAnswers: input.areaAnswers,
        confirmationAnswers: {},
        fitChecks: {},
    });
    const ambitionAreas = ambitionAreaSet(input.declared);
    const scored = new Map<AreaId, PrioritySectionCard>();

    for (const [areaId, answers] of Object.entries(input.areaAnswers) as [AreaId, AreaAnswerValue][]) {
        const signals = selectedSignals(areaId, answers || [], input.locale || "fr");
        if (signals.length === 0) continue;
        let score = 2 + signals.length;
        if (ambitionAreas.has(areaId)) score += 2;
        scored.set(areaId, {
            areaId,
            title: areaLabel(areaId, input.locale),
            signals,
            potential: potentialPhrase(areaId, en),
            score,
        });
    }

    const teamHours = (input.areaAnswers.team_people || []).includes("hours");
    if (
        teamHours &&
        (input.declared || []).includes("improve_profitability") &&
        !isSoloCompany(input.companyContext.company_size)
    ) {
        const existing = scored.get("finance_profitability");
        const signal = en
            ? "Hours are tracked — linking them to profitability could help"
            : "Les heures sont suivies — les relier à la rentabilité pourrait aider";
        if (existing) {
            existing.signals = [...new Set([signal, ...existing.signals])].slice(0, 3);
            existing.score += 3;
        } else {
            scored.set("finance_profitability", {
                areaId: "finance_profitability",
                title: areaLabel("finance_profitability", input.locale),
                signals: [signal],
                potential: potentialPhrase("finance_profitability", en),
                score: 5,
            });
        }
    }

    const tasks = (input.automationInterest.tasks || []).filter((t) => t !== "none");
    if (tasks.length > 0) {
        const areaId: AreaId =
            tasks.includes("copy_transfer") || tasks.includes("find_combine") || tasks.includes("reports")
                ? "information_ways"
                : "work_operations";
        const labels = tasks.slice(0, 2).map((id) => {
            const map: Record<string, string> = {
                documents: en ? "Preparing documents manually" : "Préparer des documents manuellement",
                copy_transfer: en ? "Copying or transferring information" : "Copier ou transférer de l’information",
                followups: en ? "Follow-ups and reminders" : "Suivis et rappels",
                updates: en ? "Updating lists or statuses" : "Mettre à jour dossiers ou statuts",
                find_combine: en ? "Finding or combining information" : "Chercher ou regrouper de l’information",
                reports: en ? "Preparing reports" : "Préparer des rapports",
                scheduling: en ? "Scheduling coordination" : "Coordination d’horaires",
            };
            return map[id] || id;
        });
        const existing = scored.get(areaId);
        if (existing) {
            existing.signals = [...new Set([...labels, ...existing.signals])].slice(0, 3);
            existing.score += 2 + tasks.length;
        } else {
            scored.set(areaId, {
                areaId,
                title: areaLabel(areaId, input.locale),
                signals: labels,
                potential: potentialPhrase(areaId, en),
                score: 3 + tasks.length + (ambitionAreas.has(areaId) ? 2 : 0),
            });
        }
    }

    for (const areaId of ambitionAreas) {
        if (scored.has(areaId)) continue;
        const answers = input.areaAnswers[areaId] || [];
        if (answers.length === 0) continue;
        const excl = exclusiveIds(areaId);
        const onlyExclusive = answers.every((id) => excl.has(id));
        if (onlyExclusive) continue;
        const gapCaps = getScanAnswers(areaId).filter(
            (o) => o.capability && caps[o.capability] === "potentially_uncovered" && !answers.includes(o.id),
        );
        if (gapCaps.length >= 2 && answers.some((id) => !excl.has(id))) {
            scored.set(areaId, {
                areaId,
                title: areaLabel(areaId, input.locale),
                signals: selectedSignals(areaId, answers, input.locale || "fr"),
                potential: potentialPhrase(areaId, en),
                score: 2 + (ambitionAreas.has(areaId) ? 1 : 0),
            });
        }
    }

    return [...scored.values()]
        .filter((card) => card.signals.length > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
}
