import {
    getDeepDiveRules,
    getEarlyStageMessage,
    getHealthyMessage,
    getOpportunityRules,
    getRadarForDimension,
    OPPORTUNITY_LABELS_FR,
    CONSEQUENCE_LABELS_FR,
} from "@/content/diagnostic/v5/catalog";
import type {
    ConsequenceId,
    DiagnosticContext,
    DiagnosticV5Result,
    DimensionId,
    GeneratedOpportunity,
    ImportanceId,
    OpportunityId,
    QualificationState,
    RadarResponse,
    SignalId,
    DeepDiveState,
} from "@/content/diagnostic/v5/types";

const IMPORTANCE_SCORE: Record<Exclude<ImportanceId, "unknown">, number> = {
    minimal: 0,
    some: 1,
    significant: 2,
    high: 3,
};

const CONSEQUENCE_WEIGHT: Record<ConsequenceId, number> = {
    time: 1,
    delay: 1,
    forgetting: 1.2,
    errors: 1.2,
    customer: 1.2,
    mental_load: 0.8,
    visibility: 1,
    capacity: 1.3,
    cost: 1.2,
    low_impact: 0,
    unknown: 0,
};

function answerKey(dimension: DimensionId, answerId: string) {
    return `${dimension}:${answerId}`;
}

function collectRadarSignals(
    selectedDimensions: DimensionId[],
    radarResponses: Partial<Record<DimensionId, RadarResponse>>,
    context: DiagnosticContext,
    deepDive: DeepDiveState,
): {
    signals: SignalId[];
    answerMeta: Array<{ key: string; dimension: DimensionId; answerId: string; signals: SignalId[]; label: string }>;
} {
    const signals = new Set<SignalId>();
    const answerMeta: Array<{
        key: string;
        dimension: DimensionId;
        answerId: string;
        signals: SignalId[];
        label: string;
    }> = [];

    for (const dimension of selectedDimensions) {
        const response = radarResponses[dimension];
        if (!response?.selected?.length) continue;
        if (response.selected.includes("none")) continue;

        const radar = getRadarForDimension(dimension, context.business_situation);
        if (!radar) continue;

        for (const answerId of response.selected) {
            if (answerId === "other" || answerId === "none") continue;
            const answer = radar.answers.find((a) => a.id === answerId);
            if (!answer) continue;
            const answerSignals = (answer.signals || []) as SignalId[];
            answerSignals.forEach((s) => signals.add(s));
            answerMeta.push({
                key: answerKey(dimension, answerId),
                dimension,
                answerId,
                signals: answerSignals,
                label: answer.label_fr,
            });
        }
    }

    const deepDiveRule = getDeepDiveRules()[0];
    if (deepDive.manual_transfer) {
        const opt = deepDiveRule.answers.find((a) => a.id === deepDive.manual_transfer);
        opt?.adds_signals?.forEach((s) => signals.add(s as SignalId));
    }

    return { signals: [...signals], answerMeta };
}

function opportunitiesForSignals(signals: SignalId[]): OpportunityId[] {
    const out = new Set<OpportunityId>();
    for (const rule of getOpportunityRules()) {
        const needed = rule.when_signals_include as SignalId[];
        if (needed.some((s) => signals.includes(s))) {
            for (const opp of rule.allowed_opportunities as OpportunityId[]) {
                out.add(opp);
            }
        }
    }
    return [...out];
}

function levelFromScore(score: number): GeneratedOpportunity["level"] {
    if (score >= 6.5) return "clear";
    if (score >= 3.5) return "possible";
    return "watch";
}

function gainFromScore(score: number): GeneratedOpportunity["potentialGain"] {
    if (score >= 6.5) return "important";
    if (score >= 3.5) return "moderate";
    return "low";
}

function consequenceScore(consequences: ConsequenceId[]): number {
    if (!consequences.length) return 0;
    if (consequences.includes("low_impact") || consequences.includes("unknown")) return 0;
    return consequences.reduce((sum, c) => sum + (CONSEQUENCE_WEIGHT[c] ?? 0), 0);
}

export function generateDiagnosticResult(input: {
    context: DiagnosticContext;
    selectedDimensions: DimensionId[];
    radarResponses: Partial<Record<DimensionId, RadarResponse>>;
    qualification: QualificationState;
    deepDive: DeepDiveState;
}): DiagnosticV5Result {
    const { context, selectedDimensions, radarResponses, qualification, deepDive } = input;
    const { signals, answerMeta } = collectRadarSignals(selectedDimensions, radarResponses, context, deepDive);

    const importance = qualification.importance;
    const consequences = qualification.consequences ?? [];
    const priorityKey = qualification.priorityAnswerKey;

    const meaningfulAnswers = answerMeta.filter((a) => a.signals.length > 0);
    const hasFrictionAnswers = meaningfulAnswers.length > 0;

    const earlyStage =
        context.business_situation === "starting" &&
        selectedDimensions.length <= 3 &&
        (!hasFrictionAnswers || importance === "minimal" || !importance);

    if (!hasFrictionAnswers || importance === "minimal" || consequences.includes("low_impact")) {
        if (earlyStage) {
            return {
                kind: "early_stage",
                opportunities: [],
                signals,
                whatWeNoticed: ["Activité encore simple selon vos réponses."],
                message: getEarlyStageMessage(),
            };
        }
        return {
            kind: "healthy",
            opportunities: [],
            signals,
            whatWeNoticed: ["Peu de friction importante dans les dimensions explorées."],
            message: getHealthyMessage(),
        };
    }

    if (importance === "unknown" && consequences.includes("unknown")) {
        return {
            kind: "healthy",
            opportunities: [],
            signals,
            whatWeNoticed: ["Les réponses ne permettent pas encore de prioriser une friction claire."],
            message: getHealthyMessage(),
        };
    }

    const importanceValue = importance && importance !== "unknown" ? IMPORTANCE_SCORE[importance] : 1;
    const cScore = consequenceScore(consequences.filter((c) => c !== "unknown"));
    if (importanceValue <= 0 && cScore <= 0) {
        return {
            kind: "healthy",
            opportunities: [],
            signals,
            whatWeNoticed: ["Les situations mentionnées semblent peu dérangeantes aujourd’hui."],
            message: getHealthyMessage(),
        };
    }

    // Focus on priority answer when present; otherwise all friction answers
    const focusAnswers = priorityKey
        ? meaningfulAnswers.filter((a) => a.key === priorityKey)
        : meaningfulAnswers;
    const focus = focusAnswers.length ? focusAnswers : meaningfulAnswers;

    const focusSignals = [...new Set(focus.flatMap((a) => a.signals))];
    const candidateOpps = opportunitiesForSignals(focusSignals.length ? focusSignals : signals);

    // Deep-dive opportunity hints
    const deepDiveRule = getDeepDiveRules()[0];
    if (deepDive.manual_transfer) {
        const opt = deepDiveRule.answers.find((a) => a.id === deepDive.manual_transfer);
        for (const hint of opt?.opportunity_hints ?? []) {
            if (!candidateOpps.includes(hint as OpportunityId)) {
                candidateOpps.push(hint as OpportunityId);
            }
        }
    }

    // Never invent opportunities from prohibited standalone signals without importance/consequence
    const prohibitedAlone = new Set([
        "manual_work",
        "software_fragmentation",
        "software_overlap",
    ]);
    const actionableSignals = focusSignals.filter((s) => !prohibitedAlone.has(s) || importanceValue >= 2 || cScore >= 1);

    const convergence = Math.min(2, Math.max(0, actionableSignals.length - 1) * 0.45);
    const baseStrength = importanceValue * 1.4 + cScore + convergence;

    const opportunities = candidateOpps
        .map((id) => {
            const relatedAnswers = focus.filter((a) =>
                a.signals.some((s) => {
                    const rule = getOpportunityRules().find((r) =>
                        (r.allowed_opportunities as string[]).includes(id),
                    );
                    return rule ? (rule.when_signals_include as string[]).includes(s) : false;
                }),
            );
            const relatedSignals = [
                ...new Set(relatedAnswers.flatMap((a) => a.signals).filter((s) => actionableSignals.includes(s) || focusSignals.includes(s))),
            ] as SignalId[];

            if (!relatedSignals.length && !deepDive.manual_transfer) {
                // still allow if opportunity came from deep-dive hints
                const fromDeepDive = deepDiveRule.answers
                    .find((a) => a.id === deepDive.manual_transfer)
                    ?.opportunity_hints?.includes(id);
                if (!fromDeepDive) return null;
            }

            const signalBoost = Math.min(1.5, relatedSignals.length * 0.35);
            const score = baseStrength + signalBoost;
            if (score < 2.2) return null;

            const confidence =
                (importance && importance !== "unknown" ? 0.35 : 0.1) +
                (consequences.length && !consequences.includes("unknown") ? 0.35 : 0.1) +
                (relatedSignals.length >= 2 ? 0.2 : 0.1) +
                (deepDive.manual_transfer ? 0.1 : 0);

            const whyParts = [
                relatedAnswers[0]?.label ? `Situation repérée : ${relatedAnswers[0].label}.` : null,
                importance && importance !== "unknown"
                    ? `Importance perçue : ${importance === "high" ? "beaucoup" : importance === "significant" ? "assez" : importance === "some" ? "un peu" : "très peu"}.`
                    : null,
                consequences.filter((c) => c !== "unknown" && c !== "low_impact").length
                    ? `Conséquences : ${consequences
                          .filter((c) => c !== "unknown" && c !== "low_impact")
                          .map((c) => CONSEQUENCE_LABELS_FR[c] ?? c)
                          .join(", ")
                          .toLowerCase()}.`
                    : null,
            ].filter(Boolean) as string[];

            const opportunity: GeneratedOpportunity = {
                id,
                level: levelFromScore(score),
                score,
                confidence: Math.min(1, confidence),
                signals: relatedSignals.length ? relatedSignals : (focusSignals as SignalId[]),
                dimensions: [...new Set(relatedAnswers.map((a) => a.dimension))],
                sourceAnswers: relatedAnswers.map((a) => a.key),
                consequences: consequences.filter((c) => c !== "unknown" && c !== "low_impact") as ConsequenceId[],
                importance,
                why: whyParts.join(" ") || `Opportunité liée à ${OPPORTUNITY_LABELS_FR[id] ?? id}.`,
                potentialGain: gainFromScore(score),
            };
            return opportunity;
        })
        .filter((o): o is GeneratedOpportunity => o != null)
        .sort((a, b) => b.score - a.score || b.confidence - a.confidence)
        .slice(0, 3);

    // Drop watch-only if we have stronger ones; keep watch if that's all we have and score ok
    const filtered =
        opportunities.some((o) => o.level !== "watch")
            ? opportunities.filter((o) => o.level !== "watch" || o.score >= 4)
            : opportunities;

    if (!filtered.length) {
        if (earlyStage) {
            return {
                kind: "early_stage",
                opportunities: [],
                signals,
                whatWeNoticed: focus.map((a) => a.label).slice(0, 3),
                message: getEarlyStageMessage(),
            };
        }
        return {
            kind: "healthy",
            opportunities: [],
            signals,
            whatWeNoticed: focus.map((a) => a.label).slice(0, 3),
            message: getHealthyMessage(),
        };
    }

    return {
        kind: "opportunities",
        opportunities: filtered,
        signals,
        whatWeNoticed: focus.map((a) => a.label).slice(0, 4),
    };
}

export function shouldAskDeepDive(input: {
    selectedDimensions: DimensionId[];
    radarResponses: Partial<Record<DimensionId, RadarResponse>>;
    qualification: QualificationState;
}): boolean {
    if (!input.selectedDimensions.includes("information_tools")) return false;
    const selected = input.radarResponses.information_tools?.selected ?? [];
    if (!selected.includes("manual_transfer")) return false;
    return input.qualification.importance === "significant" || input.qualification.importance === "high";
}

export function summarizeResult(result: DiagnosticV5Result): string {
    if (result.kind === "healthy" || result.kind === "early_stage") {
        return result.message ?? "Aucune friction prioritaire repérée.";
    }
    return result.opportunities
        .map((o) => `${OPPORTUNITY_LABELS_FR[o.id] ?? o.id} (${o.level})`)
        .join(" · ");
}
