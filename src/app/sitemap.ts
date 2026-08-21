import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cobreo.ca";
const locales = ["fr", "en"] as const;
const paths = ["", "services", "a-propos", "contact", "diagnostic", "confidentialite", "conditions", "cookies"];

export default function sitemap(): MetadataRoute.Sitemap {
    const entries: MetadataRoute.Sitemap = [];

    for (const locale of locales) {
        for (const path of paths) {
            const url = path ? `${siteUrl}/${locale}/${path}` : `${siteUrl}/${locale}`;
            entries.push({
                url,
                lastModified: new Date(),
                changeFrequency: "weekly",
                priority: path === "" ? 1 : 0.7,
                alternates: {
                    languages: {
                        fr: path ? `${siteUrl}/fr/${path}` : `${siteUrl}/fr`,
                        en: path ? `${siteUrl}/en/${path}` : `${siteUrl}/en`,
                    },
                },
            });
        }
    }

    return entries;
}
