"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { StepContinue } from "@/components/cobreo/diagnostic/v6/step-continue";
import { getContextQuestions } from "@/content/diagnostic/v6/catalog";
import type { WorkModel } from "@/content/diagnostic/v6/types";
import { pickLocalized } from "@/lib/diagnostic/localize";

export function ContextScreenV6({
    questionId,
    value,
    multiValue,
    onChange,
    onMultiChange,
    onContinue,
}: {
    questionId: "context_stage" | "context_business_type" | "context_work_model";
    value?: string;
    multiValue?: string[];
    onChange?: (id: string) => void;
    onMultiChange?: (next: string[]) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const question = getContextQuestions().find((q) => q.id === questionId);
    if (!question) return null;

    const multi = question.kind === "multi_select";
    const selected = multi ? (multiValue ?? []) : value ? [value] : [];
    const instruction = multi
        ? pickLocalized(question as Record<string, unknown>, "instruction", locale) ||
          t("radarSelectInstruction")
        : undefined;

    function toggle(id: string) {
        if (!multi) {
            onChange?.(id);
            return;
        }
        const current = multiValue ?? [];
        if (current.includes(id as WorkModel)) {
            onMultiChange?.(current.filter((x) => x !== id));
            return;
        }
        onMultiChange?.([...current, id]);
    }

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader title={pickLocalized(question as Record<string, unknown>, "question", locale)} body={instruction} />
            <div className="flex flex-col gap-2.5" role={multi ? undefined : "radiogroup"}>
                {question.answers.map((answer) => (
                    <ChoiceButton
                        key={answer.id}
                        multi={multi}
                        selected={selected.includes(answer.id)}
                        onClick={() => toggle(answer.id)}
                    >
                        {pickLocalized(answer as Record<string, unknown>, "label", locale)}
                    </ChoiceButton>
                ))}
            </div>
            <StepContinue
                canContinue={selected.length > 0}
                multi={multi}
                onContinue={onContinue}
                label={t("contextContinue")}
            />
        </div>
    );
}
