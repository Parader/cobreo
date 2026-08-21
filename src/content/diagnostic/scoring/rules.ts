import { intensityForAnswer } from "../scales";
import type { DiagnosticQuestion, DiagnosticResponses, OpportunityBand, StageId, ZoneResult } from "../types";

function bandFromScore(score: number): OpportunityBand {
    if (score >= 2.75) return "high";
    if (score >= 2.0) return "moderate";
    if (score >= 1.15) return "some";
    return "low";
}

function patternBoost(stage: StageId, responses: DiagnosticResponses, questions: DiagnosticQuestion[]): number {
    const stageQs = questions.filter((q) => q.stage === stage && !q.followUpOf);
    const intensities = stageQs.map((q) => {
        const v = responses[q.id];
        return v ? intensityForAnswer(q.answerType, v) : 0;
    });
    const highCount = intensities.filter((i) => i >= 3).length;
    if (highCount >= 3) return 0.35;
    if (highCount >= 2) return 0.2;
    return 0;
}

export function scoreDiagnostic(
    responses: DiagnosticResponses,
    questions: DiagnosticQuestion[],
    selectedStages?: StageId[],
) {
    const stages = selectedStages?.length
        ? selectedStages
        : ([...new Set(questions.map((q) => q.stage))] as StageId[]);

    const zones: ZoneResult[] = stages.map((stage) => {
        const stageQs = questions.filter((q) => q.stage === stage);
        let weightSum = 0;
        let scored = 0;

        for (const q of stageQs) {
            const value = responses[q.id];
            if (!value) continue;
            if (q.followUpOf && responses[q.followUpOf] === undefined) continue;
            const intensity = intensityForAnswer(q.answerType, value);
            scored += intensity * q.weight;
            weightSum += q.weight;
        }

        const base = weightSum > 0 ? scored / weightSum : 0;
        const score = Math.min(4, base + patternBoost(stage, responses, questions));
        return { stage, score, band: bandFromScore(score) };
    });

    const ranked = [...zones].sort((a, b) => b.score - a.score);
    const highlighted = ranked
        .filter((z) => z.band === "high" || z.band === "moderate" || z.band === "some")
        .slice(0, 3)
        .map((z) => z.stage);

    if (highlighted.length === 0 && ranked[0]) {
        highlighted.push(ranked[0].stage);
    }

    return { zones, highlighted };
}

export function buildSummaryLine(result: { zones: ZoneResult[]; highlighted: StageId[] }, locale: string): string {
    const labels: Record<StageId, { fr: string; en: string }> = {
        acquisition: { fr: "Acquisition", en: "Acquisition" },
        conversion: { fr: "Conversion", en: "Conversion" },
        delivery: { fr: "Production / livraison", en: "Delivery" },
        coordination: { fr: "Coordination", en: "Coordination" },
        admin: { fr: "Administration", en: "Administration" },
        tools: { fr: "Outils", en: "Tools" },
        team: { fr: "Équipe", en: "Team" },
    };
    const bandLabel = (b: ZoneResult["band"]) => {
        const map = {
            high: { fr: "forte friction", en: "high friction" },
            moderate: { fr: "friction notable", en: "notable friction" },
            some: { fr: "friction légère", en: "light friction" },
            low: { fr: "peu de friction", en: "little friction" },
        };
        return map[b][locale.startsWith("en") ? "en" : "fr"];
    };

    const parts = result.highlighted.map((stage) => {
        const zone = result.zones.find((z) => z.stage === stage);
        const name = labels[stage][locale.startsWith("en") ? "en" : "fr"];
        return `${name}: ${bandLabel(zone?.band ?? "low")}`;
    });

    return parts.join(" · ");
}
