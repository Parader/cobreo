import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/cobreo/contact-form";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "contact" });
    const meta = await getTranslations({ locale, namespace: "meta" });
    return buildPageMetadata({
        locale: locale as Locale,
        title: `${t("title")} · Cobreo`,
        description: t("subtitle"),
        path: "contact",
    });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("contact");

    return (
        <div className="mx-auto max-w-container px-4 py-16 md:px-8 md:py-24">
            <div className="mb-10 max-w-2xl">
                <h1 className="text-display-sm font-normal tracking-tight text-primary md:text-display-md">{t("title")}</h1>
                <p className="mt-3 text-lg text-tertiary">{t("subtitle")}</p>
            </div>
            <ContactForm />
        </div>
    );
}
