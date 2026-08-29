"use client";

import { useLocale, useTranslations } from "next-intl";
import { MultiChoiceScreen, SingleChoiceScreen } from "@/components/cobreo/diagnostic/v7/choice-screens";
import {
    getCompanyQuestion,
    getDeclaredAmbitionSpec,
    selectionInstruction,
} from "@/content/diagnostic/v7/catalog";
import type { AmbitionId, CompanyContext } from "@/content/diagnostic/v7/types";
import { pickLocalized } from "@/lib/diagnostic/localize";

export function CompanyScreen({
    questionId,
    context,
    onChange,
    onContinue,
}: {
    questionId: string;
    context: CompanyContext;
    onChange: (patch: Partial<CompanyContext>) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const question = getCompanyQuestion(questionId);
    if (!question) return null;

    const multi = question.kind === "multi_select";
    const options = question.answers.map((a) => ({
        id: a.id,
        label: pickLocalized(a as Record<string, unknown>, "label", locale) || a.label_fr,
    }));

    if (multi) {
        const key = questionId === "customer_types" ? "customer_types" : "work_models";
        const value = (context[key] as string[] | undefined) ?? [];
        const exclusiveIds = question.answers
            .filter((a) => "exclusive" in a && Boolean((a as { exclusive?: boolean }).exclusive))
            .map((a) => a.id);
        return (
            <MultiChoiceScreen
                title={pickLocalized(question as Record<string, unknown>, "question", locale) || question.question_fr}
                body={
                    pickLocalized(question as Record<string, unknown>, "instruction", locale) ||
                    selectionInstruction("unlimited", locale)
                }
                options={options}
                selected={value}
                exclusiveIds={exclusiveIds.length > 0 ? exclusiveIds : undefined}
                onChange={(next) => onChange({ [key]: next })}
                onContinue={onContinue}
                continueLabel={t("contextContinue")}
            />
        );
    }

    const value =
        questionId === "company_stage"
            ? context.company_stage
            : questionId === "company_size"
              ? context.company_size
              : undefined;

    return (
        <SingleChoiceScreen
            title={pickLocalized(question as Record<string, unknown>, "question", locale) || question.question_fr}
            options={options}
            selected={value}
            onChange={(id) => {
                if (questionId === "company_stage") onChange({ company_stage: id });
                else if (questionId === "company_size") onChange({ company_size: id });
            }}
            onContinue={onContinue}
            continueLabel={t("contextContinue")}
        />
    );
}

function ambitionVisible(answer: { id: string; show_if?: string }, companySize?: string): boolean {
    if (!answer.show_if) return true;
    if (answer.show_if.includes("company_size != '1'")) {
        return companySize !== "1";
    }
    return true;
}

export function DeclaredAmbitionsScreen({
    value,
    companySize,
    onChange,
    onContinue,
}: {
    value: AmbitionId[];
    companySize?: string;
    onChange: (ids: AmbitionId[]) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const spec = getDeclaredAmbitionSpec();
    const options = spec.answers
        .filter((a) => ambitionVisible(a as { id: string; show_if?: string }, companySize))
        .map((a) => ({
            id: a.id,
            label: pickLocalized(a as Record<string, unknown>, "label", locale) || a.label_fr,
        }));
    const exclusiveIds = spec.answers.filter((a) => "exclusive" in a && a.exclusive).map((a) => a.id);

    return (
        <MultiChoiceScreen
            title={pickLocalized(spec as Record<string, unknown>, "question", locale) || spec.question_fr}
            body={
                pickLocalized(spec as Record<string, unknown>, "instruction", locale) ||
                selectionInstruction("unlimited", locale)
            }
            options={options}
            selected={value}
            exclusiveIds={exclusiveIds}
            onChange={(next) => onChange(next as AmbitionId[])}
            onContinue={onContinue}
            continueLabel={t("contextContinue")}
        />
    );
}
