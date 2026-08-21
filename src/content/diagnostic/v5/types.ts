import specJson from "./spec.json";

export const diagnosticSpec = specJson;

export const DIMENSION_IDS = [
    "requests",
    "onboarding",
    "delivery",
    "coordination",
    "client_followup",
    "admin",
    "information_tools",
    "management_continuity",
] as const;

export type DimensionId = (typeof DIMENSION_IDS)[number];

export type BusinessSituation = "starting" | "solo" | "small_team" | "established_team" | "other";
export type BusinessType = "services" | "products" | "both" | "other";
export type WorkModel = "appointments" | "projects" | "orders" | "recurring" | "mixed" | "other";

export type ImportanceId = "minimal" | "some" | "significant" | "high" | "unknown";
export type ConsequenceId =
    | "time"
    | "delay"
    | "forgetting"
    | "errors"
    | "customer"
    | "mental_load"
    | "visibility"
    | "capacity"
    | "cost"
    | "low_impact"
    | "unknown";

export type OpportunityLevel = "watch" | "possible" | "clear";
export type GainLevel = "low" | "moderate" | "important";
export type ResultKind = "opportunities" | "healthy" | "early_stage";

export type SignalId = string;
export type OpportunityId = string;

export type ProgressStageId = "context" | "explore" | "reality" | "impact" | "results";

export type DiagnosticContext = {
    business_situation?: BusinessSituation;
    business_type?: BusinessType;
    work_model?: WorkModel;
};

export type RadarResponse = {
    selected: string[];
    otherText?: string;
};

export type QualificationState = {
    priorityAnswerKey?: string; // `${dimension}:${answerId}`
    importance?: ImportanceId;
    consequences?: ConsequenceId[];
};

export type DeepDiveState = {
    manual_transfer?: string;
};

export type OptionalNotesState = {
    /** Per-dimension optional note (max once per dimension) */
    byDimension?: Partial<Record<DimensionId, string>>;
    /** Final note before results */
    final?: string;
};

export type GeneratedOpportunity = {
    id: OpportunityId;
    level: OpportunityLevel;
    score: number;
    confidence: number;
    signals: SignalId[];
    dimensions: DimensionId[];
    sourceAnswers: string[];
    consequences: ConsequenceId[];
    importance?: ImportanceId;
    why: string;
    potentialGain: GainLevel;
};

export type DiagnosticV5Result = {
    kind: ResultKind;
    opportunities: GeneratedOpportunity[];
    signals: SignalId[];
    whatWeNoticed: string[];
    message?: string;
};

export type DiagnosticV5Phase =
    | "context"
    | "dimension_select"
    | "radars"
    | "early_exit"
    | "qualification"
    | "deep_dive"
    | "optional_context"
    | "result"
    | "resume"
    | "done";

export type DiagnosticV5AnswersPayload = {
    version: 5;
    specVersion: "5.4";
    language: "fr";
    context: DiagnosticContext;
    selectedDimensions: DimensionId[];
    radarResponses: Partial<Record<DimensionId, RadarResponse>>;
    qualification: QualificationState;
    deepDive: DeepDiveState;
    optionalNotes: OptionalNotesState;
    result: DiagnosticV5Result;
};

export type FlowStep =
    | { type: "context"; questionId: "context_business_situation" | "context_business_type" | "context_work_model" }
    | { type: "dimension_select" }
    | { type: "radar"; dimension: DimensionId; radarId: string }
    | { type: "early_exit" }
    | { type: "qualify_priority" }
    | { type: "qualify_importance" }
    | { type: "qualify_consequence" }
    | { type: "deep_dive"; ruleId: string }
    | { type: "optional_context" };

export function labelFr(value: string | null | undefined, fallback = ""): string {
    return value?.trim() || fallback;
}
