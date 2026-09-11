import { getScanAnswers } from "@/content/diagnostic/v7/catalog";
import { diagnosticSpecV7 } from "@/content/diagnostic/v7/types";
import type {
    AreaAnswerValue,
    AreaId,
    AutomationInterest,
    FitCheckState,
    PossibilityCandidate,
    PossibilitySourceTier,
    ProspectServiceId,
    SelectedPossibility,
    ServiceSectionCard,
} from "@/content/diagnostic/v7/types";
import { pickLocalized } from "@/lib/diagnostic/localize";
import { assignPriorityBands, type PrioritySignals } from "@/lib/diagnostic/v7/priority-bands";

const TIER_RANK: Record<PossibilitySourceTier, number> = {
    observed: 3,
    emerging: 2,
    suggested: 1,
};

function betterTier(current: PossibilitySourceTier | null, next: PossibilitySourceTier): PossibilitySourceTier {
    if (!current) return next;
    return TIER_RANK[next] > TIER_RANK[current] ? next : current;
}

function candidateTierById(candidates: PossibilityCandidate[] | undefined): Map<string, PossibilitySourceTier> {
    const map = new Map<string, PossibilitySourceTier>();
    for (const candidate of candidates || []) {
        map.set(candidate.id, candidate.sourceTier);
    }
    return map;
}

type Mapping = {
    label_fr: string;
    label_en?: string;
    services: ProspectServiceId[];
};

/** Result cards shown to the prospect (spec `results.page.max_section_cards`). */
const MAX_SECTION_CARDS = (diagnosticSpecV7 as { results?: { page?: { max_section_cards?: number } } }).results?.page?.max_section_cards ?? 4;

const SERVICE_LABELS: Record<ProspectServiceId, { fr: string; en: string }> = {
    operations_optimization: { fr: "Optimisation des opérations", en: "Operations optimization" },
    automation: { fr: "Automatisation", en: "Automation" },
    information_decision: { fr: "Information et aide à la décision", en: "Information and decision support" },
    customer_experience: { fr: "Expérience client", en: "Customer experience" },
    online_presence: { fr: "Présence en ligne et optimisation du site", en: "Online presence and site optimization" },
    custom_tool: { fr: "Outil sur mesure", en: "Custom tool" },
    internal_tool: { fr: "Outil interne", en: "Internal tool" },
};

function serviceLabel(id: ProspectServiceId, locale?: string): string {
    const labels = SERVICE_LABELS[id];
    if (!labels) return id;
    return locale === "en" ? labels.en : labels.fr;
}

function getMapping(): Partial<Record<AreaId, Mapping>> {
    const raw = diagnosticSpecV7.simple_service_mapping as Record<string, unknown>;
    const out: Partial<Record<AreaId, Mapping>> = {};
    for (const [key, value] of Object.entries(raw)) {
        if (key === "rules" || !value || typeof value !== "object") continue;
        const item = value as { label_fr?: string; label_en?: string; services?: string[] };
        out[key as AreaId] = {
            label_fr: item.label_fr || key,
            label_en: item.label_en,
            services: (item.services || []) as ProspectServiceId[],
        };
    }
    return out;
}

function exclusives(areaId: AreaId): Set<string> {
    return new Set(
        getScanAnswers(areaId)
            .filter((a) => a.exclusive || /^(no_|too_early|not_|informal_|none_)/.test(a.id) || a.id === "working_well" || a.id === "other")
            .map((a) => a.id),
    );
}

function selected(areaId: AreaId, answers: Partial<Record<AreaId, AreaAnswerValue>>): string[] {
    const excl = exclusives(areaId);
    return (answers[areaId] || []).filter((id) => !excl.has(id));
}

function labelFor(areaId: AreaId, answerId: string, locale?: string): string {
    const answer = getScanAnswers(areaId).find((a) => a.id === answerId);
    if (!answer) return answerId;
    return pickLocalized(answer as Record<string, unknown>, "label", locale || "fr") || answer.label_fr;
}

function automationTaskLabel(taskId: string, locale?: string): string {
    const answers = (
        diagnosticSpecV7 as {
            automation_scan?: { answers?: Array<Record<string, unknown>> };
        }
    ).automation_scan?.answers;
    const answer = answers?.find((item) => item.id === taskId);
    if (answer) {
        return pickLocalized(answer, "label", locale || "fr") || String(answer.label_fr || taskId);
    }
    return locale === "en" ? "Selected repetitive tasks" : "Tâches répétitives sélectionnées";
}

type EvidenceHit = { service: ProspectServiceId; reason: string; weight: number };

function collectEvidence(input: {
    areaId: AreaId;
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>;
    automationInterest: AutomationInterest;
    fitChecks: Record<string, FitCheckState>;
    locale?: string;
}): EvidenceHit[] {
    const hits: EvidenceHit[] = [];
    const picks = selected(input.areaId, input.areaAnswers);
    const tasks = (input.automationInterest.tasks || []).filter((t) => t !== "none" && t !== "other");
    const fitGap = input.fitChecks.tools_fit?.state === "fit_gap";
    const locale = input.locale;

    const push = (service: ProspectServiceId, answerId: string, weight = 2) => {
        hits.push({
            service,
            reason: labelFor(input.areaId, answerId, locale),
            weight,
        });
    };

    // Per-section explicit signals
    // manual_steps / repeated_documents moved to scan_simplification in spec 8.3; kept for pre-8.3 submissions.
    const opsSignals = new Set([
        "memory_followups",
        "status_visibility",
        "handoffs",
        "planning_changes",
        "waiting_dependencies",
        "manual_steps",
        "repeated_documents",
    ]);
    const infoSignals = new Set([
        "revenue",
        "profitability",
        "cash",
        "sales_pipeline",
        "work_progress",
        "customer_feedback",
        "team_performance",
        "rd_results",
        "multiple_places",
        "copy_reenter",
        "knowledge_in_heads",
        "documentation_gap",
        "version_uncertainty",
        "data_underused",
        "financial_reporting",
        "budget_forecast",
        "labor_cost",
        "hours",
        "workload",
        "performance",
        "find_combine",
        "reports",
    ]);
    const autoSignals = new Set([
        "manual_steps",
        "memory_followups",
        "repeated_documents",
        "copy_reenter",
        "invoices_payments",
        "financial_reporting",
        "schedules",
        "documents",
        "copy_transfer",
        "followups",
        "updates",
        "scheduling",
    ]);
    const cxSignals = new Set([
        "collect_client_info",
        "client_history",
        "status_updates",
        "request_management",
        "post_service_followup",
        "collect_feedback",
        "repeat_business",
        "customer_feedback",
        "sales_followup",
        "inquiry_path",
        "quote_booking_order",
    ]);
    const onlineSignals = new Set(["offer_info", "inquiry_path", "lead_tracking"]);

    for (const id of picks) {
        if (opsSignals.has(id) && (input.areaId === "work_operations" || input.areaId === "team_people" || input.areaId === "information_ways")) {
            push("operations_optimization", id);
        }
        if (autoSignals.has(id)) push("automation", id);
        if (infoSignals.has(id)) push("information_decision", id);
        if (cxSignals.has(id)) push("customer_experience", id);
        if (onlineSignals.has(id) && (input.areaId === "sales_growth" || input.areaId === "clients_service")) {
            push("online_presence", id, 3);
        }
    }

    // Cross-area automation checklist can support work / information / tools sections
    if (
        tasks.length > 0 &&
        (input.areaId === "work_operations" ||
            input.areaId === "information_ways" ||
            input.areaId === "tools_systems" ||
            input.areaId === "finance_profitability")
    ) {
        const taskLabel = automationTaskLabel(tasks[0], locale);
        hits.push({ service: "automation", reason: taskLabel, weight: 2 + Math.min(2, tasks.length) });
        if (tasks.some((t) => t === "find_combine" || t === "reports" || t === "updates")) {
            hits.push({ service: "information_decision", reason: taskLabel, weight: 2 });
        }
        if (tasks.some((t) => t === "documents" || t === "followups" || t === "scheduling" || t === "updates")) {
            hits.push({ service: "operations_optimization", reason: taskLabel, weight: 2 });
        }
    }

    if (fitGap && (input.areaId === "tools_systems" || picks.length > 0)) {
        hits.push({
            service: "custom_tool",
            reason: locale === "en" ? "Current tools only partly cover the need" : "Les outils actuels ne couvrent qu’en partie le besoin",
            weight: 3,
        });
    }

    // custom tool also when specialized/custom selected with friction signals
    if (
        input.areaId === "tools_systems" &&
        (picks.includes("specialized") || picks.includes("custom")) &&
        (fitGap || picks.includes("spreadsheets") || tasks.length > 0)
    ) {
        hits.push({
            service: "custom_tool",
            reason: labelFor("tools_systems", picks.includes("custom") ? "custom" : "specialized", locale),
            weight: 2,
        });
    }

    return hits;
}

export function buildServiceSections(input: {
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>;
    automationInterest: AutomationInterest;
    fitChecks: Record<string, FitCheckState>;
    prioritySections?: Array<AreaId | "none_priority">;
    ambitionAreas?: Iterable<AreaId>;
    locale?: string;
}): ServiceSectionCard[] {
    const mapping = getMapping();
    const locale = input.locale || "fr";
    const prioritySet = new Set((input.prioritySections || []).filter((id) => id !== "none_priority") as AreaId[]);
    const ambitionSet = new Set(input.ambitionAreas || []);
    const cards: ServiceSectionCard[] = [];
    const signalByArea: Partial<Record<AreaId, PrioritySignals>> = {};

    const areaIds = new Set<AreaId>([...(Object.keys(input.areaAnswers) as AreaId[]), ...([...prioritySet] as AreaId[])]);

    for (const areaId of areaIds) {
        const map = mapping[areaId];
        if (!map) continue;
        const picks = selected(areaId, input.areaAnswers);
        const hasAutoBridge =
            (input.automationInterest.tasks || []).some((t) => t !== "none" && t !== "other") &&
            (areaId === "work_operations" || areaId === "information_ways" || areaId === "tools_systems" || areaId === "finance_profitability");
        if (picks.length === 0 && !hasAutoBridge && input.fitChecks.tools_fit?.state !== "fit_gap") {
            continue;
        }

        const evidence = collectEvidence({
            areaId,
            areaAnswers: input.areaAnswers,
            automationInterest: input.automationInterest,
            fitChecks: input.fitChecks,
            locale,
        });
        if (evidence.length === 0) continue;

        const byService = new Map<ProspectServiceId, { score: number; reasons: string[] }>();
        for (const hit of evidence) {
            if (!map.services.includes(hit.service)) continue;
            // Guardrails
            if (hit.service === "online_presence" && areaId !== "sales_growth" && areaId !== "clients_service") {
                continue;
            }
            if (hit.service === "custom_tool" && hit.weight < 2) continue;
            const prev = byService.get(hit.service) || { score: 0, reasons: [] };
            prev.score += hit.weight;
            if (!prev.reasons.includes(hit.reason) && prev.reasons.length < 3) {
                prev.reasons.push(hit.reason);
            }
            byService.set(hit.service, prev);
        }

        const ranked = [...byService.entries()]
            .filter(([, v]) => v.score > 0)
            .sort((a, b) => b[1].score - a[1].score)
            .slice(0, 3);

        if (ranked.length === 0) continue;

        let score = ranked.reduce((sum, [, v]) => sum + v.score, 0);
        if (prioritySet.has(areaId)) score += 4;

        const why = ranked.flatMap(([, v]) => v.reasons).slice(0, 3);
        const serviceIds = ranked.map(([id]) => id);

        cards.push({
            areaId,
            title: pickLocalized(map as Record<string, unknown>, "label", locale) || map.label_fr,
            services: ranked.map(([id]) => ({
                id,
                label: serviceLabel(id, locale),
            })),
            why,
            score,
        });

        signalByArea[areaId] = {
            areaId,
            confirmedCount: picks.length,
            bestTier: picks.length > 0 ? "observed" : hasAutoBridge ? "emerging" : "suggested",
            services: serviceIds,
            ambitionAligned: ambitionSet.has(areaId) || prioritySet.has(areaId),
            evidenceScore: score,
        };
    }

    return assignPriorityBands(cards.sort((a, b) => b.score - a.score).slice(0, MAX_SECTION_CARDS), locale, signalByArea);
}

export function buildServiceSectionsFromPossibilities(input: {
    selected: SelectedPossibility[];
    /** When nothing selected, show top suggested candidates as soft “à considérer”. */
    fallbackCandidates?: PossibilityCandidate[];
    /** Used to recover observed / emerging / suggested tiers for ranking. */
    allCandidates?: PossibilityCandidate[];
    ambitionAreas?: Iterable<AreaId>;
    locale?: string;
}): ServiceSectionCard[] {
    const locale = input.locale || "fr";
    const ambitionSet = new Set(input.ambitionAreas || []);
    const fromSelection = input.selected.length > 0;
    const tierById = candidateTierById(input.allCandidates || input.fallbackCandidates);
    const source = fromSelection
        ? input.selected
        : (input.fallbackCandidates || []).slice(0, 5).map((c) => ({
              id: c.id,
              possibilityId: c.possibilityId,
              areaId: c.areaId,
              label: c.label,
              sectionLabel: c.sectionLabel,
              services: c.services,
          }));

    const byArea = new Map<
        AreaId,
        {
            title: string;
            services: Map<ProspectServiceId, number>;
            why: string[];
            score: number;
            confirmedCount: number;
            bestTier: PossibilitySourceTier | null;
        }
    >();

    for (const item of source) {
        const existing = byArea.get(item.areaId) || {
            title: item.sectionLabel,
            services: new Map<ProspectServiceId, number>(),
            why: [] as string[],
            score: 0,
            confirmedCount: 0,
            bestTier: null as PossibilitySourceTier | null,
        };
        existing.score += 3;
        if (fromSelection) existing.confirmedCount += 1;
        const tier = tierById.get(item.id) || (fromSelection ? "emerging" : "suggested");
        existing.bestTier = betterTier(existing.bestTier, tier);
        if (existing.why.length < 4 && !existing.why.includes(item.label)) {
            existing.why.push(item.label);
        }
        for (const service of item.services) {
            // Prefer internal_tool over repeating custom_tool unless both present
            existing.services.set(service, (existing.services.get(service) || 0) + 1);
        }
        byArea.set(item.areaId, existing);
    }

    const cards: ServiceSectionCard[] = [];
    const signalByArea: Partial<Record<AreaId, PrioritySignals>> = {};
    for (const [areaId, data] of byArea) {
        const ranked = [...data.services.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([id]) => ({ id, label: serviceLabel(id, locale) }));
        if (ranked.length === 0) continue;
        cards.push({
            areaId,
            title: data.title,
            services: ranked,
            why: data.why,
            score: data.score,
        });
        signalByArea[areaId] = {
            areaId,
            confirmedCount: data.confirmedCount,
            bestTier: data.bestTier,
            services: ranked.map((s) => s.id),
            ambitionAligned: ambitionSet.has(areaId),
            evidenceScore: data.score,
        };
    }

    return assignPriorityBands(cards.sort((a, b) => b.score - a.score).slice(0, MAX_SECTION_CARDS), locale, signalByArea);
}

export function prospectServiceLabel(id: ProspectServiceId, locale?: string): string {
    return serviceLabel(id, locale);
}
