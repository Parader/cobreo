import {
    ambitionLabel,
    areaLabel,
    getCapabilityToLenses,
    getOpportunityTemplates,
    getScanAnswers,
} from "@/content/diagnostic/v7/catalog";
import type {
    AmbitionId,
    AmbitionsState,
    AreaAnswerValue,
    AreaId,
    AutomationInterest,
    CompanyContext,
    ConfirmationAnswers,
    CoverageState,
    DiagnosticV7Result,
    FitCheckState,
    FreeTextState,
    GeneratedOpportunity,
    LensId,
} from "@/content/diagnostic/v7/types";
import { isSoloCompany, resolveCapabilities } from "./coverage";
import { buildServiceSections, buildServiceSectionsFromPossibilities } from "./services";
import { buildPossibilityCandidates, resolveSelectedPossibilities } from "./possibilities";
import type { PossibilityCandidate, SelectedPossibility } from "@/content/diagnostic/v7/types";

function isEnglish(locale?: string) {
    return locale === "en";
}

type ScoreInput = {
    companyContext: CompanyContext;
    ambitions: AmbitionsState;
    applicableAreas: AreaId[];
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>;
    confirmationAnswers: ConfirmationAnswers;
    fitChecks: Record<string, FitCheckState>;
    automationInterest: AutomationInterest;
    prioritySections?: Array<AreaId | "none_priority">;
    selectedPossibilities?: Array<string | "none_selected">;
    freeText?: FreeTextState;
    locale?: string;
};

function declaredList(ambitions: AmbitionsState): AmbitionId[] {
    return (ambitions.declared || []).filter((id) => id !== "other");
}

function ambitionAligned(declared: AmbitionId[], lenses: LensId[]): boolean {
    const meaningful = declared.filter((id) => id !== "nothing_specific");
    if (meaningful.length === 0) return false;
    const map: Partial<Record<AmbitionId, LensId[]>> = {
        find_clients: ["customer_experience", "operations", "automation"],
        convert_requests: ["customer_experience", "automation", "operations"],
        grow_existing_customers: ["customer_experience", "information", "operations"],
        grow_sales: ["customer_experience", "operations", "automation"],
        improve_client_experience: ["customer_experience", "information"],
        save_time: ["operations", "automation", "information"],
        organize_work: ["operations", "information", "automation"],
        improve_team: ["operations", "information"],
        better_decisions: ["decision_support", "information"],
        improve_profitability: ["decision_support", "information", "operations"],
        improve_offer: ["information", "customer_experience", "operations"],
        prepare_growth: ["operations", "information", "automation"],
        use_information_better: ["information", "decision_support", "automation"],
        improve_tools: ["operations", "information", "automation", "tailored_tools"],
    };
    return meaningful.some((ambition) => {
        const wanted = map[ambition] || [];
        return lenses.some((l) => wanted.includes(l));
    });
}

function humanCapability(capability: string, en: boolean): string {
    const fr: Record<string, string> = {
        revenue_visibility: "la visibilité sur les revenus",
        profitability_visibility: "la visibilité sur la rentabilité",
        cash_visibility: "la visibilité sur la trésorerie",
        sales_visibility: "le suivi des ventes",
        operations_visibility: "la visibilité sur les travaux en cours",
        customer_feedback_visibility: "les retours clients",
        customer_feedback: "les retours clients",
        team_performance_visibility: "la performance d’équipe",
        rd_visibility: "le suivi des essais",
        time_tracking: "le suivi du temps",
        sales_followup: "le suivi des ventes",
        conversion_path: "le parcours de conversion",
        information_reuse: "la réutilisation de l’information",
        client_history: "l’historique client",
        work_progress: "l’avancement du travail",
        process_documentation: "la documentation des façons de faire",
        tool_fit_gap: "l’adéquation des outils",
        lead_visibility: "la visibilité sur les demandes",
        inquiry_intake: "la prise en charge des demandes",
        offer_clarity: "la clarté de l’offre",
    };
    const enMap: Record<string, string> = {
        revenue_visibility: "revenue visibility",
        profitability_visibility: "profitability visibility",
        cash_visibility: "cash visibility",
        sales_visibility: "sales tracking",
        operations_visibility: "work-in-progress visibility",
        customer_feedback_visibility: "customer feedback",
        customer_feedback: "customer feedback",
        team_performance_visibility: "team performance visibility",
        rd_visibility: "test/result tracking",
        time_tracking: "time tracking",
        sales_followup: "sales follow-up",
        conversion_path: "conversion path",
        information_reuse: "information reuse",
        client_history: "client history",
        work_progress: "work progress",
        process_documentation: "process documentation",
        tool_fit_gap: "tool fit",
        lead_visibility: "lead visibility",
        inquiry_intake: "inquiry intake",
        offer_clarity: "offer clarity",
    };
    return (en ? enMap[capability] : fr[capability]) || capability.replaceAll("_", " ");
}

function hasAnswer(areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>, areaId: AreaId, answerId: string) {
    return (areaAnswers[areaId] || []).includes(answerId);
}

function triggerMatches(
    trigger: string,
    input: {
        areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>;
        automationInterest: AutomationInterest;
        capabilities: Record<string, CoverageState>;
        declared: AmbitionId[];
        companyContext: CompanyContext;
    },
): boolean {
    if (trigger === "cross_signal:hours_plus_profitability_ambition") {
        return (
            hasAnswer(input.areaAnswers, "team_people", "hours") &&
            input.declared.includes("improve_profitability") &&
            !isSoloCompany(input.companyContext.company_size)
        );
    }
    if (trigger.startsWith("scan_simplification.")) {
        const task = trigger.split(".")[1];
        return (input.automationInterest.tasks || []).includes(task);
    }
    const [left, right] = trigger.split(".");
    if (!left || !right) return false;
    if (right.includes(":")) {
        const [answerOrCap, state] = right.split(":");
        if (state === "potentially_uncovered") {
            const scan = getScanAnswers(left as AreaId).find(
                (a) => a.id === answerOrCap || a.capability === answerOrCap,
            );
            const capability = scan?.capability || answerOrCap;
            return input.capabilities[capability] === "potentially_uncovered";
        }
        return false;
    }
    if (left === "scan_simplification") {
        return (input.automationInterest.tasks || []).includes(right);
    }
    return hasAnswer(input.areaAnswers, left as AreaId, right);
}

function templateWhatWeSee(
    templateId: string,
    template: { what_we_see_fr?: string },
    en: boolean,
): string {
    if (template.what_we_see_fr && !en) return template.what_we_see_fr;
    const enCopy: Record<string, string> = {
        team_hours: "You already track team hours.",
        documentation_gap: "You indicated that some important ways of working are lightly documented.",
        work_visibility: "You indicated it is not always easy to see where files, jobs or orders stand.",
        information_reentry: "You indicated that some information is copied or entered more than once.",
        customer_feedback_gap:
            "Customer feedback may not yet be collected in a structured way — this remains a possibility to verify.",
        profitability_visibility:
            "From what you shared, a clearer view of what drives profitability could be useful.",
    };
    if (en) return enCopy[templateId] || template.what_we_see_fr || "";
    if (templateId === "customer_feedback_gap") {
        return "Les retours clients ne semblent pas encore clairement structurés — à confirmer selon votre réalité.";
    }
    if (templateId === "profitability_visibility") {
        return "D’après ce que vous avez partagé, une vue plus claire de ce qui contribue à la rentabilité pourrait être utile.";
    }
    return template.what_we_see_fr || "";
}

function buildFromTemplate(input: {
    templateId: string;
    declared: AmbitionId[];
    prioritized: boolean;
    areaId?: AreaId;
    locale?: string;
}): GeneratedOpportunity | null {
    const templates = getOpportunityTemplates().examples;
    const template = templates[input.templateId];
    if (!template) return null;
    const en = isEnglish(input.locale);
    const lenses = template.cobreo_lenses as LensId[];
    const aligned = ambitionAligned(input.declared, lenses);
    const confidence =
        input.prioritized && aligned ? "high" : input.prioritized || aligned ? "medium" : "medium";

    return {
        id: `tpl_${input.templateId}`,
        type: input.templateId.includes("gap") || input.templateId.includes("visibility")
            ? "coverage_expansion"
            : "improvement",
        title: template.title_fr,
        whatWeSee: templateWhatWeSee(input.templateId, template, en),
        whatCouldImprove: template.what_could_improve_fr,
        whatItCouldBring: template.what_it_could_bring_fr,
        whatWeCouldExplore: template.what_we_could_explore_together_fr,
        possibilities: template.possibilities_fr,
        lenses: lenses.filter((l) => l !== "tailored_tools").slice(0, 3),
        confidence,
        areaId: input.areaId,
        capability: input.templateId,
        why: input.prioritized
            ? en
                ? "You marked this part of the business as worth improving."
                : "Vous avez indiqué que cette partie de l’entreprise valait la peine d’être améliorée."
            : aligned
              ? en
                  ? "This connects to what you want to move forward on."
                  : "Cela rejoint ce que vous souhaitez faire progresser."
              : en
                ? "Supported by what you selected during discovery."
                : "Appuyé par ce que vous avez sélectionné pendant la découverte.",
        potentialGain: confidence === "high" ? "important" : "moderate",
        whatWeNoticed: [templateWhatWeSee(input.templateId, template, en)],
        opportunity: template.what_could_improve_fr,
    };
}

function templateArea(templateId: string): AreaId | undefined {
    const map: Record<string, AreaId> = {
        team_hours: "team_people",
        documentation_gap: "information_ways",
        work_visibility: "work_operations",
        information_reentry: "information_ways",
        customer_feedback_gap: "clients_service",
        profitability_visibility: "finance_profitability",
    };
    return map[templateId];
}

function addAutomationOpportunity(
    automationInterest: AutomationInterest,
    declared: AmbitionId[],
    prioritized: boolean,
    locale?: string,
): GeneratedOpportunity | null {
    const tasks = (automationInterest.tasks || []).filter((t) => t !== "none" && t !== "other");
    // Prefer the concrete information_reentry template when copy_transfer is selected
    if (tasks.includes("copy_transfer")) return null;
    if (tasks.length === 0) return null;
    const en = isEnglish(locale);
    const confident = tasks.length >= 2 || prioritized;
    return {
        id: "automation_interest",
        type: "optimization_without_pain",
        title: en ? "Simplify repetitive work" : "Simplifier le travail répétitif",
        whatWeSee: en
            ? `You pointed to concrete tasks (${tasks.slice(0, 3).join(", ")}).`
            : `Vous avez nommé des tâches concrètes (${tasks.slice(0, 3).join(", ")}).`,
        whatCouldImprove: en
            ? "Some predictable tasks could be streamlined without treating current work as a problem."
            : "Certaines tâches prévisibles pourraient être simplifiées sans traiter le travail actuel comme un problème.",
        whatItCouldBring: en
            ? "Less manual effort on recurring steps and clearer day-to-day follow-through."
            : "Moins d’effort manuel sur les étapes récurrentes et un suivi du quotidien plus clair.",
        whatWeCouldExplore: en
            ? "Look at which steps are worth simplifying first, and whether current tools can absorb them."
            : "Regarder quelles étapes valent la peine d’être simplifiées en premier, et si vos outils actuels peuvent les absorber.",
        possibilities: en
            ? ["Reminders", "Templates", "Targeted automation", "Process simplification"]
            : ["Rappels", "Modèles", "Automatisation ciblée", "Simplification du processus"],
        lenses: ["automation", "operations"],
        confidence: confident ? "high" : "medium",
        areaId: "work_operations",
        capability: "automation_interest",
        why: en
            ? `You pointed to concrete tasks (${tasks.slice(0, 3).join(", ")}).`
            : `Vous avez nommé des tâches concrètes (${tasks.slice(0, 3).join(", ")}).`,
        potentialGain: confident ? "important" : "moderate",
        whatWeNoticed: [
            en
                ? "Simplification opportunities were selected directly."
                : "Des possibilités de simplification ont été sélectionnées directement.",
        ],
        opportunity: en
            ? "Some predictable tasks could be streamlined without treating current work as a problem."
            : "Certaines tâches prévisibles pourraient être simplifiées sans traiter le travail actuel comme un problème.",
    };
}

function addFitGapOpportunity(
    fitChecks: Record<string, FitCheckState>,
    declared: AmbitionId[],
    locale?: string,
): GeneratedOpportunity | null {
    if (fitChecks.tools_fit?.state !== "fit_gap") return null;
    const en = isEnglish(locale);
    const lenses = (getCapabilityToLenses().tool_fit_gap || ["operations", "information"]) as LensId[];
    const includeTailored =
        declared.includes("save_time") ||
        declared.includes("improve_tools") ||
        declared.includes("use_information_better") ||
        declared.includes("prepare_growth");
    return {
        id: "tools_fit_gap",
        type: "fit_gap",
        title: en ? "Better fit between tools and work" : "Mieux aligner outils et travail",
        whatWeSee: en
            ? "You indicated the tools do not fully meet your needs today."
            : "Vous avez indiqué que les outils ne répondent pas pleinement à vos besoins aujourd’hui.",
        whatCouldImprove: en
            ? "Reduce friction between how work actually happens and what the tools support."
            : "Réduire les frictions entre la façon dont le travail se fait et ce que les outils supportent.",
        whatItCouldBring: en
            ? "Fewer workarounds, clearer handoffs, and tools that match real workflows."
            : "Moins de contournements, des passages de relais plus clairs et des outils alignés sur le réel.",
        whatWeCouldExplore: en
            ? "Review which steps the current stack covers well, and where a simpler connection or adaptation would help."
            : "Regarder quelles étapes votre stack couvre bien, et où une connexion ou adaptation plus simple aiderait.",
        possibilities: en
            ? ["Configuration", "Integrations", "Process simplification", "Tailored tool if justified"]
            : ["Configuration", "Intégrations", "Simplification du processus", "Outil adapté si justifié"],
        lenses: includeTailored
            ? (["operations", "information", "tailored_tools"] as LensId[])
            : lenses.filter((l) => l !== "tailored_tools").slice(0, 2),
        confidence: "medium",
        areaId: "tools_systems",
        capability: "tool_fit_gap",
        why: en
            ? "You indicated the tools do not fully meet your needs today."
            : "Vous avez indiqué que les outils ne répondent pas pleinement à vos besoins aujourd’hui.",
        potentialGain: "moderate",
        whatWeNoticed: [
            en ? "Tool fit was rated as partial or insufficient." : "L’adéquation des outils a été jugée partielle ou insuffisante.",
        ],
        opportunity: en
            ? "Your current tools only partly cover how you work — there may be room to simplify or connect steps."
            : "Vos outils couvrent seulement en partie votre façon de travailler — il peut y avoir place à simplifier ou mieux relier les étapes.",
    };
}

function collectStrengths(
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>,
    capabilities: Record<string, CoverageState>,
    locale?: string,
): string[] {
    const en = isEnglish(locale);
    const strengths: string[] = [];
    for (const [capability, state] of Object.entries(capabilities)) {
        if (state !== "covered" && state !== "covered_unknown_fit" && state !== "covered_good_fit") continue;
        if (capability === "tool_fit_gap") continue;
        strengths.push(
            en
                ? `${humanCapability(capability, true)} already looks covered.`
                : `${humanCapability(capability, false)} semble déjà couvert.`,
        );
        if (strengths.length >= 4) break;
    }
    if (strengths.length === 0) {
        for (const [areaId, answers] of Object.entries(areaAnswers) as [AreaId, AreaAnswerValue][]) {
            const covered = answers.filter((id) => {
                const opt = getScanAnswers(areaId).find((a) => a.id === id);
                return opt?.capability && !opt.exclusive;
            });
            if (covered.length >= 2) {
                strengths.push(
                    en
                        ? `${areaLabel(areaId, "en")} shows several practices already in place.`
                        : `${areaLabel(areaId, "fr")} montre plusieurs pratiques déjà en place.`,
                );
            }
            if (strengths.length >= 3) break;
        }
    }
    return strengths.slice(0, 4);
}

function collectNoticed(
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>,
    ambitions: AmbitionsState,
    locale?: string,
): string[] {
    const en = isEnglish(locale);
    const items: string[] = [];
    const declared = declaredList(ambitions).filter((id) => id !== "nothing_specific");
    if (declared.length > 0) {
        items.push(
            en
                ? `Ambitions stated: ${declared.map((id) => ambitionLabel(id, "en")).join(", ")}.`
                : `Ambitions indiquées : ${declared.map((id) => ambitionLabel(id, "fr")).join(", ")}.`,
        );
    }
    for (const [areaId, answers] of Object.entries(areaAnswers) as [AreaId, AreaAnswerValue][]) {
        if (!answers?.length) continue;
        const labels = answers
            .slice(0, 3)
            .map((id) => getScanAnswers(areaId).find((a) => a.id === id)?.label_fr || id);
        items.push(
            en
                ? `${areaLabel(areaId, "en")}: ${labels.join(", ")}.`
                : `${areaLabel(areaId, "fr")} : ${labels.join(", ")}.`,
        );
        if (items.length >= 6) break;
    }
    return items;
}

function confidenceRank(c: GeneratedOpportunity["confidence"]) {
    return c === "high" ? 3 : c === "medium" ? 2 : 1;
}

function findAreaForCapability(
    capability: string,
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>,
): AreaId | undefined {
    for (const areaId of Object.keys(areaAnswers) as AreaId[]) {
        if (getScanAnswers(areaId).some((a) => a.capability === capability)) return areaId;
    }
    if (capability.includes("sales") || capability.includes("lead") || capability.includes("inquiry")) {
        return "sales_growth";
    }
    if (capability.includes("customer") || capability.includes("client")) return "clients_service";
    if (capability.includes("team") || capability.includes("time")) return "team_people";
    if (capability.includes("profit") || capability.includes("cash")) return "finance_profitability";
    if (capability.includes("tool")) return "tools_systems";
    return undefined;
}

export function generateDiagnosticResult(input: ScoreInput): DiagnosticV7Result {
    const locale = input.locale;
    const en = isEnglish(locale);
    const declared = declaredList(input.ambitions);
    const prioritySet = new Set(input.prioritySections || []);
    const nonePriority = prioritySet.has("none_priority");
    const effectivePriorities = nonePriority
        ? ([] as AreaId[])
        : ([...prioritySet].filter((id) => id !== "none_priority") as AreaId[]);

    const capabilities = resolveCapabilities({
        areaAnswers: input.areaAnswers,
        confirmationAnswers: input.confirmationAnswers,
        fitChecks: input.fitChecks,
    });

    const candidates: GeneratedOpportunity[] = [];
    const templates = getOpportunityTemplates().examples;

    for (const templateId of Object.keys(templates)) {
        const template = templates[templateId];
        const matched = template.trigger_examples.some((trigger) =>
            triggerMatches(trigger, {
                areaAnswers: input.areaAnswers,
                automationInterest: input.automationInterest,
                capabilities,
                declared,
                companyContext: input.companyContext,
            }),
        );
        if (!matched) continue;

        const areaId = templateArea(templateId);
        const prioritized = areaId ? effectivePriorities.includes(areaId) : false;
        const aligned = ambitionAligned(declared, template.cobreo_lenses as LensId[]);
        const triggerCtx = {
            areaAnswers: input.areaAnswers,
            automationInterest: input.automationInterest,
            capabilities,
            declared,
            companyContext: input.companyContext,
        };

        // Non-selection / soft gaps need ambition alignment or prioritization
        if (templateId === "customer_feedback_gap" && !prioritized && !aligned) continue;
        if (templateId === "profitability_visibility") {
            const hasCross = triggerMatches("cross_signal:hours_plus_profitability_ambition", triggerCtx);
            if (!hasCross && !prioritized && !aligned) continue;
        }

        const opp = buildFromTemplate({
            templateId,
            declared,
            prioritized,
            areaId,
            locale,
        });
        if (opp) {
            if (prioritized) opp.confidence = "high";
            candidates.push(opp);
        }
    }

    const autoPrioritized =
        effectivePriorities.includes("work_operations") ||
        effectivePriorities.includes("information_ways") ||
        effectivePriorities.includes("tools_systems");
    const automation = addAutomationOpportunity(
        input.automationInterest,
        declared,
        autoPrioritized,
        locale,
    );
    if (automation) {
        if (autoPrioritized) automation.confidence = "high";
        candidates.push(automation);
    }

    const fitGap = addFitGapOpportunity(input.fitChecks, declared, locale);
    if (fitGap) candidates.push(fitGap);

    // Concrete fallback from prioritized section signals (never “Faire progresser {section}”)
    for (const areaId of effectivePriorities) {
        if (candidates.some((c) => c.areaId === areaId && c.confidence !== "low")) continue;
        const answers = input.areaAnswers[areaId] || [];
        const opts = answers
            .map((id) => getScanAnswers(areaId).find((a) => a.id === id))
            .filter((o) => o && !o.exclusive && o.id !== "other" && o.id !== "working_well")
            .slice(0, 2);
        if (opts.length === 0) continue;
        const activity = opts[0]!.label_fr;
        candidates.push({
            id: `priority_${areaId}`,
            type: "improvement",
            title: en
                ? `Make “${activity}” clearer day to day`
                : `Rendre « ${activity} » plus clair au quotidien`,
            whatWeSee: en
                ? `You selected this in ${areaLabel(areaId, "en")}: ${opts.map((o) => o!.label_fr).join(", ")}.`
                : `Vous avez sélectionné ceci dans ${areaLabel(areaId, "fr")} : ${opts.map((o) => o!.label_fr).join(", ")}.`,
            whatCouldImprove: en
                ? `Improve how “${activity}” works in daily practice.`
                : `Améliorer la façon dont « ${activity} » fonctionne dans la pratique quotidienne.`,
            whatItCouldBring: en
                ? "Clearer follow-through and less friction on a step you already care about."
                : "Un suivi plus clair et moins de friction sur une étape qui vous tient déjà à cœur.",
            whatWeCouldExplore: en
                ? "Look at the simplest way to strengthen this step without reinventing everything."
                : "Regarder la façon la plus simple de renforcer cette étape sans tout réinventer.",
            possibilities: en
                ? ["Process simplification", "Better visibility", "Targeted automation"]
                : ["Simplification du processus", "Meilleure visibilité", "Automatisation ciblée"],
            lenses: (getCapabilityToLenses()[opts[0]!.capability || ""] || ["operations"]).slice(0, 3) as LensId[],
            confidence: "high",
            areaId,
            capability: opts[0]!.capability,
            why: en
                ? "You marked this business section as worth improving."
                : "Vous avez indiqué que cette section de l’entreprise valait la peine d’être améliorée.",
            potentialGain: "important",
            whatWeNoticed: opts.map((o) => o!.label_fr),
            opportunity: en
                ? `Improve how “${activity}” works in daily practice.`
                : `Améliorer la façon dont « ${activity} » fonctionne dans la pratique quotidienne.`,
        });
    }

    const byId = new Map<string, GeneratedOpportunity>();
    for (const opp of candidates) {
        const prev = byId.get(opp.id);
        if (!prev || confidenceRank(opp.confidence) > confidenceRank(prev.confidence)) {
            byId.set(opp.id, opp);
        }
    }

    const all = [...byId.values()].sort((a, b) => {
        const aPri = a.areaId && effectivePriorities.includes(a.areaId) ? 1 : 0;
        const bPri = b.areaId && effectivePriorities.includes(b.areaId) ? 1 : 0;
        const aTpl = a.id.startsWith("tpl_") ? 1 : 0;
        const bTpl = b.id.startsWith("tpl_") ? 1 : 0;
        return (
            bTpl - aTpl ||
            bPri - aPri ||
            confidenceRank(b.confidence) - confidenceRank(a.confidence)
        );
    });

    const prioritizedMain = all.filter(
        (o) =>
            (o.confidence === "high" || o.confidence === "medium") &&
            o.areaId &&
            effectivePriorities.includes(o.areaId),
    );
    const otherMain = all.filter(
        (o) =>
            (o.confidence === "high" || o.confidence === "medium") &&
            !prioritizedMain.some((p) => p.id === o.id),
    );
    const main = [...prioritizedMain, ...otherMain].slice(0, 3);

    const exploratory =
        all.find(
            (o) =>
                !main.some((m) => m.id === o.id) &&
                (o.confidence === "medium" || o.confidence === "high") &&
                !(o.areaId && effectivePriorities.includes(o.areaId)),
        ) || null;

    const strengths = collectStrengths(input.areaAnswers, capabilities, locale);
    const whatWeNoticed = collectNoticed(input.areaAnswers, input.ambitions, locale);
    const areasExplored = Object.keys(input.areaAnswers) as AreaId[];

    const possibilityCandidates = buildPossibilityCandidates({
        companyContext: input.companyContext,
        declared,
        areaAnswers: input.areaAnswers,
        automationInterest: input.automationInterest,
        locale,
    });
    const selectedResolved = resolveSelectedPossibilities(
        input.selectedPossibilities || [],
        possibilityCandidates,
    );
    const declinedAll = (input.selectedPossibilities || []).includes("none_selected");

    const serviceSections =
        selectedResolved.length > 0 || declinedAll
            ? buildServiceSectionsFromPossibilities({
                  selected: selectedResolved,
                  fallbackCandidates: declinedAll ? possibilityCandidates : undefined,
              })
            : buildServiceSectionsFromPossibilities({
                  selected: [],
                  fallbackCandidates: possibilityCandidates,
              });

    // Fallback to legacy evidence if library somehow empty
    const finalSections =
        serviceSections.length > 0
            ? serviceSections
            : buildServiceSections({
                  areaAnswers: input.areaAnswers,
                  automationInterest: input.automationInterest,
                  fitChecks: input.fitChecks,
                  prioritySections: input.prioritySections,
              });

    const hasCredibleOpportunity = true; // v8 never concludes “no opportunity”

    const priorityAreas = [
        ...new Set(
            (selectedResolved.length > 0 ? selectedResolved : possibilityCandidates.slice(0, 3)).map(
                (p) => p.areaId,
            ),
        ),
    ] as AreaId[];

    const prioritySections = priorityAreas.map((areaId) => {
        const answers = input.areaAnswers[areaId] || [];
        const signals = answers
            .map((id) => getScanAnswers(areaId).find((a) => a.id === id)?.label_fr)
            .filter(Boolean)
            .slice(0, 3) as string[];
        return {
            areaId,
            title: areaLabel(areaId, locale),
            signals,
        };
    });

    // Spec 8.3: results are an analysis, not a receipt of the selected topics, so the
    // default case falls back to the spec page intro instead of echoing the selection.
    let message: string | undefined;
    if (declinedAll) {
        message = en
            ? "Even if nothing is a priority for you right now, some possibilities may still be worth keeping in mind."
            : "Même si aucun sujet n’est une priorité pour vous en ce moment, certaines possibilités peuvent rester utiles à garder en tête.";
    } else if (en) {
        message =
            "Here are the improvement possibilities best supported by your answers, and why they deserve your attention.";
    }

    return {
        declaredAmbitions: declared,
        message,
        serviceSections: finalSections,
        prioritySections,
        selectedPossibilities: selectedResolved,
        opportunities: main,
        exploratory,
        strengths,
        whatWeNoticed,
        areasExplored,
        hasCredibleOpportunity,
    };
}

export function summarizeResult(result: DiagnosticV7Result, locale?: string): string {
    const en = isEnglish(locale);
    if (!result.hasCredibleOpportunity) {
        return en
            ? "Diagnostic complete — no urgent opportunity highlighted."
            : "Diagnostic terminé — aucune opportunité urgente mise de l’avant.";
    }
    if (result.serviceSections?.length) {
        const titles = result.serviceSections.map((s) => s.title).join("; ");
        return en
            ? `Sections highlighted: ${titles}`
            : `Sections mises de l’avant : ${titles}`;
    }
    const titles = result.opportunities.map((o) => o.title).join("; ");
    return en
        ? `Opportunities highlighted: ${titles}`
        : `Possibilités mises de l’avant : ${titles}`;
}

// Keep helper referenced for capability-area lookups in future soft gaps
void findAreaForCapability;
