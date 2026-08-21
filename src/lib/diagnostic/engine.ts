import { GENERIC_QUESTIONS } from "@/content/diagnostic/packs/generic";
import { intensityForAnswer } from "@/content/diagnostic/scales";
import type { DiagnosticQuestion, DiagnosticResponses, StageId } from "@/content/diagnostic/types";

/**
 * Ordered sequence filtered by selected lifecycle stages.
 * Follow-ups included only when parent answer is intense enough.
 */
export function getQuestionSequence(
    selectedStages: StageId[],
    responses: DiagnosticResponses = {},
    pack: DiagnosticQuestion[] = GENERIC_QUESTIONS,
): DiagnosticQuestion[] {
    const allowed = new Set(selectedStages);
    const out: DiagnosticQuestion[] = [];

    for (const q of pack) {
        if (!allowed.has(q.stage)) continue;

        if (!q.followUpOf) {
            out.push(q);
            continue;
        }
        const parent = pack.find((p) => p.id === q.followUpOf);
        const parentValue = responses[q.followUpOf];
        if (!parent || !parentValue) continue;
        if (!allowed.has(parent.stage)) continue;
        const intensity = intensityForAnswer(parent.answerType, parentValue);
        if (intensity >= (q.showIfMinIntensity ?? 3)) {
            out.push(q);
        }
    }

    return out;
}
