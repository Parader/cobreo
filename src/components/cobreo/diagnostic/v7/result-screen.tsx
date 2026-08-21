"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { BookingClose } from "@/components/cobreo/diagnostic/v7/booking-close";
import { getResultsSpec } from "@/content/diagnostic/v7/catalog";
import type { DiagnosticV7AnswersPayload, DiagnosticV7Result } from "@/content/diagnostic/v7/types";
import { pickLocalized } from "@/lib/diagnostic/localize";

export function ResultScreenV7({
    result,
    payload,
    summary,
    onDone,
    onRestart,
}: {
    result: DiagnosticV7Result;
    payload: DiagnosticV7AnswersPayload;
    summary: string;
    onDone: () => void;
    onRestart?: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [openWhy, setOpenWhy] = useState<Record<string, boolean>>({});
    const resultsSpec = getResultsSpec();
    const page = resultsSpec.page;

    useLayoutEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        html.scrollTop = 0;
        body.scrollTop = 0;
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        titleRef.current?.focus({ preventScroll: true });
    }, []);

    const title =
        pickLocalized((page || {}) as Record<string, unknown>, "title", locale) ||
        page?.title_fr ||
        (locale === "en" ? "Where Cobreo could help you" : "Où Cobreo pourrait vous aider");
    const intro =
        result.message ||
        pickLocalized((page || {}) as Record<string, unknown>, "intro", locale) ||
        page?.intro_fr;
    const whyLabel =
        pickLocalized((page?.section_card?.why_toggle || {}) as Record<string, unknown>, "label", locale) ||
        page?.section_card?.why_toggle?.label_fr ||
        (locale === "en" ? "Why these services?" : "Pourquoi ces services?");

    const sections = result.serviceSections || [];

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
                {intro ? (
                    <p className="max-w-xl text-base leading-relaxed text-[#525252] md:text-lg">{intro}</p>
                ) : null}
            </header>

            {result.selectedPossibilities?.length ? (
                <section className="flex flex-col gap-3">
                    <h3 className="font-display text-[20px] leading-tight text-[#171717] md:text-[22px]">
                        {locale === "en"
                            ? "What you chose to explore"
                            : "Ce que vous avez choisi d’explorer"}
                    </h3>
                    <ul className="flex flex-col gap-2">
                        {result.selectedPossibilities.map((item) => (
                            <li key={item.id} className="text-base leading-relaxed text-[#525252]">
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}

            {sections.length > 0 ? (
                <section className="flex flex-col gap-4">
                    <ul className="flex flex-col gap-4">
                        {sections.map((section) => {
                            const whyOpen = Boolean(openWhy[section.areaId]);
                            return (
                                <li
                                    key={section.areaId}
                                    className="rounded-2xl bg-white/90 p-5 shadow-[0_12px_32px_rgba(23,23,23,0.06)] ring-1 ring-[#171717]/10 md:p-6"
                                >
                                    <p className="font-display text-[22px] leading-tight text-[#171717] md:text-[26px]">
                                        {section.title}
                                    </p>
                                    <ul className="mt-4 flex flex-wrap gap-2">
                                        {section.services.map((service) => (
                                            <li
                                                key={service.id}
                                                className="rounded-md bg-[#4d6b97]/12 px-3 py-1.5 text-sm font-medium text-[#253353]"
                                            >
                                                {service.label}
                                            </li>
                                        ))}
                                    </ul>
                                    {section.why.length > 0 ? (
                                        <div className="mt-4">
                                            <button
                                                type="button"
                                                className="text-sm font-semibold text-[#4d6b97] hover:underline"
                                                aria-expanded={whyOpen}
                                                onClick={() =>
                                                    setOpenWhy((prev) => ({
                                                        ...prev,
                                                        [section.areaId]: !prev[section.areaId],
                                                    }))
                                                }
                                            >
                                                {whyLabel}
                                            </button>
                                            {whyOpen ? (
                                                <ul className="mt-2 flex flex-col gap-1.5">
                                                    {section.why.map((reason) => (
                                                        <li
                                                            key={reason}
                                                            className="text-sm leading-relaxed text-[#525252]"
                                                        >
                                                            {reason}
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ) : (
                <p className="text-base leading-relaxed text-[#525252]">
                    {locale === "en"
                        ? "Nothing urgent stands out from this pass — you can still book a short call if you want a second look."
                        : "Rien d’urgent ne se détache de ce passage — vous pouvez tout de même réserver un court échange pour un second regard."}
                </p>
            )}

            <BookingClose payload={payload} summary={summary} onDone={onDone} />

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
