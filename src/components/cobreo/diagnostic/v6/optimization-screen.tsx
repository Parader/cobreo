"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { StepContinue } from "@/components/cobreo/diagnostic/v6/step-continue";
import {
    getOptimizationProbe,
    getPriorityOptimizationPrompt,
    optimizationAreaId,
    optimizationAreaLabel,
} from "@/content/diagnostic/v6/catalog";
import type { PriorityId } from "@/content/diagnostic/v6/types";
import { pickLocalized } from "@/lib/diagnostic/localize";

export function OptimizationProbeScreen({
    value,
    onChange,
    onContinue,
}: {
    value?: string;
    onChange: (id: string) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const probe = getOptimizationProbe();
    if (!probe) return null;

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader
                title={pickLocalized(probe as Record<string, unknown>, "generic_question", locale)}
            />
            <div className="flex flex-col gap-2.5" role="radiogroup">
                {probe.answers.map((answer) => (
                    <ChoiceButton
                        key={answer.id}
                        selected={value === answer.id}
                        onClick={() => onChange(answer.id)}
                    >
                        {pickLocalized(answer as Record<string, unknown>, "label", locale)}
                    </ChoiceButton>
                ))}
            </div>
            <StepContinue canContinue={Boolean(value)} onContinue={onContinue} label={t("next")} />
        </div>
    );
}

export function OptimizationAreasScreen({
    priority,
    value,
    onChange,
    onContinue,
}: {
    priority: PriorityId;
    value?: string[];
    onChange: (next: string[]) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const prompt = getPriorityOptimizationPrompt(priority);
    if (!prompt) return null;

    const selected = value ?? [];
    const max = prompt.selection?.max ?? 2;
    const noneId = "nothing_particular";

    function toggle(id: string) {
        if (id === noneId) {
            onChange(selected.includes(noneId) ? [] : [noneId]);
            return;
        }
        const withoutNone = selected.filter((x) => x !== noneId);
        if (withoutNone.includes(id)) {
            onChange(withoutNone.filter((x) => x !== id));
            return;
        }
        if (typeof max === "number" && withoutNone.length >= max) return;
        onChange([...withoutNone, id]);
    }

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader
                title={pickLocalized(prompt as Record<string, unknown>, "question", locale)}
                body={pickLocalized(prompt as Record<string, unknown>, "instruction", locale)}
            />
            <div className="flex flex-col gap-2.5">
                {prompt.answers.map((label) => {
                    const id = optimizationAreaId(label);
                    return (
                        <ChoiceButton
                            key={id}
                            multi
                            selected={selected.includes(id)}
                            onClick={() => toggle(id)}
                        >
                            {optimizationAreaLabel(id, priority)}
                        </ChoiceButton>
                    );
                })}
            </div>
            <StepContinue
                canContinue
                multi
                onContinue={() => {
                    if (value === undefined) onChange([]);
                    onContinue();
                }}
                label={t("next")}
            />
        </div>
    );
}
