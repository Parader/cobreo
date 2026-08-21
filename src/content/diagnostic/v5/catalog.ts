import { diagnosticSpec } from "./types";
import type { BusinessSituation, DimensionId, ProgressStageId, WorkModel } from "./types";

export type SpecDimension = (typeof diagnosticSpec.dimension_map.dimensions)[number];
export type SpecRadar = (typeof diagnosticSpec.radars)[number];
export type SpecContextQuestion = (typeof diagnosticSpec.context)[number];

export function getContextQuestions(): SpecContextQuestion[] {
    return diagnosticSpec.context;
}

export function getDimensionSelectionSpec() {
    return diagnosticSpec.dimension_map;
}

export function getDimensions(): SpecDimension[] {
    return diagnosticSpec.dimension_map.dimensions;
}

export function getDimension(id: DimensionId): SpecDimension | undefined {
    return getDimensions().find((d) => d.id === id);
}

export function getRadars(): SpecRadar[] {
    return diagnosticSpec.radars;
}

export function getRadarForDimension(
    dimension: DimensionId,
    situation?: BusinessSituation,
): SpecRadar | undefined {
    const candidates = getRadars().filter((r) => r.dimension === dimension);
    if (candidates.length === 1) return candidates[0];

    const soloSituations = new Set(["solo", "starting"]);
    const isSolo = situation ? soloSituations.has(situation) : false;

    return (
        candidates.find((r) => {
            if (!("display_if" in r) || !r.display_if) return !("variant" in r);
            const allowed = r.display_if.context_business_situation as string[] | undefined;
            if (!allowed) return true;
            if (!situation) return r.variant === "team" || !r.variant;
            return allowed.includes(situation);
        }) ??
        candidates.find((r) => (isSolo ? r.variant === "solo" : r.variant === "team")) ??
        candidates[0]
    );
}

export function getRadarQuestionText(radar: SpecRadar, workModel?: WorkModel): string {
    const q = radar.question as Record<string, string | null | undefined>;
    if (workModel === "appointments" && q.fr_appointments) return q.fr_appointments;
    if (q.fr) return q.fr;
    if (q.fr_default) return q.fr_default;
    return "";
}

export function getQualificationSpec() {
    return diagnosticSpec.qualification;
}

export function getDeepDiveRules() {
    return diagnosticSpec.deep_dive_rules;
}

export function getOpportunityRules() {
    return diagnosticSpec.opportunity_rules;
}

export function getFrictionClustersSpec() {
    return diagnosticSpec.friction_clusters;
}

export function getProgressStages(): Array<{ id: ProgressStageId; label_fr: string }> {
    return diagnosticSpec.flow.progress_ui.stages as Array<{ id: ProgressStageId; label_fr: string }>;
}

export function getEarlyExitSpec() {
    return diagnosticSpec.early_exit;
}

export function getOptionalFreeTextSpec() {
    return diagnosticSpec.optional_free_text;
}

export function getLeadCaptureSpec() {
    return diagnosticSpec.lead_capture;
}

export function getHealthyMessage(): string {
    return diagnosticSpec.result_generation.healthy_result.message_fr;
}

export function getEarlyStageMessage(): string {
    return diagnosticSpec.result_generation.early_stage_result.message_fr;
}

/** Resolve friction cluster id for a radar answer */
export function resolveFrictionCluster(
    answerId: string,
    frictionClusterFromAnswer?: string | null,
): string {
    if (frictionClusterFromAnswer) return frictionClusterFromAnswer;
    const examples = getFrictionClustersSpec().examples as Record<string, string[]>;
    for (const [cluster, ids] of Object.entries(examples)) {
        if (ids.includes(answerId)) return cluster;
    }
    return `answer:${answerId}`;
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
};

export const SIGNAL_LABELS_FR: Record<string, string> = {
    manual_work: "Travail manuel",
    repetitive_work: "Travail répétitif",
    duplicate_entry: "Double saisie",
    information_fragmentation: "Information dispersée",
    information_access: "Accès à l’information",
    follow_up: "Suivis",
    visibility: "Visibilité",
    coordination: "Coordination",
    dependency_on_people: "Dépendance aux personnes",
    software_fragmentation: "Outils fragmentés",
    software_overlap: "Chevauchement d’outils",
    integration: "Intégration",
    automation_potential: "Potentiel d’automatisation",
    reporting: "Reporting",
};

export const CONSEQUENCE_LABELS_FR: Record<string, string> = {
    time: "Du temps perdu",
    delay: "Des délais ou de l’attente",
    forgetting: "Des oublis",
    errors: "Des erreurs ou du travail à refaire",
    customer: "Une moins bonne expérience client",
    mental_load: "Plus de choses à garder en tête",
    visibility: "Un manque de visibilité",
    capacity: "Une limite de capacité",
    cost: "Des coûts inutiles",
    low_impact: "Rien de vraiment important",
    unknown: "Difficile à dire",
};
