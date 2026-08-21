import { getQuestionSequence } from "@/lib/diagnostic/engine";
import type { DiagnosticResponses, StageId, StoredAnswer } from "@/content/diagnostic/types";

const STORAGE_KEY = "cobreo_diagnostic_draft_v4";
const LEGACY_STORAGE_KEY = "cobreo_diagnostic_draft_v3";

export type DiagnosticStatus = "fresh" | "in_progress" | "completed";

export type DiagnosticDraft = {
    selectedStages: StageId[];
    index: number;
    responses: DiagnosticResponses;
    /** in_progress = mid-quiz; completed = user finished the last question and reached results */
    status: "in_progress" | "completed";
    updatedAt: number;
};

function parseDraft(raw: string): DiagnosticDraft | null {
    try {
        const parsed = JSON.parse(raw) as Partial<DiagnosticDraft>;
        if (!parsed || typeof parsed !== "object") return null;
        return {
            selectedStages: parsed.selectedStages || [],
            index: parsed.index || 0,
            responses: parsed.responses || {},
            status: parsed.status === "completed" ? "completed" : "in_progress",
            updatedAt: parsed.updatedAt || Date.now(),
        };
    } catch {
        return null;
    }
}

/** Only trust explicit completion after the last question — never infer from "near the end". */
export function isDraftComplete(draft: DiagnosticDraft): boolean {
    if (draft.status !== "completed") return false;
    if (!draft.selectedStages.length) return false;
    const seq = getQuestionSequence(draft.selectedStages, draft.responses);
    if (seq.length === 0) return false;
    // Still mid-sequence → not finished (also heals false "completed" writes)
    if (draft.index < seq.length - 1) return false;
    return true;
}

function normalizeDraft(draft: DiagnosticDraft): DiagnosticDraft {
    if (draft.status === "completed" && !isDraftComplete(draft)) {
        return { ...draft, status: "in_progress" };
    }
    return draft;
}

export function loadDiagnosticDraft(): DiagnosticDraft | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = parseDraft(raw);
            if (!parsed) return null;
            const normalized = normalizeDraft(parsed);
            if (normalized.status !== parsed.status) {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...normalized, updatedAt: Date.now() }));
            }
            return normalized;
        }

        // Migrate unfinished/completed drafts from previous key
        const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
        if (!legacy) return null;
        const migrated = parseDraft(legacy);
        if (migrated) {
            const normalized = normalizeDraft(migrated);
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
            window.localStorage.removeItem(LEGACY_STORAGE_KEY);
            return normalized;
        }
        return null;
    } catch {
        return null;
    }
}

export function getDiagnosticStatus(): DiagnosticStatus {
    const draft = loadDiagnosticDraft();
    if (!draft) return "fresh";
    if (isDraftComplete(draft)) return "completed";
    if (draft.selectedStages?.length || Object.keys(draft.responses || {}).length > 0) {
        return "in_progress";
    }
    return "fresh";
}

export function saveDiagnosticDraft(
    draft: Omit<DiagnosticDraft, "updatedAt"> & { status?: DiagnosticDraft["status"] },
) {
    if (typeof window === "undefined") return;
    try {
        const payload: DiagnosticDraft = {
            selectedStages: draft.selectedStages,
            index: draft.index,
            responses: draft.responses,
            status: draft.status ?? "in_progress",
            updatedAt: Date.now(),
        };
        // Never persist "completed" unless the draft actually finished the sequence
        const normalized = normalizeDraft(payload);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
        // ignore
    }
}

export function clearDiagnosticDraft() {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
        // ignore
    }
}

export function setResponse(responses: DiagnosticResponses, id: string, value: StoredAnswer): DiagnosticResponses {
    return { ...responses, [id]: value };
}
