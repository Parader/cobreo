import { isEnglishLocale, pickLocalized } from "@/lib/diagnostic/localize";
import { diagnosticSpecV7 } from "./types";
import type {
    AmbitionId,
    AreaId,
    GainLevel,
    LensId,
    OpportunityType,
    PotentialLevel,
    ProgressStageId,
} from "./types";

export type SpecCompanyQuestion = (typeof diagnosticSpecV7.company_context)[number];
export type SpecAreaScan = (typeof diagnosticSpecV7.area_scans)[AreaId];

export function getCompanyQuestions(): SpecCompanyQuestion[] {
    return diagnosticSpecV7.company_context;
}

export function getCompanyQuestion(id: string): SpecCompanyQuestion | undefined {
    return getCompanyQuestions().find((q) => q.id === id);
}

export function getDeclaredAmbitionSpec() {
    return diagnosticSpecV7.ambitions.declared;
}

export function getBusinessAreas() {
    return diagnosticSpecV7.business_areas as Array<{
        id: AreaId;
        label_fr: string;
        hint_fr?: string;
        default_applicability?: string;
    }>;
}

export function getAreaApplicabilitySpec() {
    return diagnosticSpecV7.area_applicability;
}

export function getFreeTextSpec() {
    return (diagnosticSpecV7 as { free_text?: Record<string, unknown> }).free_text as {
        enabled?: boolean;
        id?: string;
        question_fr?: string;
        helper_fr?: string;
        max_chars?: number;
        required?: boolean;
    };
}

export function getAreaScan(areaId: AreaId): SpecAreaScan | undefined {
    return diagnosticSpecV7.area_scans[areaId] as SpecAreaScan | undefined;
}

export function getAutomationScan() {
    return diagnosticSpecV7.automation_scan;
}

export function getConfirmationPatterns() {
    return diagnosticSpecV7.coverage_engine.confirmation_patterns;
}

export function getOpportunityLenses() {
    return diagnosticSpecV7.opportunity_lenses as Array<{
        id: LensId;
        label_fr: string;
        description_fr?: string;
    }>;
}

export function getLeadCaptureSpecV7() {
    return diagnosticSpecV7.lead_capture as {
        enabled?: boolean;
        fallback_only?: boolean;
        reason?: string;
        fallback_rule?: string;
        title_fr?: string;
        body_fr?: string;
        cta_fr?: string;
    };
}

export function getBookingSpec() {
    return (diagnosticSpecV7 as { booking?: Record<string, unknown> }).booking as {
        primary_close: boolean;
        duration_minutes: number;
        title_fr: string;
        body_fr: string;
        cta_fr: string;
        required_fields: Array<{ id: string; label_fr: string; required: boolean }>;
        optional_fields: Array<{ id: string; label_fr: string; required: boolean }>;
        confirmation: { title_fr: string; body_template_fr: string };
    };
}

export function getResultsSpec() {
    return diagnosticSpecV7.results as {
        goal_fr?: string;
        page?: {
            title_fr: string;
            intro_fr: string;
            max_section_cards?: number;
            section_card?: {
                why_toggle?: { label_fr: string };
            };
        };
        prohibited_copy?: string[];
    };
}

export function getPrioritizationSpec() {
    return diagnosticSpecV7.respondent_prioritization;
}

export function getOpportunityTemplates() {
    return diagnosticSpecV7.result_opportunity_templates as {
        principle: string;
        examples: Record<
            string,
            {
                trigger_examples: string[];
                title_fr: string;
                what_we_see_fr?: string;
                what_we_see_rule?: string;
                what_could_improve_fr: string;
                what_it_could_bring_fr: string;
                what_we_could_explore_together_fr: string;
                possibilities_fr?: string[];
                cobreo_lenses: LensId[];
                guardrail?: string;
            }
        >;
        fallback_generation_rules: string[];
    };
}

export function getAreaSequencing() {
    return diagnosticSpecV7.area_sequencing as {
        typical_initial_scans: number;
        typical_total_scans: string;
        max_without_user_explicitly_choosing_to_continue: number;
        ambition_to_priority_areas: Partial<Record<AmbitionId, AreaId[]>>;
        rules: string[];
    };
}

export function getCapabilityToLenses(): Record<string, LensId[]> {
    return diagnosticSpecV7.capability_to_lens_examples as Record<string, LensId[]>;
}

export function getProgressStages(locale: string = "fr"): Array<{ id: ProgressStageId; label: string }> {
    const stages = diagnosticSpecV7.flow.stages as Array<{ id: ProgressStageId; label_fr: string; label_en?: string }>;
    return stages.map((stage) => ({
        id: stage.id,
        label: isEnglishLocale(locale)
            ? stage.label_en || stage.label_fr
            : stage.label_fr,
    }));
}

export function areaLabel(areaId: AreaId, locale: string = "fr"): string {
    const area = getBusinessAreas().find((a) => a.id === areaId);
    if (!area) return areaId;
    return pickLocalized(area as Record<string, unknown>, "label", locale) || area.label_fr;
}

export function ambitionLabel(ambitionId: AmbitionId, locale: string = "fr"): string {
    const answer = getDeclaredAmbitionSpec().answers.find((a) => a.id === ambitionId);
    if (!answer) return ambitionId;
    return pickLocalized(answer as Record<string, unknown>, "label", locale) || answer.label_fr;
}

export function lensLabel(lensId: LensId, locale: string = "fr"): string {
    const lens = getOpportunityLenses().find((l) => l.id === lensId);
    if (!lens) return lensId;
    return pickLocalized(lens as Record<string, unknown>, "label", locale) || lens.label_fr;
}

export function selectionInstruction(kind: "unlimited" | "max_2" | "max_3", locale: string = "fr"): string {
    const copy = diagnosticSpecV7.ux.selection.copy as Record<string, string>;
    if (isEnglishLocale(locale)) {
        if (kind === "max_2") return "Choose up to 2 answers.";
        if (kind === "max_3") return "Choose up to 3 answers.";
        return "Select all that apply.";
    }
    return copy[kind] || copy.unlimited;
}

/** Answers for an area scan, including exclusive “none” options. */
export function getScanAnswers(
    areaId: AreaId,
    filter?: {
        companyStage?: string;
        companySize?: string;
        declaredAmbitions?: AmbitionId[];
    },
): Array<{
    id: string;
    label_fr: string;
    capability?: string;
    exclusive?: boolean;
    show_if?: string;
}> {
    const scan = getAreaScan(areaId) as Record<string, unknown> | undefined;
    if (!scan) return [];
    const list = (scan.dynamic_answers || scan.answers) as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(list)) return [];
    return list
        .map((item) => ({
            id: String(item.id),
            label_fr: String(item.label_fr || item.id),
            capability: typeof item.capability === "string" ? item.capability : undefined,
            exclusive: Boolean(item.exclusive),
            show_if: typeof item.show_if === "string" ? item.show_if : undefined,
        }))
        .filter((item) => answerVisible(item.show_if, filter));
}

export function answerVisible(
    showIf: string | undefined,
    filter?: {
        companyStage?: string;
        companySize?: string;
        declaredAmbitions?: AmbitionId[];
    },
): boolean {
    if (!showIf) return true;
    const size = filter?.companySize;
    const stage = filter?.companyStage;
    const declared = filter?.declaredAmbitions || [];

    if (showIf === "company_size != '1'") {
        return size !== "1";
    }
    // e.g. company_stage == 'testing' or 'improve_offer' in declared_ambitions
    if (showIf.includes(" or ")) {
        return showIf.split(/\s+or\s+/).some((part) => answerVisible(part.trim(), filter));
    }
    const stageMatch = showIf.match(/^company_stage\s*==\s*'([^']+)'$/);
    if (stageMatch) return stage === stageMatch[1];
    const ambitionMatch = showIf.match(/^'([^']+)'\s+in\s+declared_ambitions$/);
    if (ambitionMatch) return declared.includes(ambitionMatch[1] as AmbitionId);
    // Unknown conditions: show by default so we don't hide answers accidentally
    return true;
}

export function getExclusiveAnswerIds(areaId: AreaId): string[] {
    return getScanAnswers(areaId)
        .filter((a) => a.exclusive || a.id.startsWith("no_") || a.id.startsWith("too_early") || a.id.startsWith("not_") || a.id.startsWith("informal_") || a.id === "none_easy" || a.id === "no_overview" || a.id === "no_tools" || a.id === "no_formal_sales")
        .map((a) => a.id);
}

export function opportunityTypeLabel(type: OpportunityType, locale: string = "fr"): string {
    const fr: Record<OpportunityType, string> = {
        improvement: "Amélioration",
        optimization_without_pain: "À optimiser",
        emerging_capability: "Capacité émergente",
        coverage_expansion: "À couvrir",
        fit_gap: "Écart d’outil",
        exploration: "Exploration",
    };
    const en: Record<OpportunityType, string> = {
        improvement: "Improvement",
        optimization_without_pain: "Worth optimizing",
        emerging_capability: "Emerging capability",
        coverage_expansion: "Coverage gap",
        fit_gap: "Tool fit gap",
        exploration: "Exploration",
    };
    return isEnglishLocale(locale) ? en[type] : fr[type];
}

export function gainLabel(level: GainLevel, locale: string = "fr"): string {
    if (isEnglishLocale(locale)) {
        return level === "important" ? "Important" : level === "moderate" ? "Moderate" : "Lower";
    }
    return level === "important" ? "Important" : level === "moderate" ? "Modéré" : "Plus limité";
}

export function potentialLevelLabel(level: PotentialLevel, locale: string = "fr"): string {
    if (isEnglishLocale(locale)) {
        return level === "important" ? "High potential" : level === "moderate" ? "Moderate potential" : "Worth exploring";
    }
    return level === "important" ? "Potentiel important" : level === "moderate" ? "Potentiel modéré" : "À explorer";
}

export function getToolsFitSpec() {
    const tools = diagnosticSpecV7.area_scans.tools_systems as {
        followup_if_relevant?: {
            id: string;
            kind: string;
            question_template_fr: string;
            answers: Array<{ id: string; label_fr: string; state?: string }>;
        };
    };
    return tools.followup_if_relevant;
}
