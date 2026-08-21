"use client";

import { useLayoutEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { LeadCapture } from "@/components/cobreo/diagnostic/lead-capture";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { getResultLabels, opportunityLabel } from "@/content/diagnostic/v6/catalog";
import type { DiagnosticV6AnswersPayload, DiagnosticV6Result } from "@/content/diagnostic/v6/types";
import { cx } from "@/utils/cx";

export function ResultScreenV6({
    result,
    payload,
    summary,
    onDone,
    onRestart,
}: {
    result: DiagnosticV6Result;
    payload: DiagnosticV6AnswersPayload;
    summary: string;
    onDone: () => void;
    onRestart?: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const labels = getResultLabels(locale);
    const titleRef = useRef<HTMLHeadingElement>(null);

    useLayoutEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        html.scrollTop = 0;
        body.scrollTop = 0;
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        titleRef.current?.focus({ preventScroll: true });
    }, []);

    const title = result.hasCredibleOpportunity ? t("resultTitle") : t("resultHealthyTitle");

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
                                key={`${opportunity.topic}-${opportunity.id}`}
                                className="rounded-2xl bg-white/80 p-5 ring-1 ring-[#171717]/8 md:p-6"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-display text-xl text-[#171717]">
                                        {opportunityLabel(opportunity.id, locale)}
                                    </p>
                                    <span
                                        className={cx(
                                            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                                            opportunity.type === "improvement" ||
                                                opportunity.type === "fit_gap"
                                                ? "bg-[#4d6b97]/15 text-[#253353]"
                                                : opportunity.type === "emerging"
                                                  ? "bg-[#b1b6a6]/40 text-[#253353]"
                                                  : opportunity.type === "optimization"
                                                    ? "bg-[#4d6b97]/10 text-[#253353]"
                                                    : "bg-[#171717]/8 text-[#525252]",
                                        )}
                                    >
                                        {labels[opportunity.type] ?? opportunity.type}
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

            {result.message ? null : (
                <p className="text-sm leading-relaxed text-[#737373]">{t("resultNote")}</p>
            )}

            <LeadCapture
                payload={payload}
                summary={summary}
                healthy={!result.hasCredibleOpportunity}
                onDone={onDone}
            />

            {onRestart ? (
                <CobreoButton
                    variant="ghost"
                    size="lg"
                    className="self-start"
                    onClick={() => {
                        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
                        onRestart();
                    }}
                >
                    {t("restartCta")}
                </CobreoButton>
            ) : null}
        </div>
    );
}
