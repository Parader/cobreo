"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "@untitledui/icons";
import { ANSWER_OPTIONS, asMultiValue, isMultiAnswerType } from "@/content/diagnostic/scales";
import type { AnswerType, AnswerValue, StoredAnswer } from "@/content/diagnostic/types";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { cx } from "@/utils/cx";

export function QuestionCard({
    questionId,
    answerType,
    progressLabel,
    value,
    onChange,
    onNext,
    onSkip,
    onFocus,
    mode,
    isLast,
}: {
    questionId: string;
    answerType: AnswerType;
    progressLabel: string;
    value?: StoredAnswer;
    onChange: (v: StoredAnswer) => void;
    onNext: () => void;
    onSkip: () => void;
    onFocus?: () => void;
    mode: "active" | "past";
    isLast?: boolean;
}) {
    const t = useTranslations("diagnostic");
    const options = ANSWER_OPTIONS[answerType];
    const multi = isMultiAnswerType(answerType);
    const selectedMulti = asMultiValue(value);
    const hasAnswer = multi ? selectedMulti.length > 0 : Boolean(value);
    const past = mode === "past";
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (hasAnswer) setError(null);
    }, [hasAnswer, value]);

    const visibleOptions = past
        ? options.filter((opt) => (multi ? selectedMulti.includes(opt) : value === opt))
        : options;

    function toggleChannel(opt: AnswerValue) {
        const next = selectedMulti.includes(opt)
            ? selectedMulti.filter((v) => v !== opt)
            : [...selectedMulti, opt];
        onChange(next);
    }

    function handleNext() {
        if (!hasAnswer) {
            setError(multi ? t("needChannel") : t("needAnswer"));
            return;
        }
        setError(null);
        onNext();
    }

    return (
        <div
            className={cx(
                "rounded-2xl transition-[opacity,background-color,box-shadow] duration-300 ease-out",
                past
                    ? "cursor-pointer bg-transparent opacity-[0.42] hover:opacity-70"
                    : "bg-white/80 opacity-100 shadow-[0_18px_40px_rgba(23,23,23,0.06)] ring-1 ring-[#171717]/06",
            )}
            onClick={past ? onFocus : undefined}
            onKeyDown={
                past
                    ? (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onFocus?.();
                          }
                      }
                    : undefined
            }
            role={past ? "button" : undefined}
            tabIndex={past ? 0 : undefined}
            aria-label={past ? t("editAnswer") : undefined}
        >
            <div className={cx("flex flex-col", past ? "gap-3 px-1 py-2" : "gap-7 px-5 py-6 md:px-7 md:py-8")}>
                <div className="flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-[#737373]">{progressLabel}</span>
                        {past ? (
                            <span className="text-xs font-semibold text-[#4d6b97]">{t("editAnswer")}</span>
                        ) : null}
                    </div>
                    <h2
                        className={cx(
                            "font-display font-normal leading-[1.2] tracking-[-0.02em] text-[#171717]",
                            past ? "text-[20px] md:text-[22px]" : "text-[26px] md:text-[32px]",
                        )}
                    >
                        {t(`questions.${questionId}`)}
                    </h2>
                    {!past && multi ? <p className="text-sm text-[#737373]">{t("multiSelectHint")}</p> : null}
                </div>

                {past && !hasAnswer ? (
                    <p className="text-sm font-medium text-[#737373]">{t("skippedLabel")}</p>
                ) : (
                    <div
                        className="flex flex-col gap-2.5"
                        role={multi ? "group" : "listbox"}
                        aria-label={t(`questions.${questionId}`)}
                        aria-invalid={Boolean(error) || undefined}
                    >
                        {visibleOptions.map((opt) => {
                            const selected = multi ? selectedMulti.includes(opt) : value === opt;
                            return (
                                <button
                                    key={opt}
                                    type="button"
                                    role={multi ? "checkbox" : "option"}
                                    aria-checked={multi ? selected : undefined}
                                    aria-selected={!multi ? selected : undefined}
                                    onClick={() => {
                                        if (past) {
                                            onFocus?.();
                                            return;
                                        }
                                        if (multi) toggleChannel(opt);
                                        else onChange(opt);
                                    }}
                                    className={cx(
                                        "flex min-h-[48px] w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-semibold transition duration-100 ease-linear",
                                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                                        past
                                            ? "min-h-0 bg-[#4d6b97]/10 py-2.5 text-[#4d6b97] ring-0"
                                            : selected
                                              ? "bg-[#4d6b97] text-white shadow-[0_10px_24px_rgba(77,107,151,0.25)]"
                                              : error
                                                ? "bg-white text-[#171717] ring-1 ring-error-primary/50 hover:ring-error-primary"
                                                : "bg-white text-[#171717] ring-1 ring-[#171717]/10 hover:ring-[#4d6b97]/35",
                                    )}
                                >
                                    {multi && !past ? (
                                        <span
                                            className={cx(
                                                "flex size-5 shrink-0 items-center justify-center rounded-md",
                                                selected
                                                    ? "bg-white text-[#4d6b97]"
                                                    : "bg-[#efedea] ring-1 ring-[#171717]/15",
                                            )}
                                        >
                                            {selected ? (
                                                <Check className="size-3.5 stroke-[2.5px]" aria-hidden />
                                            ) : null}
                                        </span>
                                    ) : null}
                                    <span>{t(`answers.${answerType}.${opt}`)}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {!past ? (
                    <div className="flex flex-col gap-3 border-t border-[#171717]/10 pt-5">
                        {error ? (
                            <p role="alert" className="text-sm font-medium text-error-primary">
                                {error}
                            </p>
                        ) : null}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                type="button"
                                onClick={onSkip}
                                className="text-sm font-semibold text-[#737373] transition duration-100 hover:text-[#404040]"
                            >
                                {t("skip")}
                            </button>
                            <CobreoButton size="lg" onClick={handleNext}>
                                {isLast ? t("resultCta") : t("next")}
                            </CobreoButton>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

/** @deprecated Prefer QuestionCard — kept for any leftover imports */
export const QuestionScreen = QuestionCard;
