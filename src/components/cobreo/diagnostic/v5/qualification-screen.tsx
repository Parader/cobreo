"use client";

import { useTranslations } from "next-intl";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { getQualificationSpec, getRadarForDimension } from "@/content/diagnostic/v5/catalog";
import type {
    ConsequenceId,
    DiagnosticContext,
    DimensionId,
    ImportanceId,
    QualificationState,
    RadarResponse,
} from "@/content/diagnostic/v5/types";

function frictionOptions(
    selectedDimensions: DimensionId[],
    radarResponses: Partial<Record<DimensionId, RadarResponse>>,
    context: DiagnosticContext,
) {
    const options: Array<{ key: string; label: string }> = [];
    for (const dimension of selectedDimensions) {
        const selected = radarResponses[dimension]?.selected ?? [];
        if (!selected.length || selected.includes("none")) continue;
        const radar = getRadarForDimension(dimension, context.business_situation);
        if (!radar) continue;
        for (const answerId of selected) {
            if (answerId === "other" || answerId === "none") continue;
            const answer = radar.answers.find((a) => a.id === answerId);
            if (!answer) continue;
            options.push({ key: `${dimension}:${answerId}`, label: answer.label_fr });
        }
    }
    return options;
}

export function QualifyPriorityScreen({
    selectedDimensions,
    radarResponses,
    context,
    value,
    onChange,
    onContinue,
}: {
    selectedDimensions: DimensionId[];
    radarResponses: Partial<Record<DimensionId, RadarResponse>>;
    context: DiagnosticContext;
    value?: string;
    onChange: (key: string) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const spec = getQualificationSpec().priority;
    const options = frictionOptions(selectedDimensions, radarResponses, context);

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader eyebrow={t("toolEyebrow")} title={spec.question.fr ?? ""} />
            <div className="flex flex-col gap-2.5" role="radiogroup">
                {options.map((option) => (
                    <ChoiceButton
                        key={option.key}
                        selected={value === option.key}
                        onClick={() => onChange(option.key)}
                    >
                        {option.label}
                    </ChoiceButton>
                ))}
            </div>
            <CobreoButton size="xl" disabled={!value} onClick={onContinue}>
                {t("qualifyContinue")}
            </CobreoButton>
        </div>
    );
}

export function QualifyImportanceScreen({
    value,
    onChange,
    onContinue,
}: {
    value?: ImportanceId;
    onChange: (id: ImportanceId) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const spec = getQualificationSpec().importance;

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader eyebrow={t("toolEyebrow")} title={spec.question.fr ?? ""} />
            <div className="flex flex-col gap-2.5" role="radiogroup">
                {spec.answers.map((answer) => (
                    <ChoiceButton
                        key={answer.id}
                        selected={value === answer.id}
                        onClick={() => onChange(answer.id as ImportanceId)}
                    >
                        {answer.label_fr}
                    </ChoiceButton>
                ))}
            </div>
            <CobreoButton size="xl" disabled={!value} onClick={onContinue}>
                {t("qualifyContinue")}
            </CobreoButton>
        </div>
    );
}

export function QualifyConsequenceScreen({
    value,
    onChange,
    onContinue,
}: {
    value: ConsequenceId[];
    onChange: (next: ConsequenceId[]) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const spec = getQualificationSpec().consequence;
    const max = spec.max_selections ?? 2;

    function toggle(id: ConsequenceId, exclusive?: boolean) {
        if (exclusive) {
            onChange([id]);
            return;
        }
        const withoutExclusive = value.filter((x) => x !== "low_impact" && x !== "unknown") as ConsequenceId[];
        if (withoutExclusive.includes(id)) {
            onChange(withoutExclusive.filter((x) => x !== id));
            return;
        }
        if (withoutExclusive.length >= max) return;
        onChange([...withoutExclusive, id]);
    }

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader
                eyebrow={t("toolEyebrow")}
                title={spec.question.fr ?? ""}
                body={spec.instruction_fr}
            />
            <div className="flex flex-col gap-2.5">
                {spec.answers.map((answer) => (
                    <ChoiceButton
                        key={answer.id}
                        multi
                        selected={value.includes(answer.id as ConsequenceId)}
                        onClick={() => toggle(answer.id as ConsequenceId, Boolean(answer.exclusive))}
                    >
                        {answer.label_fr}
                    </ChoiceButton>
                ))}
            </div>
            <CobreoButton size="xl" disabled={!value.length} onClick={onContinue}>
                {t("qualifyContinue")}
            </CobreoButton>
        </div>
    );
}

export type { QualificationState };
