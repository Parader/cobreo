import specJson from "../v8/spec.json";

export const diagnosticSpecV7 = specJson;
/** Alias for v8 catalog consumers while export name stays diagnosticSpecV7. */
export const diagnosticSpec = diagnosticSpecV7;

export type ProgressStageId = "company" | "ambitions" | "discovery" | "priorities" | "results";

export type AmbitionId =
    | "find_clients"
    | "convert_requests"
    | "grow_existing_customers"
    /** @deprecated split into find_clients / convert_requests / grow_existing_customers in spec 8.2 */
    | "grow_sales"
    | "improve_client_experience"
    | "save_time"
    | "organize_work"
    | "improve_team"
    | "better_decisions"
    | "improve_profitability"
    | "improve_offer"
    | "prepare_growth"
    | "use_information_better"
    | "improve_tools"
    | "nothing_specific"
    | "other";

export type AreaId =
    | "leadership_performance"
    | "sales_growth"
    | "clients_service"
    | "work_operations"
    | "team_people"
    | "finance_profitability"
    | "information_ways"
    | "offer_development"
    | "tools_systems";

export type CoverageState =
    | "covered"
    | "partially_covered"
    | "potentially_uncovered"
    | "confirmed_uncovered_relevant"
    | "not_applicable"
    | "unknown"
    | "covered_unknown_fit"
    | "covered_good_fit"
    | "covered_partial_fit";

export type OpportunityType =
    | "improvement"
    | "optimization_without_pain"
    | "emerging_capability"
    | "coverage_expansion"
    | "fit_gap"
    | "exploration";

export type GainLevel = "low" | "moderate" | "important";
export type PotentialLevel = "important" | "moderate" | "explore";
export type ConfidenceLevel = "high" | "medium" | "low";

export type LensId =
    | "operations"
    | "automation"
    | "information"
    | "customer_experience"
    | "decision_support"
    | "tailored_tools";

export type CompanyContext = {
    company_stage?: string;
    company_size?: string;
    customer_types?: string[];
    work_models?: string[];
};

/** Optional post-questionnaire enrichment — never prospect-visible. */
export type InternalContext = {
    sector_hint?: string | null;
};

export type AmbitionsState = {
    declared: AmbitionId[];
};

export type AreaAnswerValue = string[];

export type FitCheckState = {
    activityLabel?: string;
    answerId?: string;
    state?: "good_fit" | "fit_gap" | "unknown";
};

export type AutomationInterest = {
    tasks?: string[];
};

export type ConfirmationAnswers = Record<string, string | string[]>;

export type FreeTextState = {
    byArea?: Partial<Record<AreaId, string>>;
    final?: string;
};

export type PrioritySectionCard = {
    areaId: AreaId;
    title: string;
    signals: string[];
    potential: string;
    score: number;
};

export type PossibilitySourceTier = "observed" | "emerging" | "suggested";

export type ProspectServiceId =
    | "operations_optimization"
    | "automation"
    | "information_decision"
    | "customer_experience"
    | "online_presence"
    | "custom_tool"
    | "internal_tool";

export type PossibilityCandidate = {
    id: string; // `${areaId}:${possibilityId}`
    possibilityId: string;
    areaId: AreaId;
    sectionLabel: string;
    label: string;
    sourceTier: PossibilitySourceTier;
    services: ProspectServiceId[];
    score: number;
};

export type TopicId =
    | "clients"
    | "sales"
    | "work"
    | "information"
    | "management_finance"
    | "team"
    | "development"
    | "tools";

export type TopicCandidate = {
    id: TopicId;
    label: string;
    summary: string;
    sourceSections: AreaId[];
    memberPossibilityIds: string[];
};

export type SelectedPossibility = {
    id: string;
    possibilityId: string;
    areaId: AreaId;
    label: string;
    sectionLabel: string;
    services: ProspectServiceId[];
};

export type GeneratedOpportunity = {
    id: string;
    type: OpportunityType;
    title: string;
    whatWeSee: string;
    whatCouldImprove: string;
    whatItCouldBring: string;
    whatWeCouldExplore: string;
    possibilities?: string[];
    lenses: LensId[];
    confidence: ConfidenceLevel;
    areaId?: AreaId;
    capability?: string;
    /** @deprecated kept for admin/fallback */
    why: string;
    potentialGain: GainLevel;
    whatWeNoticed: string[];
    opportunity: string;
};

export type PrioritySectionSummary = {
    areaId: AreaId;
    title: string;
    signals: string[];
};

export type ServiceSectionCard = {
    areaId: AreaId;
    title: string;
    services: Array<{
        id: ProspectServiceId;
        label: string;
    }>;
    /** Short reasons for the collapsed “Pourquoi ces services?” disclosure */
    why: string[];
    score: number;
};

export type DiagnosticV7Result = {
    declaredAmbitions: AmbitionId[];
    message?: string;
    /** Primary v7.11 / v8 prospect result */
    serviceSections: ServiceSectionCard[];
    prioritySections: PrioritySectionSummary[];
    /** V8: respondent-confirmed possibilities (service mapping source of truth) */
    selectedPossibilities: SelectedPossibility[];
    /** Kept for admin/QA; not the prospect-facing lead content in v7.11 */
    opportunities: GeneratedOpportunity[];
    exploratory?: GeneratedOpportunity | null;
    strengths: string[];
    whatWeNoticed: string[];
    areasExplored: AreaId[];
    hasCredibleOpportunity: boolean;
};

export type DiagnosticV7Phase =
    | "intro"
    | "company"
    | "ambitions"
    | "discovery"
    | "priorities"
    | "result"
    | "resume"
    | "done";

export type DiagnosticSessionStats = {
    started_at: string;
    completed_at: string;
    duration_ms: number;
    steps_completed: number;
    total_steps: number;
    was_resume: boolean;
};

export type DiagnosticV7AnswersPayload = {
    version: 8;
    specVersion: "8.3";
    language: "fr" | "en";
    companyContext: CompanyContext;
    ambitions: AmbitionsState;
    applicableAreas: AreaId[];
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>;
    capabilities: Record<string, CoverageState>;
    confirmationAnswers: ConfirmationAnswers;
    fitChecks: Record<string, FitCheckState>;
    automationInterest: AutomationInterest;
    /** Topic ids chosen on choose_topics */
    selectedTopics: Array<TopicId | "none_selected">;
    /** Derived micro-possibility ids for scoring / CRM */
    selectedPossibilities: Array<string | "none_selected">;
    /** Kept for admin compat; derived from selected possibility areas */
    prioritySections: Array<AreaId | "none_priority">;
    freeText: FreeTextState;
    result: DiagnosticV7Result;
    session?: DiagnosticSessionStats;
    /** Optional enrichment — never collected in the prospect flow */
    internalContext?: InternalContext;
};

export type FlowStep =
    | { type: "company"; questionId: string }
    | { type: "declared_ambitions" }
    | { type: "area_scan"; areaId: AreaId }
    | { type: "simplification" }
    | { type: "section_priorities" }
    | { type: "choose_topics" }
    | { type: "review_possibilities" }
    | { type: "possibility_followup" }
    | { type: "tools_fit" }
    | { type: "optional_notes" };
