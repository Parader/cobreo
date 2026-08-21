import {
    entryQuestionForTopic,
    getCoverageModel,
    getPriorityOptimizationPrompt,
    getRealityQuestion,
    getScanQuestion,
    pickOptimizationPromptPriority,
    topicsForPriority,
} from "@/content/diagnostic/v6/catalog";
import type {
    Classification,
    CoverageUnit,
    FlowStep,
    MeasurementState,
    PriorityId,
    ProgressStageId,
    RealityAnswerValue,
    TopicId,
    TopicState,
} from "@/content/diagnostic/v6/types";

function asArray(value: RealityAnswerValue | undefined): string[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function answerClassification(questionId: string, answerId: string): Classification | undefined {
    const q = getRealityQuestion(questionId);
    const answer = q?.answers.find((a) => a.id === answerId) as
        | { classification?: Classification }
        | undefined;
    return answer?.classification;
}

export function computeCoverageUnits(input: {
    topicStates: Partial<Record<TopicId, TopicState>>;
    scanAnswers: Record<string, RealityAnswerValue>;
}): CoverageUnit[] {
    const units = new Set<CoverageUnit>();
    if (input.topicStates.sales_orders || input.topicStates.product_information) {
        units.add("customer_demand_or_sales");
    }
    if (input.topicStates.offer_testing) {
        units.add("delivery_or_work_execution");
    }
    if (input.scanAnswers.scan_manual_repetitive || input.scanAnswers.scan_manual_types) {
        units.add("manual_repetitive_work");
    }
    if (input.scanAnswers.scan_tools_context || input.scanAnswers.scan_tool_handoffs) {
        units.add("information_and_tools");
    }
    if (input.scanAnswers.scan_followup_memory) {
        units.add("followups_and_memory");
    }
    if (input.scanAnswers.scan_visibility) {
        units.add("work_visibility");
    }
    return [...units];
}

export function shouldRunOperationalScan(input: {
    topicStates: Partial<Record<TopicId, TopicState>>;
    scanAnswers: Record<string, RealityAnswerValue>;
    credibleOpportunityCount: number;
}): boolean {
    if (input.credibleOpportunityCount >= 2) return false;
    const units = computeCoverageUnits(input);
    const min = getCoverageModel().minimum_units_for_global_conclusion ?? 4;
    return units.length < min;
}

function appendMeasurement(
    steps: FlowStep[],
    targetId: string,
    measurement: MeasurementState | undefined,
) {
    steps.push({ type: "measure", targetId, scale: "frequency" });
    if (!measurement?.frequency) return;
    steps.push({ type: "measure", targetId, scale: "effort" });
    if (!measurement?.effort) return;
    steps.push({ type: "measure", targetId, scale: "desire" });
}

/** Build dynamic step list from priority + answered state */
export function buildFlowSteps(input: {
    currentPriority?: PriorityId[];
    topicStates: Partial<Record<TopicId, TopicState>>;
    scanAnswers: Record<string, RealityAnswerValue>;
    measurements: Partial<Record<string, MeasurementState>>;
    /** Precomputed credible count so scan gating does not recurse into scoring */
    credibleOpportunityCount?: number;
}): FlowStep[] {
    const steps: FlowStep[] = [
        { type: "context", questionId: "context_stage" },
        { type: "context", questionId: "context_business_type" },
        { type: "context", questionId: "context_work_model" },
        { type: "priority" },
    ];

    const topics = topicsForPriority(input.currentPriority);
    for (const topic of topics) {
        appendTopicSteps(
            steps,
            topic,
            input.topicStates[topic],
            input.measurements,
            input.currentPriority,
        );
    }

    const runScan = shouldRunOperationalScan({
        topicStates: input.topicStates,
        scanAnswers: input.scanAnswers,
        credibleOpportunityCount: input.credibleOpportunityCount ?? 0,
    });

    // Once scan started (any answer) or needed, include scan steps
    const scanStarted = Object.keys(input.scanAnswers).length > 0 || runScan;
    if (scanStarted) {
        appendScanSteps(steps, input.scanAnswers, input.measurements);
    }

    steps.push({ type: "optional_context" });
    return steps;
}

function appendOptimizationSteps(
    steps: FlowStep[],
    topic: TopicId,
    answers: Record<string, RealityAnswerValue>,
    priorities?: PriorityId[],
) {
    // Only for topics that were opened by declared priority (direct alignment)
    const aligned = topicsForPriority(priorities);
    if (!aligned.includes(topic)) return;

    steps.push({ type: "optimization_probe", topic });
    const probe = asArray(answers.optimization_probe)[0];
    if (!probe) return;
    if (probe === "no") return;

    const promptPriority = pickOptimizationPromptPriority(priorities);
    if (!promptPriority || !getPriorityOptimizationPrompt(promptPriority)) return;
    steps.push({ type: "optimization_areas", topic, priority: promptPriority });
}

function appendTopicSteps(
    steps: FlowStep[],
    topic: TopicId,
    state: TopicState | undefined,
    measurements: Partial<Record<string, MeasurementState>>,
    priorities?: PriorityId[],
) {
    const entry = entryQuestionForTopic(topic);
    if (!entry) return;

    steps.push({ type: "reality", questionId: entry.id, topic });

    const answers = state?.answers ?? {};
    const entryValue = answers[entry.id];
    if (!entryValue) return;

    if (entry.id === "reality_offer_testing") {
        const selected = asArray(entryValue);
        const nextIf = (entry as { next_if?: { any_of: string[]; next: string } }).next_if;
        if (nextIf && nextIf.any_of.some((id) => selected.includes(id))) {
            steps.push({ type: "reality", questionId: nextIf.next, topic });
            const method = answers[nextIf.next];
            if (method) {
                const methodQ = getRealityQuestion(nextIf.next) as
                    | { next_if_needed?: string }
                    | undefined;
                if (methodQ?.next_if_needed) {
                    steps.push({ type: "reality", questionId: methodQ.next_if_needed, topic });
                    const fitId = methodQ.next_if_needed;
                    const fitAnswer = asArray(answers[fitId])[0];
                    if (fitAnswer) {
                        const classification = answerClassification(fitId, fitAnswer);
                        if (classification === "friction_candidate") {
                            appendMeasurement(steps, "offer_testing", measurements.offer_testing);
                        } else if (
                            classification === "healthy_close" ||
                            classification === "likely_healthy"
                        ) {
                            appendOptimizationSteps(steps, topic, answers, priorities);
                        }
                    }
                }
            }
        }
        return;
    }

    // Sales multi-select branching
    if (entry.id === "reality_sales_path") {
        const selected = asArray(entryValue);
        if (selected.includes("not_relevant")) return;
        if (selected.includes("not_decided") || selected.includes("not_taking_orders")) {
            steps.push({ type: "reality", questionId: "sales_near_term_need", topic });
            return;
        }
        // Existing sales path — allow optimization probe when priority-aligned
        appendOptimizationSteps(steps, topic, answers, priorities);
        return;
    }

    // Product information — multi-select: channels → fit; not_planned alone → near-term
    if (entry.id === "reality_product_information") {
        const selected = asArray(entryValue);
        if (selected.includes("not_relevant")) return;

        const existingChannels = [
            "direct_explanation",
            "send_info",
            "page_profile",
            "website",
            "other",
        ];
        const hasChannel = selected.some((id) => existingChannels.includes(id));

        if (hasChannel) {
            steps.push({ type: "reality", questionId: "product_information_fit", topic });
            const fitAnswer = asArray(answers.product_information_fit)[0];
            if (!fitAnswer) return;

            const classification = answerClassification("product_information_fit", fitAnswer);
            if (classification === "fit_gap_candidate") {
                // Existing website + poor/partial fit → ask what it should do better (never jump to replacement)
                if (selected.includes("website")) {
                    steps.push({ type: "solution_followup", solutionId: "website", topic });
                }
                appendMeasurement(
                    steps,
                    "product_information",
                    measurements.product_information,
                );
            } else if (
                classification === "healthy_close" ||
                classification === "likely_healthy"
            ) {
                appendOptimizationSteps(steps, topic, answers, priorities);
            }
            return;
        }

        if (selected.includes("not_planned")) {
            steps.push({
                type: "reality",
                questionId: "product_information_near_term_need",
                topic,
            });
        }
    }
}

function appendScanSteps(
    steps: FlowStep[],
    scanAnswers: Record<string, RealityAnswerValue>,
    measurements: Partial<Record<string, MeasurementState>>,
) {
    // Fixed scan order from spec
    const order = [
        "scan_manual_repetitive",
        "scan_manual_types",
        "scan_tools_context",
        "scan_tool_handoffs",
        "scan_followup_memory",
        "scan_visibility",
    ] as const;

    // Always start with first scan question when scan is active
    steps.push({ type: "scan", questionId: "scan_manual_repetitive" });
    const manual = asArray(scanAnswers.scan_manual_repetitive)[0];
    if (!manual) return;

    const manualQ = getScanQuestion("scan_manual_repetitive") as
        | { open_if?: string[]; next?: string }
        | undefined;
    if (manualQ?.open_if?.includes(manual) && manualQ.next) {
        steps.push({ type: "scan", questionId: manualQ.next });
        const types = asArray(scanAnswers.scan_manual_types);
        if (!types.length) return;
        appendMeasurement(steps, "scan_manual", measurements.scan_manual);
        if (!measurements.scan_manual?.desire) return;
    }

    steps.push({ type: "scan", questionId: "scan_tools_context" });
    if (!scanAnswers.scan_tools_context) return;

    steps.push({ type: "scan", questionId: "scan_tool_handoffs" });
    const handoffs = asArray(scanAnswers.scan_tool_handoffs);
    if (!handoffs.length) return;
    if (!handoffs.includes("none")) {
        appendMeasurement(steps, "scan_handoffs", measurements.scan_handoffs);
        if (!measurements.scan_handoffs?.desire) return;
    }

    steps.push({ type: "scan", questionId: "scan_followup_memory" });
    const followup = asArray(scanAnswers.scan_followup_memory)[0];
    if (!followup) return;
    if (followup === "often" || followup === "very_often") {
        appendMeasurement(steps, "scan_followup", measurements.scan_followup);
        if (!measurements.scan_followup?.desire) return;
    }

    steps.push({ type: "scan", questionId: "scan_visibility" });
    const visibility = asArray(scanAnswers.scan_visibility)[0];
    if (!visibility) return;
    if (visibility === "sometimes_hard" || visibility === "hard") {
        appendMeasurement(steps, "scan_visibility", measurements.scan_visibility);
    }

    void order;
}

export function progressStageForStep(type: FlowStep["type"] | "result"): ProgressStageId {
    if (type === "context") return "context";
    if (type === "priority") return "priority";
    if (type === "reality" || type === "scan" || type === "solution_followup") return "reality";
    if (type === "measure" || type === "optimization_probe" || type === "optimization_areas") {
        return "qualification";
    }
    return "results";
}

export function stepKey(step: FlowStep): string {
    switch (step.type) {
        case "context":
            return `context:${step.questionId}`;
        case "reality":
            return `reality:${step.questionId}`;
        case "solution_followup":
            return `solution_followup:${step.solutionId}`;
        case "optimization_probe":
            return `optimization_probe:${step.topic}`;
        case "optimization_areas":
            return `optimization_areas:${step.topic}:${step.priority}`;
        case "scan":
            return `scan:${step.questionId}`;
        case "measure":
            return `measure:${step.targetId}:${step.scale}`;
        default:
            return step.type;
    }
}
