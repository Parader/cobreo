import type { Locale } from "@/i18n/routing";
import { formatPublicCopy } from "@/utils/public-typography";

/** Prefer `*_en` when locale is English and the field exists; otherwise `*_fr`. */
export function pickLocalized<T extends Record<string, unknown>>(
    obj: T | null | undefined,
    baseKey: string,
    locale: string | Locale,
): string {
    if (!obj) return "";
    const enKey = `${baseKey}_en`;
    const frKey = `${baseKey}_fr`;
    const lang = locale === "en" ? "en" : "fr";
    if (locale === "en") {
        const en = obj[enKey];
        if (typeof en === "string" && en.length) return formatPublicCopy(en, lang);
    }
    const fr = obj[frKey];
    return typeof fr === "string" ? formatPublicCopy(fr, lang) : "";
}

export function isEnglishLocale(locale: string | Locale): boolean {
    return locale === "en";
}
