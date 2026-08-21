import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LegalDocument, renderLegalSections } from "@/components/cobreo/legal-document";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "legal.cookies" });
    return buildPageMetadata({
        locale: locale as Locale,
        title: `${t("title")} · Cobreo`,
        description: t("intro"),
        path: "cookies",
    });
}

export default async function CookiesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("legal.cookies");

    return (
        <LegalDocument
            title={t("title")}
            updated={t("updated")}
            intro={t("intro")}
            sections={renderLegalSections(t.raw("sections"))}
        />
    );
}
