"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { ArrowLeft } from "@untitledui/icons";
import { getProgressStages as getProgressStagesV7 } from "@/content/diagnostic/v7/catalog";
import type { ProgressStageId as ProgressStageIdV7 } from "@/content/diagnostic/v7/types";
import { cx } from "@/utils/cx";

/** Shared visual shell for the diagnostic experience */
export function DiagnosticShell({
    children,
    progressStage,
    progressLabel,
    onBack,
    backLabel,
    className,
    stages: stagesProp,
}: {
    children: ReactNode;
    /** Active stage for segmented progress (never question totals) */
    progressStage?: ProgressStageIdV7 | string;
    progressLabel?: string;
    onBack?: () => void;
    backLabel?: string;
    className?: string;
    stages?: Array<{ id: string; label: string }>;
}) {
    const locale = useLocale();
    const stages = stagesProp ?? getProgressStagesV7(locale);
    const activeIndex = progressStage ? stages.findIndex((s) => s.id === progressStage) : -1;
    const activeLabel =
        (progressStage ? stages.find((s) => s.id === progressStage)?.label : undefined) ?? progressLabel;
    const showChrome = activeIndex >= 0 || Boolean(progressLabel) || Boolean(onBack);

    return (
        <div className={cx("relative mx-auto w-full max-w-2xl pt-8 md:pt-10", className)}>
            {showChrome ? (
                <div className="mb-8 flex flex-col gap-4 md:mb-10">
                    {onBack && backLabel ? (
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-[#737373] transition duration-100 hover:text-[#171717]"
                        >
                            <ArrowLeft className="size-4 shrink-0" aria-hidden />
                            {backLabel}
                        </button>
                    ) : null}

                    {activeIndex >= 0 ? (
                        <div className="flex flex-col gap-2.5">
                            <div className="flex items-baseline justify-between gap-3">
                                <p className="text-sm font-semibold tracking-[-0.01em] text-[#171717]">
                                    {activeLabel}
                                </p>
                                <p className="shrink-0 text-xs tabular-nums text-[#a3a3a3]">
                                    {activeIndex + 1}
                                    <span className="text-[#d4d4d4]"> / </span>
                                    {stages.length}
                                </p>
                            </div>
                            <div
                                className="flex gap-1"
                                role="progressbar"
                                aria-valuemin={1}
                                aria-valuemax={stages.length}
                                aria-valuenow={activeIndex + 1}
                                aria-label={activeLabel}
                            >
                                {stages.map((stage, index) => (
                                    <div
                                        key={stage.id}
                                        className={cx(
                                            "h-0.5 flex-1 rounded-full transition-colors duration-200",
                                            index < activeIndex
                                                ? "bg-[#4d6b97]"
                                                : index === activeIndex
                                                  ? "bg-[#4d6b97]"
                                                  : "bg-[#171717]/12",
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : activeLabel ? (
                        <p className="text-sm font-semibold tracking-[-0.01em] text-[#171717]">{activeLabel}</p>
                    ) : null}
                </div>
            ) : null}
            {children}
        </div>
    );
}
