"use client";

import { useTranslations } from "next-intl";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { getContextQuestions } from "@/content/diagnostic/v5/catalog";

export function ContextScreen({
    questionId,
    value,
    onChange,
    onContinue,
}: {
    questionId: "context_business_situation" | "context_business_type" | "context_work_model";
    value?: string;
    onChange: (id: string) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const question = getContextQuestions().find((q) => q.id === questionId);
    if (!question) return null;

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader title={question.question.fr ?? ""} />
            <div className="flex flex-col gap-2.5" role="radiogroup" aria-label={question.question.fr ?? ""}>
                {question.answers.map((answer) => (
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
                {t("contextContinue")}
            </CobreoButton>
        </div>
    );
}
