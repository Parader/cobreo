"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { StepContinue } from "@/components/cobreo/diagnostic/v6/step-continue";
import { getPrioritySpec } from "@/content/diagnostic/v6/catalog";
import type { PriorityId } from "@/content/diagnostic/v6/types";
import { pickLocalized } from "@/lib/diagnostic/localize";

const EXCLUSIVE = new Set<PriorityId>(["nothing_specific"]);

export function PriorityScreen({
    value,
    onChange,
    onContinue,
}: {
    value: PriorityId[];
    onChange: (next: PriorityId[]) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const spec = getPrioritySpec();

    function toggle(id: PriorityId) {
        if (EXCLUSIVE.has(id)) {
            onChange(value.includes(id) ? [] : [id]);
            return;
        }
        const withoutExclusive = value.filter((x) => !EXCLUSIVE.has(x));
        if (withoutExclusive.includes(id)) {
            onChange(withoutExclusive.filter((x) => x !== id));
            return;
        }
        onChange([...withoutExclusive, id]);
    }

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader
                title={pickLocalized(spec as Record<string, unknown>, "question", locale)}
                body={t("radarSelectInstruction")}
            />
            <div className="flex flex-col gap-2.5">
                {spec.answers.map((answer) => (
                    <ChoiceButton
                        key={answer.id}
                        multi
                        selected={value.includes(answer.id as PriorityId)}
                        onClick={() => toggle(answer.id as PriorityId)}
                    >
                        {pickLocalized(answer as Record<string, unknown>, "label", locale)}
                    </ChoiceButton>
                ))}
            </div>
            <StepContinue
                canContinue={value.length > 0}
                multi
                onContinue={onContinue}
                label={t("next")}
            />
        </div>
    );
}
