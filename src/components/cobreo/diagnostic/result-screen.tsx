"use client";

import { useLayoutEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { DiagnosticAnswersPayload, DiagnosticResult, StageId } from "@/content/diagnostic/types";
import { BandBadge } from "@/components/cobreo/diagnostic/band-badge";
import { LeadCapture } from "@/components/cobreo/diagnostic/lead-capture";
import { cx } from "@/utils/cx";

const BAND_ORDER = ["high", "moderate", "some", "low"] as const;

export function ResultScreen({
    result,
    payload,
    summary,
    onDone,
    onRestart,
}: {
    result: DiagnosticResult;
    payload: DiagnosticAnswersPayload;
    summary: string;
    onDone: () => void;
    onRestart?: () => void;
}) {
    const t = useTranslations("diagnostic");
    const titleRef = useRef<HTMLHeadingElement>(null);

    useLayoutEffect(() => {
        // Quiz leaves the window scrolled deep — pin to top before paint
        const html = document.documentElement;
        const body = document.body;
        html.scrollTop = 0;
        body.scrollTop = 0;
        window.scrollTo(0, 0);
        titleRef.current?.focus({ preventScroll: true });
    }, []);

    const sorted = [...result.zones].sort(
        (a, b) => BAND_ORDER.indexOf(a.band) - BAND_ORDER.indexOf(b.band) || b.score - a.score,
    );
    const highlighted = sorted.filter((z) => result.highlighted.includes(z.stage)).slice(0, 3);
    const primary = highlighted.length > 0 ? highlighted : sorted;
    const secondary = highlighted.length > 0 ? sorted.filter((z) => !primary.some((p) => p.stage === z.stage)) : [];

    return (
        <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4d6b97]">{t("toolEyebrow")}</p>
                <h2
                    ref={titleRef}
                    tabIndex={-1}
                    className="font-display text-[28px] font-normal tracking-[-0.02em] text-[#171717] outline-none md:text-[36px]"
                >
                    {t("resultTitle")}
                </h2>
                <p className="max-w-xl text-base leading-relaxed text-[#525252] md:text-lg">{t("resultIntro")}</p>
            </header>

            <section className="flex flex-col gap-3">
                <ul className="flex flex-col gap-3">
                    {primary.map((zone) => (
                        <li
                            key={zone.stage}
                            className={cx(
                                "rounded-2xl px-5 py-4",
                                highlighted.length > 0
                                    ? "bg-white shadow-[0_10px_24px_rgba(77,107,151,0.12)] ring-1 ring-[#4d6b97]/35"
                                    : "bg-white ring-1 ring-[#171717]/8",
                            )}
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h4 className="text-lg font-semibold text-[#171717]">
                                    {t(`stages.${zone.stage as StageId}`)}
                                </h4>
                                <BandBadge band={zone.band} />
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-[#525252] md:text-base">
                                {t(`blurbs.${zone.stage}.${zone.band}`)}
                            </p>
                        </li>
                    ))}
                </ul>
            </section>

            <LeadCapture payload={payload} summary={summary} onDone={onDone} />

            {secondary.length > 0 ? (
                <section className="flex flex-col gap-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#737373]">
                        {t("resultOther")}
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                        {secondary.map((zone) => (
                            <li key={zone.stage} className="rounded-2xl bg-[#efedea]/80 px-5 py-3.5 ring-1 ring-[#171717]/8">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h4 className="text-base font-semibold text-[#171717]">
                                        {t(`stages.${zone.stage as StageId}`)}
                                    </h4>
                                    <BandBadge band={zone.band} size="sm" />
                                </div>
                                <p className="mt-1.5 text-sm leading-relaxed text-[#525252]">
                                    {t(`blurbs.${zone.stage}.${zone.band}`)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {onRestart ? (
                <div className="border-t border-[#171717]/10 pt-6 text-center">
                    <button
                        type="button"
                        onClick={onRestart}
                        className="cursor-pointer text-sm font-semibold text-[#525252] transition duration-100 hover:text-[#171717]"
                    >
                        {t("restartCta")}
                    </button>
                </div>
            ) : null}
        </div>
    );
}
