import type { Metadata } from "next";
import type { Locale } from "@/i18n/routing";
import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

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
    fr: "Cobreo est une plateforme que l’on compose à partir de modules. Les données de l’application sont hébergées au Canada.",
    en: "Cobreo is a platform you compose from modules. Application data is hosted in Canada.",
};

type ModuleCopy = { id: string; name: string; tagline: string };

/** One "Module — what it does" line per module, from the landing-page copy. */
function moduleFeatureList(locale: Locale): string[] {
    const items = (locale === "fr" ? fr : en).modules.items as ModuleCopy[];
    return items
        .filter((item) => item.id !== "tasks")
        .map((item) => `${item.name} — ${item.tagline}`.replace(/[\u00a0\u202f]/g, " "));
}

export type FaqItem = {
    question: string;
    answer: string;
};

/**
 * Site-wide entity graph, rendered on every page. Organization and WebSite share
 * stable `@id`s so Google merges them into a single Cobreo entity rather than
 * treating each page as an unrelated mention.
 */
export function siteJsonLd(locale: Locale) {
    const organizationId = `${siteUrl}/#organization`;
    const websiteId = `${siteUrl}/#website`;
    const softwareId = `${siteUrl}/#software`;
    const description = descriptions[locale];

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
                    url: `${siteUrl}/images/cobreologo.svg`,
                    contentUrl: `${siteUrl}/images/cobreologo.svg`,
                },
                image: `${siteUrl}/og/default.png?v=7`,
                description,
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
                    url: `${siteUrl}/${locale}/contact`,
                },
                ...(sameAs.length > 0 ? { sameAs } : {}),
            },
            {
                "@type": "WebSite",
                "@id": websiteId,
                url: siteUrl,
                name: "Cobreo",
                alternateName: "Cobreo.ca",
                description,
                inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
                publisher: { "@id": organizationId },
            },
            {
                "@type": "SoftwareApplication",
                "@id": softwareId,
                name: "Cobreo",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                url: siteUrl,
                description,
                inLanguage: ["fr-CA", "en-CA"],
                provider: { "@id": organizationId },
                publisher: { "@id": organizationId },
                isAccessibleForFree: false,
                countriesSupported: "CA",
                featureList: moduleFeatureList(locale),
            },
        ],
    };
}

/** FAQPage graph for the landing page only. */
export function faqPageJsonLd(locale: Locale, items: FaqItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${siteUrl}/${locale}#faq`,
        url: `${siteUrl}/${locale}`,
        inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
        mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    };
}

export type FounderSchema = { name: string; jobTitle: string; image: string };

/** About page graph: the page, and the founders as people working for the Cobreo organization. */
export function aboutPageJsonLd(locale: Locale, founders: FounderSchema[]) {
    const organizationId = `${siteUrl}/#organization`;
    const url = `${siteUrl}/${locale}/a-propos`;
    const people = founders.map((founder) => ({
        "@type": "Person",
        "@id": `${siteUrl}/#${founder.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")}`,
        name: founder.name,
        jobTitle: founder.jobTitle,
        image: `${siteUrl}${founder.image}`,
        worksFor: { "@id": organizationId },
    }));
    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "AboutPage",
                "@id": `${url}#page`,
                url,
                inLanguage: locale === "fr" ? "fr-CA" : "en-CA",
                about: { "@id": organizationId },
            },
            { "@id": organizationId, founder: people.map((person) => ({ "@id": person["@id"] })) },
            ...people,
        ],
    };
}
