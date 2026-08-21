import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DiagnosticWizard } from "@/components/cobreo/diagnostic-wizard";
import { buildPageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "diagnostic" });
    return buildPageMetadata({
        locale: locale as Locale,
        title: `${t("title")} · Cobreo`,
        description: t("subtitle"),
        path: "diagnostic",
    });
}

export default async function DiagnosticPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="relative min-h-[calc(100dvh-5rem)] bg-[#efedea]">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_at_top,_rgba(77,107,151,0.12),_transparent_65%)]"
            />
            <div className="relative mx-auto max-w-container px-4 pb-10 pt-0 md:px-8 md:pb-14">
                <DiagnosticWizard />
            </div>
        </div>
    );
}
