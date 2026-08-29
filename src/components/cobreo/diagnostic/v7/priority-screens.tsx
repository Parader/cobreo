"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { MultiChoiceScreen } from "@/components/cobreo/diagnostic/v7/choice-screens";
import { StepContinue } from "@/components/cobreo/diagnostic/v6/step-continue";
import {
    getAutomationScan,
    getPrioritizationSpec,
    selectionInstruction,
} from "@/content/diagnostic/v7/catalog";
import type { AutomationInterest, TopicCandidate, TopicId } from "@/content/diagnostic/v7/types";
import { pickLocalized } from "@/lib/diagnostic/localize";
import { cx } from "@/utils/cx";

export function SimplificationScreen({
    value,
    onChange,
    onContinue,
}: {
    value: AutomationInterest;
    onChange: (next: AutomationInterest) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const spec = getAutomationScan() as {
        question_fr: string;
        instruction_fr?: string;
        answers: Array<{ id: string; label_fr: string; exclusive?: boolean }>;
    };

    return (
        <MultiChoiceScreen
            title={pickLocalized(spec as Record<string, unknown>, "question", locale) || spec.question_fr}
            body={
                pickLocalized(spec as Record<string, unknown>, "instruction", locale) ||
                selectionInstruction("unlimited", locale)
            }
            options={spec.answers.map((a) => ({
                id: a.id,
                label: pickLocalized(a as Record<string, unknown>, "label", locale) || a.label_fr,
            }))}
            selected={value.tasks || []}
            exclusiveIds={spec.answers.filter((a) => a.exclusive).map((a) => a.id)}
            onChange={(tasks) => onChange({ tasks })}
            onContinue={onContinue}
            continueLabel={t("contextContinue")}
        />
    );
}

/** Choose any number of broad topics (label + summary only). */
export function ChooseTopicsScreen({
    candidates,
    value,
    onChange,
    onContinue,
}: {
    candidates: TopicCandidate[];
    value: Array<TopicId | "none_selected">;
    onChange: (next: Array<TopicId | "none_selected">) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const spec = getPrioritizationSpec();
    const screen = spec.screen as {
        title_fr: string;
        intro_fr: string;
        instruction_fr: string;
        selection: { min?: number; max?: number | null };
        none_option?: { id: string; label_fr: string; exclusive?: boolean };
    };

    const noneOption = screen.none_option || {
        id: "none_selected",
        label_fr: "Aucun de ces sujets n’est une priorité pour moi en ce moment",
        exclusive: true,
    };
    const noneId = (noneOption.id || "none_selected") as "none_selected";
    // Spec 8.3 removes the cap: suppressing a genuine priority loses intent signal.
    const max = screen.selection?.max ?? null;

    function toggle(id: TopicId | "none_selected") {
        if (id === noneId) {
            onChange(value.includes(noneId) ? [] : [noneId]);
            return;
        }
        const withoutNone = value.filter((x) => x !== noneId) as TopicId[];
        if (withoutNone.includes(id as TopicId)) {
            onChange(withoutNone.filter((x) => x !== id));
            return;
        }
        if (max && withoutNone.length >= max) {
            onChange([...withoutNone.slice(1), id as TopicId]);
            return;
        }
        onChange([...withoutNone, id as TopicId]);
    }

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader
                title={pickLocalized(screen as Record<string, unknown>, "title", locale) || screen.title_fr}
                body={
                    (pickLocalized(screen as Record<string, unknown>, "intro", locale) || screen.intro_fr) +
                    " " +
                    (pickLocalized(screen as Record<string, unknown>, "instruction", locale) ||
                        screen.instruction_fr)
                }
            />
            <div className="flex flex-col gap-3">
                {candidates.map((card) => {
                    const selected = value.includes(card.id);
                    return (
                        <button
                            key={card.id}
                            type="button"
                            role="checkbox"
                            aria-checked={selected}
                            onClick={() => toggle(card.id)}
                            className={cx(
                                "w-full rounded-2xl border px-4 py-4 text-left transition duration-100 ease-linear",
                                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                                selected
                                    ? "border-[#4d6b97] bg-[#4d6b97]/10"
                                    : "border-[#171717]/12 bg-white/70 hover:border-[#171717]/25",
                            )}
                        >
                            <p className="font-display text-xl leading-snug text-[#171717]">{card.label}</p>
                            <p className="mt-1.5 text-sm leading-relaxed text-[#525252]">{card.summary}</p>
                        </button>
                    );
                })}
                <ChoiceButton multi selected={value.includes(noneId)} onClick={() => toggle(noneId)}>
                    {pickLocalized(noneOption as Record<string, unknown>, "label", locale) ||
                        noneOption.label_fr}
                </ChoiceButton>
            </div>
            <StepContinue
                canContinue={value.length > 0}
                multi
                onContinue={onContinue}
                label={t("contextContinue")}
            />
        </div>
    );
}
