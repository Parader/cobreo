"use client";

import { useTranslations } from "next-intl";
import type { ZoneResult } from "@/content/diagnostic/types";
import { cx } from "@/utils/cx";

const BAND_STYLES: Record<ZoneResult["band"], string> = {
    high: "bg-[#4d6b97] text-white",
    moderate: "bg-[#d7e0ec] text-[#253353] ring-1 ring-[#4d6b97]/25",
    some: "bg-[#ebe7e1] text-[#525252] ring-1 ring-[#171717]/10",
    low: "bg-transparent text-[#737373] ring-1 ring-[#171717]/12",
};

const BAND_DOT: Record<ZoneResult["band"], string> = {
    high: "bg-white",
    moderate: "bg-[#4d6b97]",
    some: "bg-[#8a8580]",
    low: "bg-[#c4bfb8]",
};

export function BandBadge({
    band,
    size = "md",
}: {
    band: ZoneResult["band"];
    size?: "sm" | "md";
}) {
    const t = useTranslations("diagnostic");

    return (
        <span
            className={cx(
                "inline-flex max-w-full shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full font-semibold",
                size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
                BAND_STYLES[band],
            )}
        >
            <span className={cx("size-1.5 shrink-0 rounded-full", BAND_DOT[band])} aria-hidden />
            {t(`bands.${band}`)}
        </span>
    );
}
