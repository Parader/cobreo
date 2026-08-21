import { GENERIC_QUESTIONS } from "@/content/diagnostic/packs/generic";
import { buildSummaryLine, scoreDiagnostic } from "@/content/diagnostic/scoring/rules";
import type { DiagnosticResponses, DiagnosticResult, StageId } from "@/content/diagnostic/types";

export function scoreFromResponses(responses: DiagnosticResponses, selectedStages?: StageId[]): DiagnosticResult {
    return scoreDiagnostic(responses, GENERIC_QUESTIONS, selectedStages);
}

export function summaryFromResult(result: DiagnosticResult, locale: string): string {
    return buildSummaryLine(result, locale);
}

export { scoreDiagnostic, buildSummaryLine };
