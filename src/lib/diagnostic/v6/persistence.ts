import type {
    DiagnosticContext,
    DiagnosticV6Phase,
    DiagnosticV6Result,
    MeasurementState,
    OptionalNotesState,
    PriorityId,
    RealityAnswerValue,
    TopicId,
    TopicState,
} from "@/content/diagnostic/v6/types";

const STORAGE_KEY = "cobreo_diagnostic_draft_v66";

export type DiagnosticStatus = "fresh" | "in_progress" | "completed";

export type DiagnosticV6Draft = {
    version: 66;
    phase: DiagnosticV6Phase;
    stepIndex: number;
    context: DiagnosticContext;
    currentPriority: PriorityId[];
    topicStates: Partial<Record<TopicId, TopicState>>;
    scanAnswers: Record<string, RealityAnswerValue>;
    measurements: Partial<Record<string, MeasurementState>>;
    optionalNotes: OptionalNotesState;
    result?: DiagnosticV6Result;
    status: "in_progress" | "completed";
    updatedAt: number;
    /** Epoch ms when the user first engaged this draft (for CRM session stats). */
    startedAt?: number;
    wasResumed?: boolean;
};

export function emptyDraft(): DiagnosticV6Draft {
    return {
        version: 66,
        phase: "intro",
        stepIndex: 0,
        context: {},
        currentPriority: [],
        topicStates: {},
        scanAnswers: {},
        measurements: {},
        optionalNotes: {},
        status: "in_progress",
        updatedAt: Date.now(),
        startedAt: Date.now(),
        wasResumed: false,
    };
}

/** True only after the user has answered at least the first question (or gone further). */
export function hasDiagnosticProgress(
    draft: Pick<
        DiagnosticV6Draft,
        "stepIndex" | "context" | "currentPriority" | "topicStates" | "scanAnswers" | "measurements"
    >,
): boolean {
    if (draft.stepIndex > 0) return true;
    if ((draft.currentPriority?.length ?? 0) > 0) return true;
    if (draft.context?.stage) return true;
    if (draft.context?.business_type) return true;
    if (Array.isArray(draft.context?.work_model) && draft.context.work_model.length > 0) return true;
    if (Object.keys(draft.topicStates ?? {}).length > 0) return true;
    if (Object.keys(draft.scanAnswers ?? {}).length > 0) return true;
    if (Object.keys(draft.measurements ?? {}).length > 0) return true;
    return false;
}

function normalizeContext(raw?: DiagnosticContext & { work_model?: string | string[] }): DiagnosticContext {
    const workModel = raw?.work_model;
    const normalizedWork = !workModel
        ? undefined
        : Array.isArray(workModel)
          ? workModel
          : [workModel];
    const next: DiagnosticContext = { ...(raw || {}) };
    if (normalizedWork && normalizedWork.length > 0) {
        next.work_model = normalizedWork as DiagnosticContext["work_model"];
    } else {
        delete next.work_model;
    }
    // Drop empty / undefined keys so Object.keys never fakes progress
    (Object.keys(next) as (keyof DiagnosticContext)[]).forEach((key) => {
        const value = next[key];
        if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
            delete next[key];
        }
    });
    return next;
}

export function loadDiagnosticDraft(): DiagnosticV6Draft | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<DiagnosticV6Draft> & {
            currentPriority?: PriorityId | PriorityId[];
            context?: DiagnosticContext & { work_model?: string | string[] };
        };
        if (!parsed || parsed.version !== 66) return null;
        const priority = Array.isArray(parsed.currentPriority)
            ? parsed.currentPriority
            : parsed.currentPriority
              ? [parsed.currentPriority]
              : [];
        return {
            ...emptyDraft(),
            ...parsed,
            version: 66,
            context: normalizeContext(parsed.context),
            currentPriority: priority,
            topicStates: parsed.topicStates || {},
            scanAnswers: parsed.scanAnswers || {},
            measurements: parsed.measurements || {},
            optionalNotes: parsed.optionalNotes || {},
            status: parsed.status === "completed" ? "completed" : "in_progress",
            phase: parsed.phase || "context",
            stepIndex: parsed.stepIndex || 0,
            updatedAt: parsed.updatedAt || Date.now(),
            startedAt: typeof parsed.startedAt === "number" ? parsed.startedAt : parsed.updatedAt || Date.now(),
            wasResumed: Boolean(parsed.wasResumed),
        };
    } catch {
        return null;
    }
}

export function saveDiagnosticDraft(draft: DiagnosticV6Draft) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
                ...draft,
                context: normalizeContext(draft.context),
                version: 66,
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
