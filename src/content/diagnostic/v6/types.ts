import specJson from "./spec.json";

export const diagnosticSpec = specJson;

export type BusinessStage = "testing" | "early" | "regular" | "established";
export type BusinessType = "services" | "products" | "both" | "other";
export type WorkModel = "appointments" | "projects" | "orders" | "recurring" | "other";

export type PriorityId =
    | "test_offer"
    | "sell_more"
    | "serve_clients"
    | "organize_work"
    | "save_time"
    | "visibility_growth"
    | "nothing_specific"
    | "other";

export type TopicId = "offer_testing" | "sales_orders" | "product_information" | "operational_scan";

export type Classification =
    | "healthy_close"
    | "likely_healthy"
    | "friction_candidate"
    | "fit_gap_candidate"
    | "exploration_candidate"
    | "emerging_capability_candidate"
    | "close_no_opportunity"
    | "low_confidence_exploration"
    | "low_friction_close"
    | "optimization_interest"
    | "optimization_exploration";

export type PriorityAlignment = "direct" | "indirect" | "none";

export type OpportunityType =
    | "improvement"
    | "emerging"
    | "exploration"
    | "healthy"
    | "optimization"
    | "fit_gap";
export type GainLevel = "low" | "moderate" | "important";
export type ProgressStageId = "context" | "priority" | "reality" | "qualification" | "results";

export type FrequencyId = "rare" | "monthly" | "weekly" | "daily";
export type EffortId = "very_little" | "some" | "quite_a_bit" | "a_lot";
export type DesireId = "not_really" | "a_little" | "quite" | "a_lot";

export type MeasurementState = {
    frequency?: FrequencyId;
    effort?: EffortId;
    desire?: DesireId;
};

export type DiagnosticContext = {
    stage?: BusinessStage;
    business_type?: BusinessType;
    work_model?: WorkModel[];
};

export type RealityAnswerValue = string | string[];

export type TopicState = {
    answers: Record<string, RealityAnswerValue>;
    classification?: Classification;
    measurement?: MeasurementState;
    mode?: "existing_process" | "emerging_capability" | "closed" | "not_applicable";
};

export type OptionalNotesState = {
    byTopic?: Partial<Record<TopicId, string>>;
    final?: string;
};

export type CoverageUnit =
    | "customer_demand_or_sales"
    | "delivery_or_work_execution"
    | "manual_repetitive_work"
    | "information_and_tools"
    | "followups_and_memory"
    | "work_visibility";

export type GeneratedOpportunity = {
    id: string;
    type: OpportunityType;
    topic: TopicId | "general";
    why: string;
    potentialGain: GainLevel;
    whatWeNoticed: string[];
    /** Declared priority influences ranking/explanation, never invents evidence */
    priorityAlignment?: PriorityAlignment;
};

export type DiagnosticV6Result = {
    opportunities: GeneratedOpportunity[];
    whatWeNoticed: string[];
    hasCredibleOpportunity: boolean;
    coverageUnits: CoverageUnit[];
    coverageSufficient: boolean;
    message?: string;
};

export type DiagnosticV6Phase =
    | "intro"
    | "context"
    | "priority"
    | "reality"
    | "qualification"
    | "scan"
    | "optional_context"
    | "result"
    | "resume"
    | "done";

/** Compact session snapshot stored with the lead for CRM analysis (no free-text PII). */
export type DiagnosticSessionStats = {
    started_at: string;
    completed_at: string;
    duration_ms: number;
    steps_completed: number;
    total_steps: number;
    was_resume: boolean;
};

export type DiagnosticV6AnswersPayload = {
    version: 6;
    /** e.g. "6.5" — accept any 6.x string for forward compatibility */
    specVersion: string;
    language: "fr" | "en";
    context: DiagnosticContext;
    currentPriority?: PriorityId[];
    topicStates: Partial<Record<TopicId, TopicState>>;
    scanAnswers: Record<string, RealityAnswerValue>;
    measurements: Partial<Record<string, MeasurementState>>;
    optionalNotes: OptionalNotesState;
    result: DiagnosticV6Result;
    session?: DiagnosticSessionStats;
};

export type FlowStep =
    | { type: "context"; questionId: "context_stage" | "context_business_type" | "context_work_model" }
    | { type: "priority" }
    | { type: "reality"; questionId: string; topic: TopicId }
    | { type: "solution_followup"; solutionId: "website"; topic: TopicId }
    | { type: "optimization_probe"; topic: TopicId }
    | { type: "optimization_areas"; topic: TopicId; priority: PriorityId }
    | { type: "scan"; questionId: string }
    | { type: "measure"; targetId: string; scale: "frequency" | "effort" | "desire" }
    | { type: "optional_context" };
