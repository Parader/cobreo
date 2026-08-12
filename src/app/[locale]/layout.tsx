import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Manrope } from "next/font/google";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { routing, type Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/cobreo/site-header";
import { SiteFooter } from "@/components/cobreo/site-footer";
import { cx } from "@/utils/cx";

const manrope = Manrope({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-manrope",
});

export function generateStaticParams() {
    return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!routing.locales.includes(locale as Locale)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages();

    return (
        <div className={cx(manrope.variable, "min-h-dvh bg-primary font-body text-primary antialiased")}>
            <RouteProvider>
                <Theme>
                    <NextIntlClientProvider messages={messages}>
                        <SiteHeader />
                        <main>{children}</main>
                        <SiteFooter />
                    </NextIntlClientProvider>
                </Theme>
            </RouteProvider>
        </div>
    );
}
