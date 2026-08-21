"use client";

import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { StepContinue } from "@/components/cobreo/diagnostic/v6/step-continue";
import { useTranslations } from "next-intl";

export function MultiChoiceScreen({
    title,
    body,
    options,
    selected,
    onChange,
    onContinue,
    max,
    exclusiveIds,
    allowEmpty,
    continueLabel,
}: {
    title: string;
    body?: string;
    options: Array<{ id: string; label: string }>;
    selected: string[];
    onChange: (next: string[]) => void;
    onContinue: () => void;
    max?: number;
    exclusiveIds?: string[];
    allowEmpty?: boolean;
    continueLabel?: string;
}) {
    const t = useTranslations("diagnostic");
    const exclusive = new Set(exclusiveIds || []);

    function toggle(id: string) {
        if (exclusive.has(id)) {
            onChange(selected.includes(id) ? [] : [id]);
            return;
        }
        const withoutExclusive = selected.filter((x) => !exclusive.has(x));
        if (withoutExclusive.includes(id)) {
            onChange(withoutExclusive.filter((x) => x !== id));
            return;
        }
        if (max && withoutExclusive.length >= max) {
            onChange([...withoutExclusive.slice(1), id]);
            return;
        }
        onChange([...withoutExclusive, id]);
    }

    const canContinue = allowEmpty ? true : selected.length > 0;

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader title={title} body={body} />
            <div className="flex flex-col gap-2.5">
                {options.map((option) => (
                    <ChoiceButton
                        key={option.id}
                        multi
                        selected={selected.includes(option.id)}
                        onClick={() => toggle(option.id)}
                    >
                        {option.label}
                    </ChoiceButton>
                ))}
            </div>
            <StepContinue
                canContinue={canContinue}
                multi
                onContinue={onContinue}
                label={continueLabel || t("contextContinue")}
            />
        </div>
    );
}

export function SingleChoiceScreen({
    title,
    body,
    options,
    selected,
    onChange,
    onContinue,
    continueLabel,
    autoAdvance,
}: {
    title: string;
    body?: string;
    options: Array<{ id: string; label: string }>;
    selected?: string;
    onChange: (id: string) => void;
    onContinue: () => void;
    continueLabel?: string;
    /** When true, selecting advances immediately */
    autoAdvance?: boolean;
}) {
    const t = useTranslations("diagnostic");

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader title={title} body={body} />
            <div className="flex flex-col gap-2.5" role="radiogroup">
                {options.map((option) => (
                    <ChoiceButton
                        key={option.id}
                        selected={selected === option.id}
                        onClick={() => {
                            onChange(option.id);
                            if (autoAdvance) onContinue();
                        }}
                    >
                        {option.label}
                    </ChoiceButton>
                ))}
            </div>
            {!autoAdvance ? (
                <StepContinue
                    canContinue={Boolean(selected)}
                    onContinue={onContinue}
                    label={continueLabel || t("contextContinue")}
                />
            ) : null}
        </div>
    );
}
