import {
    getAreaSequencing,
    getAutomationScan,
    getCompanyQuestions,
} from "@/content/diagnostic/v7/catalog";
import type {
    AmbitionId,
    AreaAnswerValue,
    AreaId,
    AutomationInterest,
    CompanyContext,
    FlowStep,
    ProgressStageId,
} from "@/content/diagnostic/v7/types";
import { hardApplicableAreas } from "./coverage";

const MAX_SCANS = 6;

/** Extra ambition → area maps not yet present in the JSON sequencing block. */
const EXTRA_AMBITION_AREAS: Partial<Record<AmbitionId, AreaId[]>> = {
    organize_work: ["work_operations", "information_ways", "tools_systems"],
    improve_tools: ["tools_systems", "information_ways", "work_operations"],
};

export function orderAreasForAmbition(
    declared: AmbitionId[] | undefined,
    applicable: AreaId[],
): AreaId[] {
    const sequencing = getAreaSequencing();
    const ambitions =
        declared && declared.length > 0
            ? declared.filter((id) => id !== "other")
            : (["nothing_specific"] as AmbitionId[]);

    const priorityLists = ambitions.map(
        (id) =>
            sequencing.ambition_to_priority_areas[id] ||
            EXTRA_AMBITION_AREAS[id] ||
            sequencing.ambition_to_priority_areas.nothing_specific ||
            [],
    );

    const applicableSet = new Set(applicable);
    const ordered: AreaId[] = [];

    // Round-robin merge so multiple declared ambitions all influence early scans
    const maxLen = Math.max(0, ...priorityLists.map((l) => l.length));
    for (let i = 0; i < maxLen; i++) {
        for (const list of priorityLists) {
            const area = list[i];
            if (area && applicableSet.has(area) && !ordered.includes(area)) {
                ordered.push(area);
            }
        }
    }

    const crossCutting: AreaId[] = ["information_ways", "tools_systems", "work_operations"];
    for (const area of crossCutting) {
        if (applicableSet.has(area) && !ordered.includes(area)) {
            ordered.splice(Math.min(3, ordered.length), 0, area);
            break;
        }
    }
    for (const area of applicable) {
        if (!ordered.includes(area)) ordered.push(area);
    }
    return ordered.slice(0, MAX_SCANS);
}

export function shouldAskSimplification(input: {
    applicableAreas: AreaId[];
    declared?: AmbitionId[];
}): boolean {
    const areas = new Set(input.applicableAreas);
    if (areas.has("work_operations") || areas.has("information_ways") || areas.has("tools_systems")) {
        return true;
    }
    const declared = input.declared || [];
    return (
        declared.includes("save_time") ||
        declared.includes("organize_work") ||
        declared.includes("prepare_growth") ||
        declared.includes("improve_tools")
    );
}

/**
 * v8.1 breadth-first flow:
 * company → ambitions → expand exploration → scans → simplification →
 * choose topics (≤6 / max 3) → precise free text → results / booking
 */
export function buildFlowSteps(input: {
    companyContext: CompanyContext;
    declared?: AmbitionId[];
    applicableAreas: AreaId[];
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>;
    automationInterest: AutomationInterest;
    selectedPossibilities?: Array<string | "none_selected">;
}): FlowStep[] {
    const steps: FlowStep[] = getCompanyQuestions().map((q) => ({
        type: "company" as const,
        questionId: q.id,
    }));

    steps.push({ type: "declared_ambitions" });
    steps.push({ type: "applicable_areas" });

    const hard = hardApplicableAreas(input.companyContext);
    const expanded = input.applicableAreas.filter((a) => hard.includes(a));
    const pool = [...expanded];
    for (const area of hard) {
        if (!pool.includes(area)) pool.push(area);
    }

    const scanAreas = orderAreasForAmbition(input.declared, pool);
    for (const areaId of scanAreas) {
        steps.push({ type: "area_scan", areaId });
    }

    if (shouldAskSimplification({ applicableAreas: pool, declared: input.declared })) {
        steps.push({ type: "simplification" });
    }

    if (Object.keys(input.areaAnswers).length > 0 || (input.automationInterest.tasks?.length ?? 0) > 0) {
        steps.push({ type: "choose_topics" });
    }

    steps.push({ type: "optional_notes" });
    return steps;
}

export function stepKey(step: FlowStep): string {
    switch (step.type) {
        case "company":
            return `company:${step.questionId}`;
        case "area_scan":
            return `area_scan:${step.areaId}`;
        default:
            return step.type;
    }
}

export function progressStageForStep(type: FlowStep["type"] | "result"): ProgressStageId {
    switch (type) {
        case "company":
            return "company";
        case "declared_ambitions":
            return "ambitions";
        case "applicable_areas":
        case "area_scan":
        case "simplification":
            return "discovery";
        case "choose_topics":
        case "review_possibilities":
        case "section_priorities":
        case "possibility_followup":
        case "tools_fit":
        case "optional_notes":
            return "priorities";
        case "result":
            return "results";
        default:
            return "company";
    }
}

export function getAutomationQuestion() {
    return getAutomationScan();
}
