"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import {
    getOptionalFreeTextSpec,
    getRadarForDimension,
    getRadarQuestionText,
} from "@/content/diagnostic/v5/catalog";
import type { DiagnosticContext, DimensionId, RadarResponse } from "@/content/diagnostic/v5/types";

const OTHER_MAX = 120;

export function RadarScreen({
    dimension,
    context,
    value,
    note,
    onChange,
    onNoteChange,
    onContinue,
}: {
    dimension: DimensionId;
    context: DiagnosticContext;
    value?: RadarResponse;
    note?: string;
    onChange: (next: RadarResponse) => void;
    onNoteChange?: (text: string) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const freeText = getOptionalFreeTextSpec().dimension_note;
    const [noteOpen, setNoteOpen] = useState(Boolean(note?.trim()));
    const radar = getRadarForDimension(dimension, context.business_situation);
    if (!radar) return null;

    const selected = value?.selected ?? [];
    const otherText = value?.otherText ?? "";
    const instruction =
        (radar.selection as { instruction_fr?: string } | undefined)?.instruction_fr ||
        t("radarSelectInstruction");

    function toggle(id: string) {
        if (id === "none") {
            onChange({ selected: ["none"], otherText: undefined });
            return;
        }
        const withoutNone = selected.filter((x) => x !== "none");
        if (withoutNone.includes(id)) {
            const next = withoutNone.filter((x) => x !== id);
            onChange({
                selected: next,
                otherText: id === "other" ? undefined : otherText || undefined,
            });
            return;
        }
        onChange({
            selected: [...withoutNone, id],
            otherText: id === "other" ? otherText : otherText || undefined,
        });
    }

    const canContinue = selected.length > 0;

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader title={getRadarQuestionText(radar, context.work_model)} body={instruction} />
            <div className="flex flex-col gap-2.5">
                {radar.answers.map((answer) => (
                    <ChoiceButton
                        key={answer.id}
                        multi
                        selected={selected.includes(answer.id)}
                        onClick={() => toggle(answer.id)}
                    >
                        {answer.label_fr}
                    </ChoiceButton>
                ))}
            </div>
            {selected.includes("other") ? (
                <label className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-[#525252]">{t("radarOtherPlaceholder")}</span>
                    <input
                        value={otherText}
                        maxLength={OTHER_MAX}
                        onChange={(e) =>
                            onChange({
                                selected,
                                otherText: e.target.value.slice(0, OTHER_MAX),
                            })
                        }
                        className="rounded-xl border border-[#171717]/15 bg-white px-4 py-3 text-base text-[#171717] outline-none focus:border-[#4d6b97]"
                    />
                </label>
            ) : null}

            {onNoteChange ? (
                <div className="flex flex-col gap-2">
                    {!noteOpen ? (
                        <button
                            type="button"
                            className="self-start text-sm font-semibold text-[#4d6b97] hover:underline"
                            onClick={() => setNoteOpen(true)}
                        >
                            {freeText.trigger_fr}
                        </button>
                    ) : (
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[#525252]">{freeText.label_fr}</span>
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

            {!canContinue ? <p className="text-sm text-[#737373]">{t("radarNeedAnswer")}</p> : null}
            <CobreoButton size="xl" disabled={!canContinue} onClick={onContinue}>
                {t("next")}
            </CobreoButton>
        </div>
    );
}
