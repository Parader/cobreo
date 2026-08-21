"use client";

import { useTranslations } from "next-intl";
import { CobreoButton } from "@/components/cobreo/cobreo-button";

export function ResumeGate({
    onContinue,
    onRestart,
}: {
    onContinue: () => void;
    onRestart: () => void;
}) {
    const t = useTranslations("diagnostic");

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
            <header className="flex flex-col gap-3 border-b border-[#171717]/10 pb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4d6b97]">{t("toolEyebrow")}</p>
                <h1 className="font-display text-[32px] font-normal leading-[1.15] tracking-[-0.02em] text-[#171717] md:text-[40px]">
                    {t("resumeTitle")}
                </h1>
                <p className="max-w-xl text-base leading-relaxed text-[#525252] md:text-lg">{t("resumeBody")}</p>
            </header>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <CobreoButton size="xl" onClick={onContinue}>
                    {t("resumeContinue")}
                </CobreoButton>
                <button
                    type="button"
                    onClick={onRestart}
                    className="cursor-pointer text-sm font-semibold text-[#525252] transition duration-100 hover:text-[#171717] sm:ml-2"
                >
                    {t("resumeRestart")}
                </button>
            </div>
        </div>
    );
}
