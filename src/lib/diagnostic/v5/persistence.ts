import type {
    DeepDiveState,
    DiagnosticContext,
    DiagnosticV5Phase,
    DiagnosticV5Result,
    DimensionId,
    OptionalNotesState,
    QualificationState,
    RadarResponse,
} from "@/content/diagnostic/v5/types";

const STORAGE_KEY = "cobreo_diagnostic_draft_v54";

export type DiagnosticStatus = "fresh" | "in_progress" | "completed";

export type DiagnosticV5Draft = {
    version: 54;
    phase: DiagnosticV5Phase;
    stepIndex: number;
    context: DiagnosticContext;
    selectedDimensions: DimensionId[];
    radarResponses: Partial<Record<DimensionId, RadarResponse>>;
    qualification: QualificationState;
    deepDive: DeepDiveState;
    optionalNotes: OptionalNotesState;
    /** User chose to skip remaining radars */
    skipRemainingRadars?: boolean;
    /** Early-exit already shown / decided */
    earlyExitSeen?: boolean;
    result?: DiagnosticV5Result;
    status: "in_progress" | "completed";
    updatedAt: number;
};

export function emptyDraft(): DiagnosticV5Draft {
    return {
        version: 54,
        phase: "context",
        stepIndex: 0,
        context: {},
        selectedDimensions: [],
        radarResponses: {},
        qualification: {},
        deepDive: {},
        optionalNotes: {},
        skipRemainingRadars: false,
        earlyExitSeen: false,
        status: "in_progress",
        updatedAt: Date.now(),
    };
}

export function loadDiagnosticDraft(): DiagnosticV5Draft | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as Partial<DiagnosticV5Draft>;
        if (!parsed || parsed.version !== 54) return null;
        return {
            ...emptyDraft(),
            ...parsed,
            version: 54,
            context: parsed.context || {},
            selectedDimensions: parsed.selectedDimensions || [],
            radarResponses: parsed.radarResponses || {},
            qualification: parsed.qualification || {},
            deepDive: parsed.deepDive || {},
            optionalNotes: parsed.optionalNotes || {},
            skipRemainingRadars: Boolean(parsed.skipRemainingRadars),
            earlyExitSeen: Boolean(parsed.earlyExitSeen),
            status: parsed.status === "completed" ? "completed" : "in_progress",
            phase: parsed.phase || "context",
            stepIndex: parsed.stepIndex || 0,
            updatedAt: parsed.updatedAt || Date.now(),
        };
    } catch {
        return null;
    }
}

export function saveDiagnosticDraft(draft: DiagnosticV5Draft) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ ...draft, version: 54, updatedAt: Date.now() }),
        );
    } catch {
        /* ignore quota */
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
    if (draft.stepIndex > 0 || Object.keys(draft.context).length > 0 || draft.selectedDimensions.length > 0) {
        return "in_progress";
    }
    return "fresh";
}

export function isDraftComplete(draft: DiagnosticV5Draft): boolean {
    return draft.status === "completed" && Boolean(draft.result);
}
