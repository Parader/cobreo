import {
    CONSEQUENCE_LABELS_FR,
    getContextQuestions as getV5ContextQuestions,
    getDeepDiveRules,
    getDimension,
    getQualificationSpec as getV5QualificationSpec,
    getRadarForDimension,
    OPPORTUNITY_LABELS_FR as OPPORTUNITY_LABELS_V5,
} from "@/content/diagnostic/v5/catalog";
import {
    getContextQuestions as getV6ContextQuestions,
    getMeasurementActivityLabels,
    getMeasurementModel,
    getPrioritySpec,
    getRealityQuestion,
    getScanQuestion,
    opportunityLabel,
} from "@/content/diagnostic/v6/catalog";
import { GENERIC_QUESTIONS } from "@/content/diagnostic/packs/generic";
import { asMultiValue } from "@/content/diagnostic/scales";
import type {
    DiagnosticAnswersPayload,
    OpportunityBand,
    StageId,
    StoredAnswer,
} from "@/content/diagnostic/types";
import type { DiagnosticV5AnswersPayload } from "@/content/diagnostic/v5/types";
import type {
    DiagnosticSessionStats,
    DiagnosticV6AnswersPayload,
    TopicId,
} from "@/content/diagnostic/v6/types";
import type { DiagnosticV7AnswersPayload } from "@/content/diagnostic/v7/types";
import {
    ambitionLabel,
    areaLabel,
    getCompanyQuestion,
    getDeclaredAmbitionSpec,
    getScanAnswers,
} from "@/content/diagnostic/v7/catalog";
import { getTopicClusteringSpec } from "@/lib/diagnostic/v7/topics";
import { pickLocalized } from "@/lib/diagnostic/localize";

export type FormattedQaRow = {
    questionId: string;
    stage: StageId | string;
    answerType: string;
    values: string[];
    displayQuestion?: string;
    displayValues?: string[];
};

export type FormattedZone = {
    stage: StageId;
    band: OpportunityBand;
    score: number;
};

export type FormattedOpportunity = {
    id: string;
    label: string;
    level: string;
    why: string;
    potentialGain: string;
};

export type ParsedDiagnostic =
    | { version: 7; v7: DiagnosticV7AnswersPayload }
    | { version: 6; v6: DiagnosticV6AnswersPayload }
    | { version: 5; v5: DiagnosticV5AnswersPayload }
    | { version: 4; v4: DiagnosticAnswersPayload };

function isV7Family(raw: Record<string, unknown>): boolean {
    // v8 keeps the same answers shape as v7 (paths still under v7 modules)
    if ((raw.version === 7 || raw.version === 8) && raw.result && typeof raw.result === "object") {
        return true;
    }
    const spec = typeof raw.specVersion === "string" ? raw.specVersion : "";
    return /^(7|8)(\.|$)/.test(spec) && raw.result != null && typeof raw.result === "object";
}

function isV6Family(raw: Record<string, unknown>): boolean {
    if (raw.version === 6 && raw.result && typeof raw.result === "object") return true;
    const spec = typeof raw.specVersion === "string" ? raw.specVersion : "";
    return /^6(\.|$)/.test(spec) && raw.result != null && typeof raw.result === "object";
}

export function parseDiagnosticPayload(answers: unknown): ParsedDiagnostic | null {
    if (!answers || typeof answers !== "object") return null;
    const raw = answers as Record<string, unknown>;

    if (isV7Family(raw)) {
        return { version: 7, v7: raw as unknown as DiagnosticV7AnswersPayload };
    }

    if (isV6Family(raw)) {
        return { version: 6, v6: raw as unknown as DiagnosticV6AnswersPayload };
    }

    if ((raw.version === 5 || raw.specVersion === "5.4") && raw.result && typeof raw.result === "object") {
        return { version: 5, v5: raw as unknown as DiagnosticV5AnswersPayload };
    }

    if (raw.responses && typeof raw.responses === "object") {
        return { version: 4, v4: raw as unknown as DiagnosticAnswersPayload };
    }

    return null;
}

export function getAnswerLanguage(
    answers: unknown,
    fallbackLocale?: string | null,
): "fr" | "en" {
    if (answers && typeof answers === "object") {
        const lang = (answers as { language?: unknown }).language;
        if (lang === "en" || lang === "fr") return lang;
    }
    return fallbackLocale === "en" ? "en" : "fr";
}

export function getSpecVersionLabel(parsed: ParsedDiagnostic | null): string | null {
    if (!parsed) return null;
    if (parsed.version === 7) {
        if (parsed.v7.specVersion) return `v${parsed.v7.specVersion}`;
        return parsed.v7.version === 8 ? "v8" : "v7";
    }
    if (parsed.version === 6) {
        return parsed.v6.specVersion ? `v${parsed.v6.specVersion}` : "v6";
    }
    if (parsed.version === 5) {
        return parsed.v5.specVersion ? `v${parsed.v5.specVersion}` : "v5";
    }
    return "v4";
}

export function getSessionStats(answers: unknown): DiagnosticSessionStats | null {
    if (!answers || typeof answers !== "object") return null;
    const session = (answers as { session?: unknown }).session;
    if (!session || typeof session !== "object") return null;
    const s = session as Record<string, unknown>;
    if (typeof s.duration_ms !== "number" || typeof s.completed_at !== "string") return null;
    return {
        started_at: typeof s.started_at === "string" ? s.started_at : s.completed_at,
        completed_at: s.completed_at,
        duration_ms: Math.max(0, s.duration_ms),
        steps_completed: typeof s.steps_completed === "number" ? s.steps_completed : 0,
        total_steps: typeof s.total_steps === "number" ? s.total_steps : 0,
        was_resume: Boolean(s.was_resume),
    };
}

export function formatDurationMs(ms: number, locale: string): string {
    const totalSec = Math.round(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    if (minutes <= 0) {
        return locale === "en" ? `${seconds}s` : `${seconds} s`;
    }
    if (seconds === 0) {
        return locale === "en" ? `${minutes} min` : `${minutes} min`;
    }
    return locale === "en" ? `${minutes}m ${seconds}s` : `${minutes} min ${seconds} s`;
}

export function formatDiagnosticQa(parsed: ParsedDiagnostic): FormattedQaRow[] {
    if (parsed.version === 7) return formatV7Qa(parsed.v7);
    if (parsed.version === 6) return formatV6Qa(parsed.v6);
    if (parsed.version === 5) return formatV5Qa(parsed.v5);
    return formatV4Qa(parsed.v4);
}

function formatV7Qa(payload: DiagnosticV7AnswersPayload): FormattedQaRow[] {
    const language = payload.language === "en" ? "en" : "fr";
    const rows: FormattedQaRow[] = [];

    for (const [key, value] of Object.entries(payload.companyContext || {})) {
        const q = getCompanyQuestion(key);
        const values = Array.isArray(value) ? value : value ? [String(value)] : [];
        if (!values.length) continue;
        rows.push({
            questionId: key,
            stage: "company",
            answerType: q?.kind || "single_select",
            values,
            displayQuestion:
                pickLocalized((q || {}) as Record<string, unknown>, "question", language) ||
                (q as { question_fr?: string } | undefined)?.question_fr ||
                key,
            displayValues: values.map((id) => {
                const answer = q?.answers.find((a) => a.id === id);
                return answer
                    ? pickLocalized(answer as Record<string, unknown>, "label", language) || answer.label_fr
                    : id;
            }),
        });
    }

    if (payload.ambitions?.declared?.length) {
        const declared = getDeclaredAmbitionSpec();
        rows.push({
            questionId: "declared_ambitions",
            stage: "ambitions",
            answerType: "multi_select",
            values: payload.ambitions.declared,
            displayQuestion:
                pickLocalized(declared as Record<string, unknown>, "question", language) || declared.question_fr,
            displayValues: payload.ambitions.declared.map((id) => ambitionLabel(id, language)),
        });
    }

    if (payload.applicableAreas?.length) {
        rows.push({
            questionId: "applicable_areas",
            stage: "coverage",
            answerType: "multi_select",
            values: payload.applicableAreas,
            displayQuestion:
                language === "en"
                    ? "Explored business areas (derived from ambitions)"
                    : "Domaines explorés (dérivés des ambitions)",
            displayValues: payload.applicableAreas.map((id) => areaLabel(id, language)),
        });
    }

    for (const [areaId, answers] of Object.entries(payload.areaAnswers || {})) {
        if (!answers?.length) continue;
        const options = getScanAnswers(areaId as import("@/content/diagnostic/v7/types").AreaId);
        rows.push({
            questionId: `scan_${areaId}`,
            stage: "coverage",
            answerType: "multi_select",
            values: answers,
            displayQuestion: areaLabel(areaId as import("@/content/diagnostic/v7/types").AreaId, language),
            displayValues: answers.map((id) => {
                const opt = options.find((a) => a.id === id);
                return opt
                    ? pickLocalized(opt as Record<string, unknown>, "label", language) || opt.label_fr
                    : id;
            }),
        });
    }

    if (payload.automationInterest?.tasks?.length) {
        rows.push({
            questionId: "automation_interest",
            stage: "discovery",
            answerType: "multi_select",
            values: payload.automationInterest.tasks,
            displayQuestion:
                language === "en" ? "Simplification checklist" : "Checklist de simplification",
            displayValues: payload.automationInterest.tasks,
        });
    }

    if (payload.selectedTopics?.length) {
        const clustering = getTopicClusteringSpec();
        const byId = new Map(clustering.topics.map((t) => [t.id, t]));
        rows.push({
            questionId: "choose_topics",
            stage: "priorities",
            answerType: "multi_select",
            values: payload.selectedTopics,
            displayQuestion:
                language === "en"
                    ? "Topics to improve"
                    : "Sujets à améliorer",
            displayValues: payload.selectedTopics.map((id) => {
                if (id === "none_selected") {
                    return language === "en" ? "None for now" : "Aucun pour le moment";
                }
                return byId.get(id)?.label_fr || id;
            }),
        });
    }

    if (payload.prioritySections?.length) {
        rows.push({
            questionId: "priority_sections",
            stage: "priorities",
            answerType: "multi_select",
            values: payload.prioritySections,
            displayQuestion:
                language === "en" ? "Priority sections" : "Sections prioritaires",
            displayValues: payload.prioritySections.map((id) =>
                id === "none_priority"
                    ? language === "en"
                        ? "None for now"
                        : "Aucune pour le moment"
                    : areaLabel(id, language),
            ),
        });
    }

    if (payload.freeText?.final?.trim()) {
        rows.push({
            questionId: "missing_improvement_idea",
            stage: "priorities",
            answerType: "free_text",
            values: [payload.freeText.final.trim()],
            displayQuestion:
                language === "en"
                    ? "Improvement or idea not covered"
                    : "Amélioration ou idée non abordée",
            displayValues: [payload.freeText.final.trim()],
        });
    }

    return rows;
}

function formatV4Qa(payload: DiagnosticAnswersPayload): FormattedQaRow[] {
    const byId = new Map(GENERIC_QUESTIONS.map((q) => [q.id, q]));
    const rows: FormattedQaRow[] = [];

    for (const [questionId, value] of Object.entries(payload.responses)) {
        const meta = byId.get(questionId);
        const values = normalizeAnswerValues(value);
        if (!values.length) continue;
        rows.push({
            questionId,
            stage: meta?.stage ?? "acquisition",
            answerType: meta?.answerType ?? "frequency",
            values,
        });
    }

    const order = new Map(GENERIC_QUESTIONS.map((q, i) => [q.id, i]));
    rows.sort((a, b) => (order.get(a.questionId) ?? 999) - (order.get(b.questionId) ?? 999));
    return rows;
}

function answerLabelFromSpec(
    answers: Array<{ id: string } & Record<string, unknown>>,
    id: string,
    language: string,
): string {
    const found = answers.find((a) => a.id === id);
    if (!found) return id;
    return pickLocalized(found, "label", language) || id;
}

function measureValueLabel(
    scale: "frequency" | "effort" | "desire",
    id: string,
    language: string,
): string {
    const model = getMeasurementModel() as unknown as Record<
        string,
        { answers?: (string | number)[][]; answers_en?: (string | number)[][] }
    >;
    const key = scale === "desire" ? "desire_to_improve" : scale;
    const block = model[key];
    if (!block) return id;
    const rows =
        language === "en" && block.answers_en?.length ? block.answers_en : (block.answers ?? []);
    const hit = rows.find((row) => row[0] === id);
    return typeof hit?.[1] === "string" ? hit[1] : id;
}

function formatMeasureRow(
    targetId: string,
    measure: { frequency?: string; effort?: string; desire?: string },
    language: string,
): FormattedQaRow {
    const labels = getMeasurementActivityLabels(targetId);
    const title =
        language === "en"
            ? labels.effort_subject_en || targetId
            : labels.effort_subject_fr || targetId;
    const freqPrefix = language === "en" ? "Frequency" : "Fréquence";
    const effortPrefix = language === "en" ? "Effort" : "Effort";
    const desirePrefix = language === "en" ? "Desire to improve" : "Envie d’améliorer";

    return {
        questionId: `measure_${targetId}`,
        stage: "measurement",
        answerType: "measure",
        values: [measure.frequency, measure.effort, measure.desire].filter(Boolean) as string[],
        displayQuestion: language === "en" ? `Measurement — ${title}` : `Mesure — ${title}`,
        displayValues: [
            measure.frequency &&
                `${freqPrefix}: ${measureValueLabel("frequency", measure.frequency, language)}`,
            measure.effort && `${effortPrefix}: ${measureValueLabel("effort", measure.effort, language)}`,
            measure.desire && `${desirePrefix}: ${measureValueLabel("desire", measure.desire, language)}`,
        ].filter(Boolean) as string[],
    };
}

function formatV6Qa(payload: DiagnosticV6AnswersPayload): FormattedQaRow[] {
    const language = payload.language === "en" ? "en" : "fr";
    const rows: FormattedQaRow[] = [];

    for (const q of getV6ContextQuestions()) {
        const key =
            q.id === "context_stage"
                ? "stage"
                : q.id === "context_business_type"
                  ? "business_type"
                  : "work_model";
        const value = payload.context[key as "stage" | "business_type" | "work_model"];
        if (!value || (Array.isArray(value) && !value.length)) continue;
        const values = Array.isArray(value) ? value : [value];
        const labels = values.map((id) =>
            answerLabelFromSpec(q.answers as Array<{ id: string } & Record<string, unknown>>, id, language),
        );
        rows.push({
            questionId: q.id,
            stage: "context",
            answerType: "context",
            values,
            displayQuestion: pickLocalized(q as Record<string, unknown>, "question", language) || q.id,
            displayValues: labels,
        });
    }

    if (payload.currentPriority?.length) {
        const priority = getPrioritySpec();
        rows.push({
            questionId: "current_priority",
            stage: "priority",
            answerType: "priority",
            values: payload.currentPriority,
            displayQuestion:
                pickLocalized(priority as Record<string, unknown>, "question", language) ||
                "current_priority",
            displayValues: payload.currentPriority.map((id) =>
                answerLabelFromSpec(
                    priority.answers as Array<{ id: string } & Record<string, unknown>>,
                    id,
                    language,
                ),
            ),
        });
    }

    for (const [topic, state] of Object.entries(payload.topicStates) as [
        TopicId,
        NonNullable<(typeof payload.topicStates)[TopicId]>,
    ][]) {
        for (const [questionId, value] of Object.entries(state.answers)) {
            const q = getRealityQuestion(questionId);
            const values = Array.isArray(value) ? value : [value];
            const labels = values.map((id) =>
                q
                    ? answerLabelFromSpec(
                          q.answers as Array<{ id: string } & Record<string, unknown>>,
                          id,
                          language,
                      )
                    : id,
            );
            rows.push({
                questionId,
                stage: topic,
                answerType: "reality",
                values,
                displayQuestion: q
                    ? pickLocalized(q as Record<string, unknown>, "question", language) || questionId
                    : questionId,
                displayValues: labels,
            });
        }
        if (state.measurement) {
            rows.push(formatMeasureRow(`topic_${topic}`, state.measurement, language));
        }
    }

    if (payload.scanAnswers || /^6\.[3-9]/.test(payload.specVersion) || payload.specVersion === "6.5") {
        for (const [questionId, value] of Object.entries(payload.scanAnswers ?? {})) {
            const q = getScanQuestion(questionId);
            const values = Array.isArray(value) ? value : [value];
            const labels = values.map((id) =>
                q
                    ? answerLabelFromSpec(
                          q.answers as Array<{ id: string } & Record<string, unknown>>,
                          id,
                          language,
                      )
                    : id,
            );
            rows.push({
                questionId,
                stage: "operational_scan",
                answerType: "scan",
                values,
                displayQuestion: q
                    ? pickLocalized(q as Record<string, unknown>, "question", language) || questionId
                    : questionId,
                displayValues: labels,
            });
        }
        for (const [targetId, measure] of Object.entries(payload.measurements ?? {})) {
            if (!measure) continue;
            rows.push(formatMeasureRow(targetId, measure, language));
        }
    }

    if (payload.optionalNotes?.final?.trim()) {
        rows.push({
            questionId: "final_optional_note",
            stage: "optional_context",
            answerType: "note",
            values: [payload.optionalNotes.final],
            displayQuestion: language === "en" ? "Final note" : "Précision finale",
            displayValues: [payload.optionalNotes.final],
        });
    }

    return rows;
}

function formatV5Qa(payload: DiagnosticV5AnswersPayload): FormattedQaRow[] {
    const rows: FormattedQaRow[] = [];

    for (const q of getV5ContextQuestions()) {
        const key =
            q.id === "context_business_situation"
                ? "business_situation"
                : q.id === "context_business_type"
                  ? "business_type"
                  : "work_model";
        const value = (payload.context as Record<string, string | undefined>)[key];
        if (!value) continue;
        const answer = q.answers.find((a) => a.id === value);
        rows.push({
            questionId: q.id,
            stage: "context",
            answerType: "context",
            values: [value],
            displayQuestion: (q.question as { fr?: string }).fr ?? q.id,
            displayValues: [answer?.label_fr ?? value],
        });
    }

    if (payload.selectedDimensions?.length) {
        rows.push({
            questionId: "selected_dimensions",
            stage: "dimensions",
            answerType: "selection",
            values: payload.selectedDimensions,
            displayQuestion: "Dimensions explorées",
            displayValues: payload.selectedDimensions.map((id) => getDimension(id)?.label_fr ?? id),
        });
    }

    for (const dimension of payload.selectedDimensions ?? []) {
        const response = payload.radarResponses?.[dimension];
        if (!response?.selected?.length) continue;
        const radar = getRadarForDimension(dimension, payload.context.business_situation);
        const question =
            (radar?.question as { fr?: string | null } | undefined)?.fr ||
            getDimension(dimension)?.label_fr ||
            dimension;
        const labels = response.selected.map((answerId) => {
            if (answerId === "other") {
                return response.otherText?.trim() ? `Autre : ${response.otherText.trim()}` : "Autre";
            }
            return radar?.answers.find((a) => a.id === answerId)?.label_fr ?? answerId;
        });
        rows.push({
            questionId: `radar_${dimension}`,
            stage: dimension,
            answerType: "radar",
            values: response.selected,
            displayQuestion: question,
            displayValues: labels,
        });
    }

    const qual = getV5QualificationSpec();
    if (payload.qualification?.importance) {
        const answer = qual.importance.answers.find((a) => a.id === payload.qualification.importance);
        rows.push({
            questionId: "qualify_importance",
            stage: "qualification",
            answerType: "importance",
            values: [payload.qualification.importance],
            displayQuestion: (qual.importance.question as { fr?: string }).fr ?? "Importance",
            displayValues: [answer?.label_fr ?? payload.qualification.importance],
        });
    }

    if (payload.qualification?.consequences?.length) {
        rows.push({
            questionId: "qualify_consequence",
            stage: "qualification",
            answerType: "consequence",
            values: payload.qualification.consequences,
            displayQuestion: (qual.consequence.question as { fr?: string }).fr ?? "Conséquences",
            displayValues: payload.qualification.consequences.map(
                (id) => CONSEQUENCE_LABELS_FR[id] ?? id,
            ),
        });
    }

    if (payload.deepDive?.manual_transfer) {
        const rule = getDeepDiveRules().find((r) => r.id === "deep_dive_manual_transfer");
        const answer = rule?.answers.find((a) => a.id === payload.deepDive.manual_transfer);
        rows.push({
            questionId: "deep_dive_manual_transfer",
            stage: "deep_dive",
            answerType: "deep_dive",
            values: [payload.deepDive.manual_transfer],
            displayQuestion: (rule?.question as { fr?: string } | undefined)?.fr ?? "Deep dive",
            displayValues: [answer?.label_fr ?? payload.deepDive.manual_transfer],
        });
    }

    return rows;
}

function normalizeAnswerValues(value: StoredAnswer): string[] {
    if (Array.isArray(value)) return asMultiValue(value);
    if (!value) return [];
    return [value];
}

export function formatZones(parsed: ParsedDiagnostic | null): FormattedZone[] {
    if (!parsed || parsed.version !== 4) return [];
    const payload = parsed.v4;
    if (!payload?.result?.zones?.length) return [];
    const order: OpportunityBand[] = ["high", "moderate", "some", "low"];
    return [...payload.result.zones].sort(
        (a, b) => order.indexOf(a.band) - order.indexOf(b.band) || b.score - a.score,
    );
}

export function formatOpportunities(parsed: ParsedDiagnostic | null): FormattedOpportunity[] {
    if (!parsed) return [];
    if (parsed.version === 7) {
        if (parsed.v7.result.serviceSections?.length) {
            return parsed.v7.result.serviceSections.flatMap((section) =>
                section.services.map((service) => ({
                    id: `${section.areaId}:${service.id}`,
                    label: `${section.title} — ${service.label}`,
                    level: "improvement" as const,
                    why: section.why.join(" · ") || section.title,
                    potentialGain: "moderate" as const,
                })),
            );
        }
        return parsed.v7.result.opportunities.map((op) => ({
            id: op.id,
            label: op.title,
            level: op.type,
            why: op.why,
            potentialGain: op.potentialGain,
        }));
    }
    if (parsed.version === 6) {
        const language = parsed.v6.language === "en" ? "en" : "fr";
        return parsed.v6.result.opportunities.map((op) => ({
            id: op.id,
            label: opportunityLabel(op.id, language),
            level: op.type,
            why: op.why,
            potentialGain: op.potentialGain,
        }));
    }
    if (parsed.version === 5) {
        return parsed.v5.result.opportunities.map((op) => ({
            id: op.id,
            label: OPPORTUNITY_LABELS_V5[op.id] ?? op.id,
            level: op.level,
            why: op.why,
            potentialGain: op.potentialGain,
        }));
    }
    return [];
}

export function formatResultKind(parsed: ParsedDiagnostic | null): string | null {
    if (!parsed) return null;
    if (parsed.version === 7) {
        return parsed.v7.result.hasCredibleOpportunity ? "opportunities" : "healthy";
    }
    if (parsed.version === 6) {
        return parsed.v6.result.hasCredibleOpportunity ? "opportunities" : "healthy";
    }
    if (parsed.version === 5) return parsed.v5.result.kind;
    return null;
}
