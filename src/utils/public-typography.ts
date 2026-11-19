const NBSP = "\u00A0";
const NNBSP = "\u202F";

/**
 * French typographic spaces: narrow no-break before ? ! ; :,
 * and no-break spaces inside « ». Idempotent.
 */
export function formatFrenchPunctuation(input: string): string {
    return (
        input
            // Existing space(s) before high punctuation → narrow no-break
            .replace(/[\u0020\u00A0\u202F]+([?!:;])/g, `${NNBSP}$1`)
            // Missing space before ? ! ; (not :) after a letter/digit
            .replace(/([\p{L}\p{N}])([?!;])/gu, `$1${NNBSP}$2`)
            // Guillemets
            .replace(/«[\u0020\u00A0\u202F]*/g, `«${NBSP}`)
            .replace(/[\u0020\u00A0\u202F]*»/g, `${NBSP}»`)
    );
}

/**
 * Bind the last two words on each line so a lone last word (or ? ! : ; »)
 * cannot sit alone on the final line. Uses a regular space → NBSP.
 */
export function preventOrphans(input: string): string {
    return input
        .split("\n")
        .map((line) => {
            const i = line.lastIndexOf(" ");
            if (i <= 0) return line;
            const after = line.slice(i + 1);
            // Already bound (idempotent) — or leave URLs, emails, and bare times alone
            if (after.includes(NBSP)) return line;
            if (/@|https?:\/\//i.test(after) || /^\d{1,2}:\d{2}\b/.test(after)) return line;
            return `${line.slice(0, i)}${NBSP}${after}`;
        })
        .join("\n");
}

/** Public-site copy: French punctuation (fr) + orphan binding (fr & en). */
export function formatPublicCopy(input: string, locale: string): string {
    if (!input) return input;
    const withPunct = locale === "fr" ? formatFrenchPunctuation(input) : input;
    return preventOrphans(withPunct);
}

/** Deep-map string leaves in next-intl message trees. */
export function formatMessageTree<T>(value: T, locale: string): T {
    if (typeof value === "string") {
        return formatPublicCopy(value, locale) as T;
    }
    if (Array.isArray(value)) {
        return value.map((item) => formatMessageTree(item, locale)) as T;
    }
    if (value && typeof value === "object") {
        const out: Record<string, unknown> = {};
        for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
            out[key] = formatMessageTree(child, locale);
        }
        return out as T;
    }
    return value;
}
