import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cobreo.ca";

export function buildPageMetadata({
    locale,
    title,
    description,
    path,
    noIndex = false,
}: {
    locale: Locale;
    title: string;
    description: string;
    path: string;
    noIndex?: boolean;
}): Metadata {
    const normalized = path.replace(/^\//, "");
    const pathname = normalized ? `/${locale}/${normalized}` : `/${locale}`;
    const url = `${siteUrl}${pathname}`;
    const ogLocale = locale === "fr" ? "fr_CA" : "en_CA";
    const alternateLocale = locale === "fr" ? "en" : "fr";

    // Absolute titles: pages already include the brand (avoids "%s · Cobreo" doubling).
    const absoluteTitle = { absolute: title };

    return {
        title: absoluteTitle,
        description,
        alternates: {
            canonical: url,
            languages: {
                fr: `${siteUrl}${normalized ? `/fr/${normalized}` : "/fr"}`,
                en: `${siteUrl}${normalized ? `/en/${normalized}` : "/en"}`,
                "x-default": `${siteUrl}/fr`,
            },
        },
        openGraph: {
            type: "website",
            url,
            title,
            description,
            siteName: "Cobreo",
            locale: ogLocale,
            alternateLocale: [alternateLocale === "fr" ? "fr_CA" : "en_CA"],
            images: [
                {
                    url: `${siteUrl}/og/default.png?v=7`,
                    width: 1200,
                    height: 630,
                    alt: "Cobreo",
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [`${siteUrl}/og/default.png?v=7`],
        },
        robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    };
}

/**
 * Public profiles Google uses to reconcile the "Cobreo" entity. Every URL here
 * must point at a page that names Cobreo and links back to cobreo.ca, otherwise
 * it weakens the signal instead of reinforcing it.
 */
export const LINKEDIN_URL = "https://www.linkedin.com/company/cobreo";

const sameAs: string[] = [LINKEDIN_URL];

const descriptions: Record<Locale, string> = {
    fr: "Cobreo est un studio québécois qui conçoit des solutions applicatives et automatise les processus d’affaires des PME afin d’améliorer leurs opérations.",
    en: "Cobreo is a Quebec studio that designs software solutions and automates business processes for small and mid-sized companies to improve their operations.",
};

/**
 * Site-wide entity graph, rendered on every page. Organization and WebSite share
 * stable `@id`s so Google merges them into a single Cobreo entity rather than
 * treating each page as an unrelated mention.
 */
export function siteJsonLd(locale: Locale) {
    const organizationId = `${siteUrl}/#organization`;

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": organizationId,
                name: "Cobreo",
                legalName: "Cobreo",
                alternateName: "Cobreo.ca",
                url: siteUrl,
                logo: {
                    "@type": "ImageObject",
                    url: `${siteUrl}/og/default.png?v=7`,
                    width: 1200,
                    height: 630,
                },
                image: `${siteUrl}/og/default.png?v=7`,
                description: descriptions[locale],
                email: "contact@cobreo.ca",
                knowsLanguage: ["fr-CA", "en-CA"],
                areaServed: { "@type": "Country", name: "Canada" },
                address: {
                    "@type": "PostalAddress",
                    addressLocality: "Lévis",
                    addressRegion: "QC",
                    addressCountry: "CA",
                },
                contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "customer support",
                    email: "contact@cobreo.ca",
                    availableLanguage: ["French", "English"],
                },
                ...(sameAs.length > 0 ? { sameAs } : {}),
            },
            {
                "@type": "WebSite",
                "@id": `${siteUrl}/#website`,
                url: siteUrl,
                name: "Cobreo",
                alternateName: "Cobreo.ca",
                description: descriptions[locale],
                inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
                publisher: { "@id": organizationId },
            },
        ],
    };
}
