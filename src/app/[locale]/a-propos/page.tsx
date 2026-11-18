import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AboutPage } from "@/components/cobreo/about-page";
import { aboutPageJsonLd, buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "about" });
    return buildPageMetadata({
        locale: locale as Locale,
        title: t("title"),
        description: t("metaDescription"),
        path: "a-propos",
    });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations({ locale, namespace: "about" });
    const jsonLd = aboutPageJsonLd(locale as Locale, [
        { name: t("founder2Name"), jobTitle: t("founder2Role"), image: "/images/founders/nicolas-stoltz.png" },
        { name: t("founder1Name"), jobTitle: t("founder1Role"), image: "/images/founders/derick-paradis.png" },
    ]);
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <AboutPage />
        </>
    );
}
