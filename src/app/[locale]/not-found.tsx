"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
    const t = useTranslations("notFound");

    return (
        <div className="mx-auto flex min-h-[50vh] w-full max-w-xl flex-col justify-center px-4 py-24">
            <p className="text-sm font-semibold text-[#4d6b97]">{t("code")}</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,4vw,2.75rem)] font-normal leading-[1.15] tracking-[-0.03em] text-balance text-[#171717]">
                {t("title")}
            </h1>
            <p className="mt-4 text-lg leading-relaxed font-light text-pretty text-[#404040]">{t("body")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-lg bg-[#4d6b97] px-4 py-3 text-base font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#253353]"
                >
                    {t("home")}
                </Link>
                <Link
                    href={{ pathname: "/", hash: "modules" }}
                    className="inline-flex items-center justify-center rounded-lg border border-[#4d6b97] px-4 py-3 text-base font-semibold text-[#253353] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]"
                >
                    {t("modules")}
                </Link>
            </div>
        </div>
    );
}
