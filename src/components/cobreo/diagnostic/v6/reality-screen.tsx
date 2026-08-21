"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { StepContinue } from "@/components/cobreo/diagnostic/v6/step-continue";
import { getOptionalFreeTextSpec, getRealityQuestion } from "@/content/diagnostic/v6/catalog";
import type { RealityAnswerValue, TopicId } from "@/content/diagnostic/v6/types";
import { pickLocalized } from "@/lib/diagnostic/localize";

export function RealityScreen({
    questionId,
    topic,
    value,
    note,
    onChange,
    onNoteChange,
    onContinue,
}: {
    questionId: string;
    topic: TopicId;
    value?: RealityAnswerValue;
    note?: string;
    onChange: (next: RealityAnswerValue) => void;
    onNoteChange?: (text: string) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const freeText = getOptionalFreeTextSpec().dimension_note;
    const [noteOpen, setNoteOpen] = useState(Boolean(note?.trim()));
    const question = getRealityQuestion(questionId);
    if (!question) return null;

    const realityQuestion = question;
    const multi = realityQuestion.kind === "multi_select";
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    const instruction = multi
        ? pickLocalized(realityQuestion as Record<string, unknown>, "instruction", locale) ||
          t("radarSelectInstruction")
        : undefined;

    function toggle(id: string, exclusive?: boolean) {
        if (!multi) {
            onChange(id);
            return;
        }
        if (exclusive || id === "none") {
            onChange([id]);
            return;
        }
        const withoutExclusive = selected.filter((x) => {
            const answer = realityQuestion.answers.find((a) => a.id === x) as
                | { exclusive?: boolean }
                | undefined;
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
            <ScreenHeader
                title={pickLocalized(realityQuestion as Record<string, unknown>, "question", locale)}
                body={instruction}
            />
            <div className="flex flex-col gap-2.5" role={multi ? undefined : "radiogroup"}>
                {realityQuestion.answers.map((answer) => (
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

            {onNoteChange ? (
                <div className="flex flex-col gap-2">
                    {!noteOpen ? (
                        <button
                            type="button"
                            className="self-start text-sm font-semibold text-[#4d6b97] hover:underline"
                            onClick={() => setNoteOpen(true)}
                        >
                            {pickLocalized(freeText as Record<string, unknown>, "trigger", locale)}
                        </button>
                    ) : (
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[#525252]">
                                {pickLocalized(freeText as Record<string, unknown>, "label", locale)}
                            </span>
                            <textarea
                                value={note ?? ""}
                                maxLength={freeText.max_chars}
                                rows={3}
                                onChange={(e) => onNoteChange(e.target.value.slice(0, freeText.max_chars))}
                                className="rounded-xl border border-[#171717]/15 bg-white px-4 py-3 text-base text-[#171717] outline-none focus:border-[#4d6b97]"
                            />
                        </label>
                    )}
                </div>
            ) : null}

            <StepContinue
                canContinue={selected.length > 0}
                multi={multi}
                onContinue={onContinue}
                label={t("next")}
            />
        </div>
    );
}
