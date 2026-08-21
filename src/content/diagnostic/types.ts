export const STAGE_IDS = [
    "acquisition",
    "conversion",
    "delivery",
    "coordination",
    "admin",
    "tools",
    "team",
] as const;

export type StageId = (typeof STAGE_IDS)[number];

/** Lifecycle zones shown on the result screen (exclude transversal layers as primary cards if desired) */
export const RESULT_STAGE_IDS = ["acquisition", "conversion", "delivery", "coordination", "admin", "tools", "team"] as const;

export const SIGNAL_IDS = [
    "manual_work",
    "repetitive_work",
    "duplicate_entry",
    "information_fragmentation",
    "information_access",
    "follow_up",
    "visibility",
    "coordination",
    "dependency_on_people",
    "software_fragmentation",
    "software_overlap",
    "integration",
    "automation_potential",
    "reporting",
] as const;

export type SignalId = (typeof SIGNAL_IDS)[number];

export const ANSWER_TYPES = ["frequency", "agreement", "ease", "yesPartialNo", "channels"] as const;
export type AnswerType = (typeof ANSWER_TYPES)[number];

export type OpportunityBand = "low" | "some" | "moderate" | "high";

export type SectorId = "generic" | "construction" | "clinic" | "professional";

export type FrequencyValue = "never" | "rarely" | "sometimes" | "often" | "very_often";
export type AgreementValue = "not_at_all" | "little" | "somewhat" | "a_lot" | "completely";
export type EaseValue = "very_hard" | "hard" | "acceptable" | "easy" | "very_easy";
export type YesPartialNoValue = "yes" | "partial" | "no";
export type ChannelValue =
    | "phone"
    | "email"
    | "web_form"
    | "messaging"
    | "social"
    | "referral"
    | "walk_in"
    | "other";

export type AnswerValue = FrequencyValue | AgreementValue | EaseValue | YesPartialNoValue | ChannelValue;
/** Single choice or multi-select (e.g. channels) */
export type StoredAnswer = AnswerValue | AnswerValue[];

export type DiagnosticQuestion = {
    id: string;
    stage: StageId;
    signals: SignalId[];
    answerType: AnswerType;
    weight: number;
    /** If set, only shown when parent answer intensity >= minIntensity (0–4) */
    followUpOf?: string;
    showIfMinIntensity?: number;
};

export type DiagnosticResponses = Record<string, StoredAnswer>;

export type ZoneResult = {
    stage: StageId;
    band: OpportunityBand;
    score: number;
};

export type DiagnosticResult = {
    zones: ZoneResult[];
    highlighted: StageId[];
};

export type DiagnosticAnswersPayload = {
    version: 2;
    sector: SectorId;
    selectedStages: StageId[];
    responses: DiagnosticResponses;
    result: DiagnosticResult;
};
