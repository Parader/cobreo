"use client";

import { useTranslations } from "next-intl";
import { CobreoButton } from "@/components/cobreo/cobreo-button";

export function IntroGate({ onStart }: { onStart: () => void }) {
    const t = useTranslations("diagnostic");

    return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-10">
            <header className="flex flex-col gap-4 border-b border-[#171717]/10 pb-8">
                <p className="text-xs font-semibold tracking-[0.14em] text-[#4d6b97] uppercase">
                    {t("toolEyebrow")}
                </p>
                <h1 className="font-display text-[34px] font-normal leading-[1.12] tracking-[-0.03em] text-[#171717] md:text-[44px]">
                    {t("introTitle")}
                </h1>
                <div className="flex max-w-xl flex-col gap-3">
                    {t("introBody")
                        .split("\n\n")
                        .map((paragraph) => (
                            <p key={paragraph} className="text-base leading-relaxed text-[#525252] md:text-lg">
                                {paragraph}
                            </p>
                        ))}
                </div>
            </header>

            <div>
                <CobreoButton size="xl" glaze onClick={onStart}>
                    {t("introCta")}
                </CobreoButton>
            </div>
        </div>
    );
}
