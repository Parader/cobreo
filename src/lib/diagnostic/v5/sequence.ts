import {
    getContextQuestions,
    getEarlyExitSpec,
    getRadarForDimension,
    resolveFrictionCluster,
} from "@/content/diagnostic/v5/catalog";
import type {
    DiagnosticContext,
    DimensionId,
    FlowStep,
    ProgressStageId,
    QualificationState,
    RadarResponse,
} from "@/content/diagnostic/v5/types";
import { shouldAskDeepDive } from "@/lib/diagnostic/v5/scoring";

export function buildFlowSteps(input: {
    context: DiagnosticContext;
    selectedDimensions: DimensionId[];
    radarResponses: Partial<Record<DimensionId, RadarResponse>>;
    qualification: QualificationState;
    /** Dimensions still to explore when early-exit chose "results" */
    skipRemainingRadars?: boolean;
    /** Show early-exit interstitial once conditions are met */
    includeEarlyExit?: boolean;
}): FlowStep[] {
    const steps: FlowStep[] = [];

    for (const q of getContextQuestions()) {
        steps.push({
            type: "context",
            questionId: q.id as
                | "context_business_situation"
                | "context_business_type"
                | "context_work_model",
        });
    }

    steps.push({ type: "dimension_select" });

    const dims = input.selectedDimensions;
    const answeredCount = dims.filter((d) => (input.radarResponses[d]?.selected?.length ?? 0) > 0).length;
    const earlyExitSpec = getEarlyExitSpec();
    let earlyExitInserted = false;

    for (let i = 0; i < dims.length; i++) {
        const dimension = dims[i];
        const radar = getRadarForDimension(dimension, input.context.business_situation);
        if (!radar) continue;

        if (input.skipRemainingRadars && !(input.radarResponses[dimension]?.selected?.length)) {
            continue;
        }

        steps.push({ type: "radar", dimension, radarId: radar.id });

        // Offer early exit after the Nth answered radar when more remain
        if (
            input.includeEarlyExit &&
            !earlyExitInserted &&
            !input.skipRemainingRadars &&
            answeredCount >= (earlyExitSpec.after_dimensions_explored_min ?? 3) &&
            i === answeredCount - 1 &&
            i < dims.length - 1 &&
            hasMaterialFrictionForEarlyExit(dims.slice(0, i + 1), input.radarResponses, input.context)
        ) {
            steps.push({ type: "early_exit" });
            earlyExitInserted = true;
        }
    }

    const frictionClusters = countFrictionClusters(
        input.selectedDimensions,
        input.radarResponses,
        input.context,
    );
    const frictionAnswers = countFrictionAnswers(input.selectedDimensions, input.radarResponses);

    if (frictionClusters > 1) {
        steps.push({ type: "qualify_priority" });
    }
    if (frictionAnswers >= 1) {
        steps.push({ type: "qualify_importance" });
        const importance = input.qualification.importance;
        if (importance === "some" || importance === "significant" || importance === "high") {
            steps.push({ type: "qualify_consequence" });
        }
    }

    if (
        shouldAskDeepDive({
            selectedDimensions: input.selectedDimensions,
            radarResponses: input.radarResponses,
            qualification: input.qualification,
        })
    ) {
        steps.push({ type: "deep_dive", ruleId: "deep_dive_manual_transfer" });
    }

    steps.push({ type: "optional_context" });

    return steps;
}

export function countFrictionAnswers(
    selectedDimensions: DimensionId[],
    radarResponses: Partial<Record<DimensionId, RadarResponse>>,
): number {
    let count = 0;
    for (const dimension of selectedDimensions) {
        const selected = radarResponses[dimension]?.selected ?? [];
        if (!selected.length || selected.includes("none")) continue;
        count += selected.filter((id) => id !== "other").length;
    }
    return count;
}

export function countFrictionClusters(
    selectedDimensions: DimensionId[],
    radarResponses: Partial<Record<DimensionId, RadarResponse>>,
    context: DiagnosticContext,
): number {
    const clusters = new Set<string>();
    for (const dimension of selectedDimensions) {
        const selected = radarResponses[dimension]?.selected ?? [];
        if (!selected.length || selected.includes("none")) continue;
        const radar = getRadarForDimension(dimension, context.business_situation);
        for (const answerId of selected) {
            if (answerId === "other" || answerId === "none") continue;
            const answer = radar?.answers.find((a) => a.id === answerId) as
                | { friction_cluster?: string }
                | undefined;
            clusters.add(resolveFrictionCluster(answerId, answer?.friction_cluster));
        }
    }
    return clusters.size;
}

function hasMaterialFrictionForEarlyExit(
    explored: DimensionId[],
    radarResponses: Partial<Record<DimensionId, RadarResponse>>,
    context: DiagnosticContext,
): boolean {
    return countFrictionClusters(explored, radarResponses, context) >= 2 || countFrictionAnswers(explored, radarResponses) >= 2;
}

export function progressStageForStep(type: FlowStep["type"] | "result"): ProgressStageId {
    if (type === "context") return "context";
    if (type === "dimension_select") return "explore";
    if (type === "radar" || type === "early_exit") return "reality";
    if (
        type === "qualify_priority" ||
        type === "qualify_importance" ||
        type === "qualify_consequence" ||
        type === "deep_dive" ||
        type === "optional_context"
    ) {
        return "impact";
    }
    return "results";
}

export function stepKey(step: FlowStep): string {
    switch (step.type) {
        case "context":
            return `context:${step.questionId}`;
        case "radar":
            return `radar:${step.dimension}`;
        case "deep_dive":
            return `deep_dive:${step.ruleId}`;
        default:
            return step.type;
    }
}
