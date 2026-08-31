import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { RouteProvider } from "@/providers/router-provider";
import { Theme } from "@/providers/theme";
import { routing, type Locale } from "@/i18n/routing";
import { SiteHeader } from "@/components/cobreo/site-header";
import { SiteFooter } from "@/components/cobreo/site-footer";
import { CookieConsentBanner } from "@/components/cobreo/cookie-consent-banner";
import { PostHogProvider } from "@/components/cobreo/posthog-provider";
import { siteJsonLd } from "@/lib/seo";
import { cx } from "@/utils/cx";

// One variable axis (200–900) replaces six static weight files: fewer render-blocking
// stylesheets and one woff2 per script instead of one per weight.
import "@fontsource-variable/sn-pro/wght.css";
import "@fontsource-variable/sn-pro/wght-italic.css";

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
    const t = await getTranslations({ locale, namespace: "nav" });

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd(locale as Locale)) }}
                />
            </head>
            <body className="bg-primary antialiased">
                <div
                    className={cx("min-h-dvh bg-[#efedea] font-body text-[#171717] antialiased")}
                    style={{ fontFamily: '"SN Pro Variable", ui-sans-serif, sans-serif' }}
                >
                    <RouteProvider>
                        <Theme>
                            <NextIntlClientProvider messages={messages}>
                                <PostHogProvider>
                                <a
                                    href="#main-content"
                                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[#4d6b97] focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-[#253353]"
                                >
                                    {t("skipToContent")}
                                </a>
                                <SiteHeader />
                                <main id="main-content" className="pt-20 md:pt-24">
                                    {children}
                                </main>
                                <SiteFooter />
                                <CookieConsentBanner />
                                </PostHogProvider>
                            </NextIntlClientProvider>
                        </Theme>
                    </RouteProvider>
                </div>
            </body>
        </html>
    );
}
