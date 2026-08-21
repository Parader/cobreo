"use client";

import { useTranslations } from "next-intl";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { getDeepDiveRules } from "@/content/diagnostic/v5/catalog";

export function DeepDiveScreen({
    value,
    onChange,
    onContinue,
}: {
    value?: string;
    onChange: (id: string) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const rule = getDeepDiveRules()[0];

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader eyebrow={t("toolEyebrow")} title={rule.question.fr ?? ""} />
            <div className="flex flex-col gap-2.5" role="radiogroup">
                {rule.answers.map((answer) => (
                    <ChoiceButton
                        key={answer.id}
                        selected={value === answer.id}
                        onClick={() => onChange(answer.id)}
                    >
                        {answer.label_fr}
                    </ChoiceButton>
                ))}
            </div>
            <CobreoButton size="xl" disabled={!value} onClick={onContinue}>
                {t("deepDiveContinue")}
            </CobreoButton>
        </div>
    );
}
