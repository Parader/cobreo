import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cobreo.ca";
const locales = ["fr", "en"] as const;

/** Public paths that resolve to real pages (redirect-only routes omitted). */
const paths = ["", "a-propos", "contact", "diagnostic", "confidentialite", "conditions", "cookies"] as const;

/**
 * Bump when page content actually changes. A `lastmod` that moves on every build
 * tells Google nothing and gets discounted.
 */
const lastModified = new Date("2026-11-17");

export default function sitemap(): MetadataRoute.Sitemap {
    const entries: MetadataRoute.Sitemap = [];

    for (const locale of locales) {
        for (const path of paths) {
            const url = path ? `${siteUrl}/${locale}/${path}` : `${siteUrl}/${locale}`;
            const fr = path ? `${siteUrl}/fr/${path}` : `${siteUrl}/fr`;
            const en = path ? `${siteUrl}/en/${path}` : `${siteUrl}/en`;
            entries.push({
                url,
                lastModified,
                changeFrequency: path === "" ? "weekly" : "monthly",
                priority: path === "" ? 1 : path === "contact" || path === "a-propos" ? 0.8 : 0.6,
                alternates: {
                    languages: {
                        fr,
                        en,
                        "x-default": fr,
                    },
                },
            });
        }
    }

    return entries;
}
