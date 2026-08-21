"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "@untitledui/icons";
import { SELECTABLE_STAGES } from "@/content/diagnostic/stages";
import type { StageId } from "@/content/diagnostic/types";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { cx } from "@/utils/cx";

export function StagePicker({
    selected,
    onToggle,
    onContinue,
}: {
    selected: StageId[];
    onToggle: (id: StageId) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const canContinue = selected.length >= 1;
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (canContinue) setError(null);
    }, [canContinue]);

    function handleContinue() {
        if (!canContinue) {
            setError(t("stagesNeedPick"));
            return;
        }
        setError(null);
        onContinue();
    }

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <header className="flex flex-col gap-3 border-b border-[#171717]/10 pb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4d6b97]">{t("toolEyebrow")}</p>
                <h1 className="font-display text-[32px] font-normal leading-[1.15] tracking-[-0.02em] text-[#171717] md:text-[40px]">
                    {t("stagesTitle")}
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-[#525252] md:text-lg">{t("stagesBody")}</p>
            </header>

            <div
                className="grid gap-3 sm:grid-cols-2"
                aria-invalid={Boolean(error) || undefined}
            >
                {SELECTABLE_STAGES.map((stage, i) => {
                    const isOn = selected.includes(stage.id);
                    return (
                        <button
                            key={stage.id}
                            type="button"
                            onClick={() => onToggle(stage.id)}
                            aria-pressed={isOn}
                            className={cx(
                                "group relative flex min-h-[108px] flex-col items-start gap-2 rounded-2xl px-4 py-4 text-left transition duration-150 ease-linear",
                                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                                isOn
                                    ? "bg-[#4d6b97] text-white shadow-[0_12px_28px_rgba(77,107,151,0.28)]"
                                    : error
                                      ? "bg-white text-[#171717] ring-1 ring-error-primary/45 hover:ring-error-primary"
                                      : "bg-white text-[#171717] ring-1 ring-[#171717]/10 hover:ring-[#4d6b97]/40",
                            )}
                        >
                            <div className="flex w-full items-start justify-between gap-3">
                                <span
                                    className={cx(
                                        "font-display text-sm font-normal tabular-nums",
                                        isOn ? "text-white/70" : "text-[#737373]",
                                    )}
                                >
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span
                                    className={cx(
                                        "flex size-6 items-center justify-center rounded-full transition duration-100",
                                        isOn ? "bg-white text-[#4d6b97]" : "bg-[#efedea] text-transparent ring-1 ring-[#171717]/10",
                                    )}
                                >
                                    <Check className="size-3.5 stroke-[2.5px]" aria-hidden />
                                </span>
                            </div>
                            <span className="text-[17px] font-semibold leading-snug">{t(`stages.${stage.id}`)}</span>
                            <span className={cx("text-sm leading-snug", isOn ? "text-white/80" : "text-[#737373]")}>
                                {t(`stageHints.${stage.id}`)}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-3 border-t border-[#171717]/10 pt-6">
                {error ? (
                    <p role="alert" className="text-sm font-medium text-error-primary">
                        {error}
                    </p>
                ) : (
                    <p className="text-sm text-[#737373]">
                        {selected.length === 0 ? t("stagesPickHint") : t("stagesSelected", { count: selected.length })}
                    </p>
                )}
                <div className="sm:flex sm:justify-end">
                    <CobreoButton size="xl" onClick={handleContinue}>
                        {t("stagesCta")}
                    </CobreoButton>
                </div>
            </div>
        </div>
    );
}
