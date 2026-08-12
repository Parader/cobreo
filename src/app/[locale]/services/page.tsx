import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "services" });
    return buildPageMetadata({
        locale: locale as Locale,
        title: `${t("title")} · Cobreo`,
        description: t("body"),
        path: "services",
    });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("services");

    return (
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
            <h1 className="text-display-sm font-normal tracking-tight text-primary md:text-display-md">{t("title")}</h1>
            <p className="mt-6 text-lg leading-relaxed text-tertiary">{t("body")}</p>
        </div>
    );
}
