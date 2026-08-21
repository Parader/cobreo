"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { StepContinue } from "@/components/cobreo/diagnostic/v6/step-continue";
import {
    getMeasurementActivityLabels,
    getMeasurementAnswers,
    getScanQuestion,
    renderMeasurementQuestion,
} from "@/content/diagnostic/v6/catalog";
import type { RealityAnswerValue } from "@/content/diagnostic/v6/types";
import { pickLocalized } from "@/lib/diagnostic/localize";

export function ScanScreen({
    questionId,
    value,
    intro,
    onChange,
    onContinue,
}: {
    questionId: string;
    value?: RealityAnswerValue;
    intro?: string;
    onChange: (next: RealityAnswerValue) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const question = getScanQuestion(questionId);
    if (!question) return null;

    const scanQuestion = question;
    const multi = scanQuestion.kind === "multi_select";
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    const instruction = multi
        ? pickLocalized(scanQuestion as Record<string, unknown>, "instruction", locale) ||
          t("radarSelectInstruction")
        : undefined;

    function toggle(id: string, exclusive?: boolean) {
        if (!multi) {
            onChange(id);
            return;
        }
        const answers = scanQuestion.answers as Array<{ id: string; exclusive?: boolean }>;
        if (exclusive || id === "none") {
            onChange([id]);
            return;
        }
        const withoutExclusive = selected.filter((x) => {
            const answer = answers.find((a) => a.id === x);
            return x !== "none" && !answer?.exclusive;
        });
        if (withoutExclusive.includes(id)) {
            onChange(withoutExclusive.filter((x) => x !== id));
            return;
        }
        onChange([...withoutExclusive, id]);
    }

    return (
        <div className="flex flex-col gap-8">
            {intro ? (
                <p className="rounded-xl border border-[#4d6b97]/20 bg-[#4d6b97]/8 px-4 py-3 text-sm leading-relaxed text-[#404040]">
                    {intro}
                </p>
            ) : null}
            <ScreenHeader
                title={pickLocalized(scanQuestion as Record<string, unknown>, "question", locale)}
                body={instruction}
            />
            <div className="flex flex-col gap-2.5" role={multi ? undefined : "radiogroup"}>
                {scanQuestion.answers.map((answer) => (
                    <ChoiceButton
                        key={answer.id}
                        multi={multi}
                        selected={selected.includes(answer.id)}
                        onClick={() =>
                            toggle(answer.id, Boolean((answer as { exclusive?: boolean }).exclusive))
                        }
                    >
                        {pickLocalized(answer as Record<string, unknown>, "label", locale)}
                    </ChoiceButton>
                ))}
            </div>
            <StepContinue
                canContinue={selected.length > 0}
                multi={multi}
                onContinue={onContinue}
                label={t("next")}
            />
        </div>
    );
}

export function MeasureScreen({
    scale,
    targetId,
    manualTypes,
    value,
    onChange,
    onContinue,
}: {
    scale: "frequency" | "effort" | "desire";
    targetId: string;
    manualTypes?: string[];
    value?: string;
    onChange: (id: string) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const answers = getMeasurementAnswers(scale, locale);
    const labels = getMeasurementActivityLabels(targetId, { manualTypes });
    const title = renderMeasurementQuestion(scale, labels, locale);

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader title={title} />
            <div className="flex flex-col gap-2.5" role="radiogroup">
                {answers.map(([id, label]) => (
                    <ChoiceButton key={id} selected={value === id} onClick={() => onChange(id)}>
                        {label}
                    </ChoiceButton>
                ))}
            </div>
            <StepContinue
                canContinue={Boolean(value)}
                onContinue={onContinue}
                label={t("qualifyContinue")}
            />
        </div>
    );
}
