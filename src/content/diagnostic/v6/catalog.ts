import { diagnosticSpec } from "./types";
import type { PriorityId, ProgressStageId, TopicId } from "./types";
import { isEnglishLocale, pickLocalized } from "@/lib/diagnostic/localize";

export type SpecContextQuestion = (typeof diagnosticSpec.context)[number];
export type SpecRealityQuestion = (typeof diagnosticSpec.reality_questions)[number];
export type SpecScanQuestion = (typeof diagnosticSpec.operational_scan.questions)[number];

export function getContextQuestions(): SpecContextQuestion[] {
    return diagnosticSpec.context;
}

export function getPrioritySpec() {
    return diagnosticSpec.current_priority;
}

export function getRealityQuestions(): SpecRealityQuestion[] {
    return diagnosticSpec.reality_questions;
}

export function getRealityQuestion(id: string): SpecRealityQuestion | undefined {
    return getRealityQuestions().find((q) => q.id === id);
}

export function getOperationalScan() {
    return diagnosticSpec.operational_scan;
}

export function getScanQuestion(id: string): SpecScanQuestion | undefined {
    return getOperationalScan().questions.find((q) => q.id === id);
}

export function getMeasurementModel() {
    return diagnosticSpec.measurement_model;
}

/** Concrete referents for measurement templates (never ambiguous pronouns). */
export type MeasurementActivityLabels = {
    frequency_clause_fr: string;
    effort_subject_fr: string;
    improvement_object_fr: string;
    frequency_clause_en: string;
    effort_subject_en: string;
    improvement_object_en: string;
};

export function getMeasurementActivityLabels(
    targetId: string,
    options?: { manualTypes?: string[] },
): MeasurementActivityLabels {
    if (targetId === "scan_manual" && options?.manualTypes?.includes("prepare_docs")) {
        return {
            frequency_clause_fr: "préparez-vous ces documents",
            effort_subject_fr: "Préparer ces documents",
            improvement_object_fr: "la préparation de ces documents",
            frequency_clause_en: "do you prepare these documents",
            effort_subject_en: "Preparing these documents",
            improvement_object_en: "preparing these documents",
        };
    }
    const defaults: Record<string, MeasurementActivityLabels> = {
        offer_testing: {
            frequency_clause_fr: "faites-vous le suivi de vos essais",
            effort_subject_fr: "Comparer et retrouver vos essais",
            improvement_object_fr: "le suivi de vos essais",
            frequency_clause_en: "do you track your experiments",
            effort_subject_en: "Comparing and finding your experiments",
            improvement_object_en: "how you track your experiments",
        },
        product_information: {
            frequency_clause_fr: "présentez-vous votre offre",
            effort_subject_fr: "Présenter votre offre",
            improvement_object_fr: "la présentation de votre offre",
            frequency_clause_en: "do you present your offer",
            effort_subject_en: "Presenting your offer",
            improvement_object_en: "how you present your offer",
        },
        scan_manual: {
            frequency_clause_fr: "faites-vous ces tâches manuelles",
            effort_subject_fr: "Faire ces tâches manuelles",
            improvement_object_fr: "ces tâches manuelles",
            frequency_clause_en: "do you do these manual tasks",
            effort_subject_en: "Doing these manual tasks",
            improvement_object_en: "these manual tasks",
        },
        scan_handoffs: {
            frequency_clause_fr: "gérez-vous les allers-retours entre outils",
            effort_subject_fr: "Gérer les allers-retours entre outils",
            improvement_object_fr: "la gestion des allers-retours entre outils",
            frequency_clause_en: "do you handle back-and-forth between tools",
            effort_subject_en: "Handling back-and-forth between tools",
            improvement_object_en: "handling back-and-forth between tools",
        },
        scan_followup: {
            frequency_clause_fr: "suivez-vous les prochaines étapes de mémoire",
            effort_subject_fr: "Suivre les prochaines étapes de mémoire",
            improvement_object_fr: "la façon dont vous suivez les prochaines étapes",
            frequency_clause_en: "do you track next steps from memory",
            effort_subject_en: "Tracking next steps from memory",
            improvement_object_en: "how you track next steps",
        },
        scan_visibility: {
            frequency_clause_fr: "retrouvez-vous où en sont les travaux",
            effort_subject_fr: "Retrouver où en sont les travaux",
            improvement_object_fr: "la visibilité sur les travaux en cours",
            frequency_clause_en: "do you find where work stands",
            effort_subject_en: "Finding where work stands",
            improvement_object_en: "visibility into work in progress",
        },
    };
    return (
        defaults[targetId] ?? {
            frequency_clause_fr: "faites-vous cette activité",
            effort_subject_fr: "Cette activité",
            improvement_object_fr: "cette activité",
            frequency_clause_en: "do you do this activity",
            effort_subject_en: "This activity",
            improvement_object_en: "this activity",
        }
    );
}

export function renderMeasurementQuestion(
    scale: "frequency" | "effort" | "desire",
    labels: MeasurementActivityLabels,
    locale: string = "fr",
): string {
    const copyGen = (
        getMeasurementModel() as {
            copy_generation?: {
                templates?: {
                    frequency?: string;
                    effort?: string;
                    desire_to_improve?: string;
                };
                templates_en?: {
                    frequency?: string;
                    effort?: string;
                    desire_to_improve?: string;
                };
            };
        }
    ).copy_generation;

    const templates = isEnglishLocale(locale) ? copyGen?.templates_en : copyGen?.templates;

    if (scale === "frequency") {
        if (isEnglishLocale(locale)) {
            const template = templates?.frequency ?? "How often {frequency_clause_en}?";
            return template.replaceAll("{frequency_clause_en}", labels.frequency_clause_en);
        }
        const template = templates?.frequency ?? "À quelle fréquence {frequency_clause_fr}?";
        return template.replaceAll("{frequency_clause_fr}", labels.frequency_clause_fr);
    }
    if (scale === "effort") {
        if (isEnglishLocale(locale)) {
            const template =
                templates?.effort ?? "How much effort does {effort_subject_en} usually take?";
            return template.replaceAll("{effort_subject_en}", labels.effort_subject_en);
        }
        const template =
            templates?.effort ?? "{effort_subject_fr} vous demande généralement combien d’effort?";
        return template.replaceAll("{effort_subject_fr}", labels.effort_subject_fr);
    }
    if (isEnglishLocale(locale)) {
        const template =
            templates?.desire_to_improve ??
            "How much would you like to improve {improvement_object_en}?";
        return template.replaceAll("{improvement_object_en}", labels.improvement_object_en);
    }
    const template =
        templates?.desire_to_improve ??
        "À quel point aimeriez-vous améliorer {improvement_object_fr}?";
    return template.replaceAll("{improvement_object_fr}", labels.improvement_object_fr);
}

export function getMeasurementAnswers(
    scale: "frequency" | "effort" | "desire",
    locale: string = "fr",
): Array<[string, string, number]> {
    const model = getMeasurementModel() as unknown as {
        frequency: { answers: Array<[string, string, number]>; answers_en?: Array<[string, string, number]> };
        effort: { answers: Array<[string, string, number]>; answers_en?: Array<[string, string, number]> };
        desire_to_improve: {
            answers: Array<[string, string, number]>;
            answers_en?: Array<[string, string, number]>;
        };
    };
    const block =
        scale === "frequency"
            ? model.frequency
            : scale === "effort"
              ? model.effort
              : model.desire_to_improve;
    if (isEnglishLocale(locale) && block.answers_en?.length) return block.answers_en;
    return block.answers;
}

export function getSolutionFitExamples() {
    return (
        diagnosticSpec as {
            solution_fit_examples?: Array<{
                solution: string;
                priority?: string;
                question_fr: string;
                question_en?: string;
                poor_fit_followup?: {
                    question_fr: string;
                    question_en?: string;
                    kind: string;
                    instruction_fr?: string;
                    instruction_en?: string;
                    selection?: { min?: number; max?: number | null };
                    answers: string[];
                };
            }>;
        }
    ).solution_fit_examples;
}

export function getWebsiteFitFollowup() {
    return getSolutionFitExamples()?.find((e) => e.solution === "website")?.poor_fit_followup;
}

export const WEBSITE_FOLLOWUP_LABELS_FR: Record<string, string> = {
    explain_offer: "Expliquer clairement mon offre",
    more_contacts: "Amener plus de personnes à me contacter",
    book_appointment: "Permettre de demander un rendez-vous",
    request_quote: "Permettre de demander un prix ou une soumission",
    buy_or_order: "Permettre d’acheter ou commander",
    easier_updates: "Faciliter la mise à jour de l’information",
    other: "Autre",
};

export const WEBSITE_FOLLOWUP_LABELS_EN: Record<string, string> = {
    explain_offer: "Explain my offer clearly",
    more_contacts: "Get more people to contact me",
    book_appointment: "Let people request an appointment",
    request_quote: "Let people request a price or quote",
    buy_or_order: "Let people buy or order",
    easier_updates: "Make updating information easier",
    other: "Other",
};

export function websiteFollowupLabel(id: string, locale: string = "fr"): string {
    const map = isEnglishLocale(locale) ? WEBSITE_FOLLOWUP_LABELS_EN : WEBSITE_FOLLOWUP_LABELS_FR;
    return map[id] ?? id;
}

export function getCoverageModel() {
    return diagnosticSpec.coverage_model;
}

export function getProgressStages(locale: string = "fr"): Array<{ id: ProgressStageId; label: string }> {
    const stages = diagnosticSpec.flow.progress_ui.stages as Array<{
        id: ProgressStageId;
        label_fr: string;
        label_en?: string;
    }>;
    return stages.map((stage) => ({
        id: stage.id,
        label: pickLocalized(stage, "label", locale),
    }));
}

export function getOptionalFreeTextSpec() {
    return diagnosticSpec.optional_free_text;
}

export function getLeadCaptureSpec() {
    return diagnosticSpec.lead_capture;
}

export function getResultLabels(locale: string = "fr"): Record<string, string> {
    const rg = diagnosticSpec.result_generation as {
        labels_fr: Record<string, string>;
        labels_en?: Record<string, string>;
    };
    if (isEnglishLocale(locale) && rg.labels_en) return rg.labels_en;
    return rg.labels_fr;
}

export function getOptimizationProbe() {
    return (
        diagnosticSpec as {
            optimization_probe?: {
                generic_question_fr: string;
                generic_question_en?: string;
                answers: Array<{ id: string; label_fr: string; label_en?: string; classification?: string }>;
            };
        }
    ).optimization_probe;
}

export type OptimizationPrompt = {
    question_fr: string;
    question_en?: string;
    kind: string;
    instruction_fr?: string;
    instruction_en?: string;
    selection?: { min?: number; max?: number | null };
    answers: string[];
};

export function getPriorityOptimizationPrompts(): Partial<Record<PriorityId, OptimizationPrompt>> {
    return (
        (diagnosticSpec as { priority_optimization_prompts?: Partial<Record<PriorityId, OptimizationPrompt>> })
            .priority_optimization_prompts ?? {}
    );
}

export function getPriorityOptimizationPrompt(priority: PriorityId): OptimizationPrompt | undefined {
    return getPriorityOptimizationPrompts()[priority];
}

/** Prefer a declared priority that has an optimization prompt; else undefined. */
export function pickOptimizationPromptPriority(priorities?: PriorityId[]): PriorityId | undefined {
    const list = priorities ?? [];
    const prompts = getPriorityOptimizationPrompts();
    return list.find((p) => prompts[p]);
}

export function optimizationAreaId(label: string): string {
    const normalized = label.replace(/['’]/g, "'");
    const known: Record<string, string> = {
        "Préparer des documents": "prepare_docs",
        "Faire des suivis": "do_followups",
        "Trouver ou transférer de l'information": "find_transfer_info",
        "Mettre à jour des dossiers ou suivis": "update_records",
        "Communiquer avec les clients": "client_communication",
        "Suivre l'avancement du travail": "track_progress",
        "Voir les prochaines étapes": "see_next_steps",
        "Retrouver l'information": "find_information",
        "Garder les priorités claires": "keep_priorities_clear",
        "Coordonner le travail": "coordinate_work",
        "Garder les suivis en ordre": "keep_followups_ordered",
        "Faire comprendre mon offre": "explain_offer",
        "Générer plus d'intérêt": "generate_interest",
        "Faciliter la première prise de contact": "ease_first_contact",
        "Faciliter une demande, un rendez-vous ou une soumission": "ease_request",
        "Faciliter le passage à l'achat": "ease_purchase",
        "Le démarrage avec un nouveau client": "new_client_start",
        "L'accès à l'information": "access_information",
        "Les demandes et échanges": "requests_exchanges",
        "Le suivi de l'avancement": "progress_followup",
        "Le suivi après le service ou la livraison": "after_service_followup",
        "Rien de particulier": "nothing_particular",
        Autre: "other",
    };
    return known[normalized] ?? known[label] ?? label;
}

export function optimizationAreaLabel(id: string, priority: PriorityId): string {
    const prompt = getPriorityOptimizationPrompt(priority);
    const match = prompt?.answers.find((label) => optimizationAreaId(label) === id);
    return match ?? id;
}

/** Topics whose entry question matches any selected priority */
export function topicsForPriority(priorities?: PriorityId | PriorityId[]): TopicId[] {
    const list = !priorities ? [] : Array.isArray(priorities) ? priorities : [priorities];
    if (!list.length) return [];
    const topics: TopicId[] = [];
    const seen = new Set<string>();
    for (const q of getRealityQuestions()) {
        const displayIf = (q as { display_if?: { current_priority?: string[] } }).display_if;
        if (!displayIf?.current_priority?.some((p) => list.includes(p as PriorityId))) continue;
        const topic = q.topic as TopicId;
        if (seen.has(topic)) continue;
        seen.add(topic);
        topics.push(topic);
    }
    return topics;
}

export function entryQuestionForTopic(topic: TopicId): SpecRealityQuestion | undefined {
    if (topic === "operational_scan") return undefined;
    return getRealityQuestions().find(
        (q) => q.topic === topic && Boolean((q as { display_if?: unknown }).display_if),
    );
}

export const OPPORTUNITY_LABELS_FR: Record<string, string> = {
    simplify_process: "Simplifier le processus",
    clarify_process: "Clarifier le processus",
    centralize_information: "Centraliser l’information",
    reduce_duplicate_entry: "Réduire la double saisie",
    improve_visibility: "Améliorer la visibilité",
    improve_followup: "Améliorer les suivis",
    reduce_manual_coordination: "Réduire la coordination manuelle",
    standardize_work: "Standardiser le travail",
    automate_repetitive_step: "Automatiser une étape répétitive",
    integrate_systems: "Mieux connecter les outils",
    improve_customer_experience: "Améliorer l’expérience client",
    improve_continuity: "Améliorer la continuité",
    improve_reporting: "Améliorer le reporting",
    review_tool_fit: "Revoir l’adéquation des outils",
    reduce_tool_cost: "Réduire le coût des outils",
    explore_new_process: "Explorer un nouveau processus",
    structure_testing_feedback: "Mieux organiser les essais et les retours",
    prepare_order_intake: "Préparer une façon de prendre des commandes",
    make_offer_information_accessible: "Rendre l’offre plus facile à comprendre",
    optimize_product_information: "Optimiser la présentation de l’offre",
    optimize_offer_testing: "Optimiser le suivi des essais",
    optimize_operations: "Optimiser le fonctionnement quotidien",
};

export const OPPORTUNITY_LABELS_EN: Record<string, string> = {
    simplify_process: "Simplify the process",
    clarify_process: "Clarify the process",
    centralize_information: "Centralize information",
    reduce_duplicate_entry: "Reduce duplicate entry",
    improve_visibility: "Improve visibility",
    improve_followup: "Improve follow-ups",
    reduce_manual_coordination: "Reduce manual coordination",
    standardize_work: "Standardize work",
    automate_repetitive_step: "Automate a repetitive step",
    integrate_systems: "Better connect tools",
    improve_customer_experience: "Improve customer experience",
    improve_continuity: "Improve continuity",
    improve_reporting: "Improve reporting",
    review_tool_fit: "Review tool fit",
    reduce_tool_cost: "Reduce tool cost",
    explore_new_process: "Explore a new process",
    structure_testing_feedback: "Better organize experiments and feedback",
    prepare_order_intake: "Prepare a way to take orders",
    make_offer_information_accessible: "Make the offer easier to understand",
    optimize_product_information: "Optimize how the offer is presented",
    optimize_offer_testing: "Optimize how experiments are tracked",
    optimize_operations: "Optimize day-to-day operations",
};

export function opportunityLabel(id: string, locale: string = "fr"): string {
    const map = isEnglishLocale(locale) ? OPPORTUNITY_LABELS_EN : OPPORTUNITY_LABELS_FR;
    return map[id] ?? id;
}

export const FREQUENCY_SCORE: Record<string, number> = {
    rare: 1,
    monthly: 2,
    weekly: 3,
    daily: 4,
};

export const EFFORT_SCORE: Record<string, number> = {
    very_little: 1,
    some: 2,
    quite_a_bit: 3,
    a_lot: 4,
};

export const DESIRE_SCORE: Record<string, number> = {
    not_really: 0,
    a_little: 1,
    quite: 2,
    a_lot: 3,
};
