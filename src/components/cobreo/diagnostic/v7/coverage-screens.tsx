"use client";

import { useLocale, useTranslations } from "next-intl";
import { MultiChoiceScreen, SingleChoiceScreen } from "@/components/cobreo/diagnostic/v7/choice-screens";
import {
    areaLabel,
    getAreaApplicabilitySpec,
    getAreaScan,
    getConfirmationPatterns,
    getFreeTextSpec,
    getScanAnswers,
    getToolsFitSpec,
    selectionInstruction,
} from "@/content/diagnostic/v7/catalog";
import type {
    AmbitionId,
    AreaAnswerValue,
    AreaId,
    ConfirmationAnswers,
    FitCheckState,
} from "@/content/diagnostic/v7/types";
import { hardApplicableAreas, isSoloCompany } from "@/lib/diagnostic/v7/coverage";
import { expandAnswersToAreas } from "@/lib/diagnostic/v7/topics";
import type { CompanyContext } from "@/content/diagnostic/v7/types";
import { pickLocalized } from "@/lib/diagnostic/localize";
import { ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { StepContinue } from "@/components/cobreo/diagnostic/v6/step-continue";
import { useState } from "react";

export function ApplicableAreasScreen({
    companyContext,
    value: _value,
    onChange,
    onContinue,
}: {
    companyContext: CompanyContext;
    value: AreaId[];
    onChange: (areas: AreaId[]) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const spec = getAreaApplicabilitySpec() as {
        question_fr: string;
        instruction_fr?: string;
        answers: Array<{ id: string; label_fr: string; exclusive?: boolean; show_if?: string }>;
    };
    const hard = hardApplicableAreas(companyContext);
    const answers = (spec.answers || []).filter((a) => {
        if (a.show_if === "company_size != '1'" && isSoloCompany(companyContext.company_size)) return false;
        return true;
    });
    const [selected, setSelected] = useState<string[]>([]);

    function handleChange(next: string[]) {
        setSelected(next);
        if (next.includes("nothing_else") || next.length === 0) {
            onChange([]);
            return;
        }
        onChange(expandAnswersToAreas(next).filter((a) => hard.includes(a)));
    }

    return (
        <MultiChoiceScreen
            title={pickLocalized(spec as Record<string, unknown>, "question", locale) || spec.question_fr}
            body={
                pickLocalized(spec as Record<string, unknown>, "instruction", locale) ||
                selectionInstruction("unlimited", locale)
            }
            options={answers.map((a) => ({
                id: a.id,
                label: pickLocalized(a as Record<string, unknown>, "label", locale) || a.label_fr,
            }))}
            selected={selected}
            exclusiveIds={answers.filter((a) => a.exclusive).map((a) => a.id)}
            onChange={handleChange}
            onContinue={onContinue}
            continueLabel={t("contextContinue")}
        />
    );
}

export function AreaScanScreen({
    areaId,
    value,
    onChange,
    onContinue,
    companyContext,
    declaredAmbitions,
}: {
    areaId: AreaId;
    value: AreaAnswerValue;
    onChange: (next: AreaAnswerValue) => void;
    onContinue: () => void;
    companyContext?: CompanyContext;
    declaredAmbitions?: AmbitionId[];
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const answers = getScanAnswers(areaId, {
        companyStage: companyContext?.company_stage,
        companySize: companyContext?.company_size,
        declaredAmbitions,
    });
    const areaScan = getAreaScan(areaId) as Record<string, unknown> | undefined;
    const title =
        pickLocalized(areaScan || {}, "question", locale) ||
        String(areaScan?.question_fr || areaLabel(areaId, locale));
    const body =
        pickLocalized(areaScan || {}, "instruction", locale) || selectionInstruction("unlimited", locale);

    const exclusiveIds = answers.filter((a) => a.exclusive).map((a) => a.id);
    // Also treat common “none” patterns as exclusive even if flag missing
    for (const a of answers) {
        if (
            /^(no_|too_early|not_|informal_|none_)/.test(a.id) ||
            a.id === "no_overview" ||
            a.id === "no_tools" ||
            a.id === "no_formal_sales"
        ) {
            if (!exclusiveIds.includes(a.id)) exclusiveIds.push(a.id);
        }
    }

    return (
        <MultiChoiceScreen
            title={title}
            body={body}
            options={answers.map((a) => ({
                id: a.id,
                label: pickLocalized(a as Record<string, unknown>, "label", locale) || a.label_fr,
            }))}
            selected={value}
            exclusiveIds={exclusiveIds}
            onChange={onChange}
            onContinue={onContinue}
            continueLabel={t("contextContinue")}
        />
    );
}

export function ConfirmationScreen({
    confirmationId,
    options,
    value,
    onChange,
    onContinue,
}: {
    confirmationId: string;
    options: Array<{ id: string; label: string }>;
    value?: string | string[];
    onChange: (next: string | string[]) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const pattern = getConfirmationPatterns().find((p) => p.id === confirmationId) as
        | Record<string, unknown>
        | undefined;
    if (!pattern) return null;

    const title = pickLocalized(pattern, "question", locale) || String(pattern.question_fr);
    const multi = pattern.kind === "multi_select";

    if (multi) {
        const selected = Array.isArray(value) ? value : value ? [value] : [];
        const include = pattern.include as { id: string; label_fr: string; exclusive?: boolean } | undefined;
        const opts = [
            ...options,
            ...(include
                ? [
                      {
                          id: include.id,
                          label: pickLocalized(include as Record<string, unknown>, "label", locale) || include.label_fr,
                      },
                  ]
                : []),
        ];
        return (
            <MultiChoiceScreen
                title={title}
                body={
                    pickLocalized(pattern, "instruction", locale) || selectionInstruction("max_2", locale)
                }
                options={opts}
                selected={selected}
                max={2}
                exclusiveIds={include ? [include.id] : ["none"]}
                onChange={onChange}
                onContinue={onContinue}
                continueLabel={t("contextContinue")}
            />
        );
    }

    const answers = (pattern.answers as Array<{ id: string; label_fr: string }>) || [];
    return (
        <SingleChoiceScreen
            title={title}
            options={answers.map((a) => ({
                id: a.id,
                label: pickLocalized(a as Record<string, unknown>, "label", locale) || a.label_fr,
            }))}
            selected={typeof value === "string" ? value : undefined}
            onChange={onChange}
            onContinue={onContinue}
            continueLabel={t("contextContinue")}
        />
    );
}

export function ToolsFitScreen({
    value,
    onChange,
    onContinue,
}: {
    value?: FitCheckState;
    onChange: (next: FitCheckState) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const spec = getToolsFitSpec();
    if (!spec) return null;
    const title = (spec.question_template_fr || "").replace("{activity_label}", locale === "en" ? "your work" : "votre travail");

    return (
        <SingleChoiceScreen
            title={title}
            options={spec.answers.map((a) => ({
                id: a.id,
                label: pickLocalized(a as Record<string, unknown>, "label", locale) || a.label_fr,
            }))}
            selected={value?.answerId}
            onChange={(id) => {
                const answer = spec.answers.find((a) => a.id === id);
                onChange({
                    answerId: id,
                    state: (answer?.state as FitCheckState["state"]) || "unknown",
                });
            }}
            onContinue={onContinue}
            continueLabel={t("contextContinue")}
        />
    );
}

export function OptionalNotesScreen({
    value,
    onChange,
    onContinue,
}: {
    value?: string;
    onChange: (next: string) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const freeText = getFreeTextSpec();
    const title =
        pickLocalized(freeText as Record<string, unknown>, "question", locale) ||
        freeText.question_fr ||
        (locale === "en"
            ? "Is there an improvement or idea you’d like to explore that we didn’t cover?"
            : "Y a-t-il une amélioration ou une idée que vous aimeriez explorer dans votre entreprise et que nous n’avons pas abordée?");
    const helper =
        pickLocalized(freeText as Record<string, unknown>, "helper", locale) ||
        freeText.helper_fr ||
        (locale === "en" ? "Describe it simply in a few words. Optional." : "Décrivez-la simplement en quelques mots. Facultatif.");
    const maxChars = freeText.max_chars ?? 600;

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader title={title} body={helper} />
            <textarea
                value={value || ""}
                maxLength={maxChars}
                onChange={(e) => onChange(e.target.value.slice(0, maxChars))}
                rows={5}
                className="w-full rounded-2xl border border-[#171717]/12 bg-white/80 px-4 py-3 text-base leading-relaxed text-[#171717] outline-none focus:border-[#4d6b97]"
                placeholder={locale === "en" ? "Optional" : "Facultatif"}
            />
            <StepContinue canContinue onContinue={onContinue} label={t("contextContinue")} />
        </div>
    );
}

/** Helper used by flow to list confirmation options for a pattern */
export function confirmationOptionsFor(
    confirmationId: string,
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>,
    primary?: AmbitionId,
): Array<{ id: string; label: string }> {
    void primary;
    if (confirmationId === "performance_blind_spot") {
        const selected = new Set(areaAnswers.leadership_performance || []);
        return getScanAnswers("leadership_performance")
            .filter((a) => a.capability && !selected.has(a.id) && a.id !== "other" && a.id !== "no_overview")
            .map((a) => ({ id: a.id, label: a.label_fr }));
    }
    if (confirmationId === "team_gap") {
        const selected = new Set(areaAnswers.team_people || []);
        return getScanAnswers("team_people")
            .filter((a) => a.capability && !selected.has(a.id) && !a.exclusive)
            .map((a) => ({ id: a.id, label: a.label_fr }));
    }
    return [];
}
