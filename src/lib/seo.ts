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

export function organizationJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Cobreo",
        url: siteUrl,
        logo: `${siteUrl}/images/cobreologo.svg`,
        email: "contact@cobreo.ca",
        areaServed: "CA",
        sameAs: [],
    };
}
