import type { Locale } from "@/i18n/routing";

/** Prefer `*_en` when locale is English and the field exists; otherwise `*_fr`. */
export function pickLocalized<T extends Record<string, unknown>>(
    obj: T | null | undefined,
    baseKey: string,
    locale: string | Locale,
): string {
    if (!obj) return "";
    const enKey = `${baseKey}_en`;
    const frKey = `${baseKey}_fr`;
    if (locale === "en") {
        const en = obj[enKey];
        if (typeof en === "string" && en.length) return en;
    }
    const fr = obj[frKey];
    return typeof fr === "string" ? fr : "";
}

export function isEnglishLocale(locale: string | Locale): boolean {
    return locale === "en";
}
