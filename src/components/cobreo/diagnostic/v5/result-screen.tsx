"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { LeadCapture } from "@/components/cobreo/diagnostic/lead-capture";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { OPPORTUNITY_LABELS_FR } from "@/content/diagnostic/v5/catalog";
import type { DiagnosticV5AnswersPayload, DiagnosticV5Result } from "@/content/diagnostic/v5/types";
import { cx } from "@/utils/cx";

export function ResultScreenV5({
    result,
    payload,
    summary,
    onDone,
    onRestart,
}: {
    result: DiagnosticV5Result;
    payload: DiagnosticV5AnswersPayload;
    summary: string;
    onDone: () => void;
    onRestart?: () => void;
}) {
    const t = useTranslations("diagnostic");
    const titleRef = useRef<HTMLHeadingElement>(null);

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
        titleRef.current?.focus({ preventScroll: true });
    }, []);

    const title =
        result.kind === "early_stage"
            ? t("resultEarlyTitle")
            : result.kind === "healthy"
              ? t("resultHealthyTitle")
              : t("resultTitle");

    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4d6b97]">{t("toolEyebrow")}</p>
                <h2
                    ref={titleRef}
                    tabIndex={-1}
                    className="font-display text-[28px] font-normal tracking-[-0.02em] text-[#171717] outline-none md:text-[36px]"
                >
                    {title}
                </h2>
                {result.message ? (
                    <p className="max-w-xl text-base leading-relaxed text-[#525252] md:text-lg">{result.message}</p>
                ) : (
                    <p className="max-w-xl text-base leading-relaxed text-[#525252] md:text-lg">{t("resultIntro")}</p>
                )}
            </header>

            {result.whatWeNoticed.length > 0 ? (
                <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold tracking-wide text-[#737373] uppercase">
                        {t("resultNoticedTitle")}
                    </h3>
                    <ul className="flex flex-col gap-2">
                        {result.whatWeNoticed.map((item) => (
                            <li
                                key={item}
                                className="rounded-xl bg-white/70 px-4 py-3 text-base text-[#404040] ring-1 ring-[#171717]/8"
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {result.opportunities.length > 0 ? (
                <section className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold tracking-wide text-[#737373] uppercase">
                        {t("resultOpportunitiesTitle")}
                    </h3>
                    <ul className="flex flex-col gap-3">
                        {result.opportunities.map((opportunity) => (
                            <li
                                key={opportunity.id}
                                className="rounded-2xl bg-white/80 p-5 ring-1 ring-[#171717]/8 md:p-6"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-display text-xl text-[#171717]">
                                        {OPPORTUNITY_LABELS_FR[opportunity.id] ?? opportunity.id}
                                    </p>
                                    <span
                                        className={cx(
                                            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                            opportunity.level === "clear"
                                                ? "bg-[#4d6b97]/15 text-[#253353]"
                                                : opportunity.level === "possible"
                                                  ? "bg-[#b1b6a6]/40 text-[#253353]"
                                                  : "bg-[#171717]/8 text-[#525252]",
                                        )}
                                    >
                                        {t(`resultLevel.${opportunity.level}`)}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm text-[#525252]">
                                    <span className="font-semibold text-[#404040]">{t("resultGainLabel")} : </span>
                                    {t(`resultGain.${opportunity.potentialGain}`)}
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-[#525252]">
                                    <span className="font-semibold text-[#404040]">{t("resultWhyLabel")} : </span>
                                    {opportunity.why}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            <p className="text-sm leading-relaxed text-[#737373]">{t("resultNote")}</p>

            {result.kind === "opportunities" ? (
                <LeadCapture payload={payload} summary={summary} onDone={onDone} />
            ) : (
                <LeadCapture payload={payload} summary={summary} healthy onDone={onDone} />
            )}

            {onRestart ? (
                <CobreoButton variant="ghost" size="lg" onClick={onRestart} className="self-start">
                    {t("restartCta")}
                </CobreoButton>
            ) : null}
        </div>
    );
}
