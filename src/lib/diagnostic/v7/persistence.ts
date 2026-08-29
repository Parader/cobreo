import type {
    AmbitionsState,
    AreaAnswerValue,
    AreaId,
    AutomationInterest,
    CompanyContext,
    ConfirmationAnswers,
    DiagnosticV7Phase,
    DiagnosticV7Result,
    FitCheckState,
    FreeTextState,
    InternalContext,
    TopicId,
} from "@/content/diagnostic/v7/types";

const STORAGE_KEY = "cobreo_diagnostic_draft_v83";
const LEGACY_KEYS = [
    "cobreo_diagnostic_draft_v82",
    "cobreo_diagnostic_draft_v81",
    "cobreo_diagnostic_draft_v80",
    "cobreo_diagnostic_draft_v711",
    "cobreo_diagnostic_draft_v710",
    "cobreo_diagnostic_draft_v79",
    "cobreo_diagnostic_draft_v7",
];

export type DiagnosticStatus = "fresh" | "in_progress" | "completed";

export type DiagnosticV7Draft = {
    version: 83;
    phase: DiagnosticV7Phase;
    stepIndex: number;
    companyContext: CompanyContext;
    ambitions: AmbitionsState;
    applicableAreas: AreaId[];
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>;
    confirmationAnswers: ConfirmationAnswers;
    fitChecks: Record<string, FitCheckState>;
    automationInterest: AutomationInterest;
    selectedTopics: Array<TopicId | "none_selected">;
    selectedPossibilities: Array<string | "none_selected">;
    /** Derived / admin compat */
    prioritySections: Array<AreaId | "none_priority">;
    freeText: FreeTextState;
    result?: DiagnosticV7Result;
    internalContext?: InternalContext;
    status: "in_progress" | "completed";
    updatedAt: number;
    startedAt?: number;
    wasResumed?: boolean;
};

export function emptyDraft(): DiagnosticV7Draft {
    return {
        version: 83,
        phase: "intro",
        stepIndex: 0,
        companyContext: {},
        ambitions: { declared: [] },
        applicableAreas: [],
        areaAnswers: {},
        confirmationAnswers: {},
        fitChecks: {},
        automationInterest: {},
        selectedTopics: [],
        selectedPossibilities: [],
        prioritySections: [],
        freeText: {},
        internalContext: { sector_hint: null },
        status: "in_progress",
        updatedAt: Date.now(),
        startedAt: Date.now(),
        wasResumed: false,
    };
}

export function hasDiagnosticProgress(
    draft: Pick<
        DiagnosticV7Draft,
        "stepIndex" | "companyContext" | "ambitions" | "applicableAreas" | "areaAnswers"
    >,
): boolean {
    if (draft.stepIndex > 0) return true;
    const ctx = draft.companyContext;
    if (ctx.company_stage || ctx.company_size) return true;
    if ((ctx.customer_types?.length ?? 0) > 0 || (ctx.work_models?.length ?? 0) > 0) return true;
    if ((draft.ambitions.declared?.length ?? 0) > 0) return true;
    if ((draft.applicableAreas?.length ?? 0) > 0) return true;
    if (Object.keys(draft.areaAnswers ?? {}).length > 0) return true;
    return false;
}

function cleanContext(raw?: CompanyContext): CompanyContext {
    const next: CompanyContext = { ...(raw || {}) };
    delete (next as { sector_family?: string }).sector_family;
    (Object.keys(next) as (keyof CompanyContext)[]).forEach((key) => {
        const value = next[key];
        if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
            delete next[key];
        }
    });
    return next;
}

function purgeLegacyDrafts() {
    if (typeof window === "undefined") return;
    for (const key of LEGACY_KEYS) {
        try {
            window.localStorage.removeItem(key);
        } catch {
            /* ignore */
        }
    }
}

export function loadDiagnosticDraft(): DiagnosticV7Draft | null {
    if (typeof window === "undefined") return null;
    purgeLegacyDrafts();
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<DiagnosticV7Draft>;
        if (!parsed || parsed.version !== 83) return null;
        return {
            ...emptyDraft(),
            ...parsed,
            version: 83,
            companyContext: cleanContext(parsed.companyContext),
            ambitions: {
                declared: parsed.ambitions?.declared ?? [],
            },
            applicableAreas: parsed.applicableAreas ?? [],
            areaAnswers: parsed.areaAnswers ?? {},
            confirmationAnswers: parsed.confirmationAnswers ?? {},
            fitChecks: parsed.fitChecks ?? {},
            automationInterest: parsed.automationInterest ?? {},
            selectedTopics: parsed.selectedTopics ?? [],
            selectedPossibilities: parsed.selectedPossibilities ?? [],
            prioritySections: parsed.prioritySections ?? [],
            freeText: parsed.freeText ?? {},
            internalContext: parsed.internalContext ?? { sector_hint: null },
            status: parsed.status === "completed" ? "completed" : "in_progress",
            phase: parsed.phase || "company",
            stepIndex: parsed.stepIndex || 0,
            updatedAt: parsed.updatedAt || Date.now(),
            startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : parsed.updatedAt || Date.now(),
            wasResumed: Boolean(parsed.wasResumed),
        };
    } catch {
        return null;
    }
}

export function saveDiagnosticDraft(draft: DiagnosticV7Draft) {
    if (typeof window === "undefined") return;
    try {
        purgeLegacyDrafts();
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                ...draft,
                companyContext: cleanContext(draft.companyContext),
                version: 83,
                updatedAt: Date.now(),
            }),
        );
    } catch {
        /* ignore */
    }
}

export function clearDiagnosticDraft() {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
        purgeLegacyDrafts();
    } catch {
        /* ignore */
    }
}

export function getDiagnosticStatus(): DiagnosticStatus {
    const draft = loadDiagnosticDraft();
    if (!draft) return "fresh";
    if (draft.status === "completed" && draft.result) return "completed";
    if (hasDiagnosticProgress(draft)) return "in_progress";
    return "fresh";
}
