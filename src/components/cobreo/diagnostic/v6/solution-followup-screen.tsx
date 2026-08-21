"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { StepContinue } from "@/components/cobreo/diagnostic/v6/step-continue";
import { getWebsiteFitFollowup, websiteFollowupLabel, WEBSITE_FOLLOWUP_LABELS_FR } from "@/content/diagnostic/v6/catalog";
import { pickLocalized } from "@/lib/diagnostic/localize";

const ANSWER_IDS = Object.keys(WEBSITE_FOLLOWUP_LABELS_FR);

export function SolutionFollowupScreen({
    value,
    onChange,
    onContinue,
}: {
    value?: string[];
    onChange: (next: string[]) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const followup = getWebsiteFitFollowup();
    if (!followup) return null;

    const selected = value ?? [];
    const max = followup.selection?.max ?? 2;

    function toggle(id: string) {
        if (selected.includes(id)) {
            onChange(selected.filter((x) => x !== id));
            return;
        }
        if (typeof max === "number" && selected.length >= max) return;
        onChange([...selected, id]);
    }

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader
                title={pickLocalized(followup as Record<string, unknown>, "question", locale)}
                body={pickLocalized(followup as Record<string, unknown>, "instruction", locale)}
            />
            <div className="flex flex-col gap-2.5">
                {ANSWER_IDS.map((id) => (
                    <ChoiceButton
                        key={id}
                        multi
                        selected={selected.includes(id)}
                        onClick={() => toggle(id)}
                    >
                        {websiteFollowupLabel(id, locale)}
                    </ChoiceButton>
                ))}
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
