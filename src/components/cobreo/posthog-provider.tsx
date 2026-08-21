"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { getAdminSlug } from "@/lib/admin-path";
import { getCookieConsent, type CookieConsentState } from "@/components/cobreo/cookie-consent-banner";
import {
    capturePageview,
    initPostHog,
    isPostHogConfigured,
    optInAnalytics,
    optOutAnalytics,
} from "@/lib/analytics/posthog";

function applyConsent(consent: CookieConsentState | null) {
    if (!isPostHogConfigured()) return;
    initPostHog();
    if (consent?.analytics) {
        optInAnalytics();
    } else {
        optOutAnalytics();
    }
}

export function PostHogProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const locale = useLocale();
    const lastPageviewKey = useRef<string | null>(null);
    const adminSlug = getAdminSlug();
    const isAdmin = Boolean(pathname?.includes(adminSlug));

    useEffect(() => {
        if (isAdmin || !isPostHogConfigured()) return;

        applyConsent(getCookieConsent());

        const onConsent = (event: Event) => {
            const detail = (event as CustomEvent<CookieConsentState>).detail;
            applyConsent(detail ?? null);
        };

        window.addEventListener("cobreo:cookie-consent", onConsent);
        return () => window.removeEventListener("cobreo:cookie-consent", onConsent);
    }, [isAdmin]);

    useEffect(() => {
        if (isAdmin || !isPostHogConfigured()) return;
        const consent = getCookieConsent();
        if (!consent?.analytics) return;

        const key = `${locale}:${pathname ?? ""}`;
        if (lastPageviewKey.current === key) return;
        lastPageviewKey.current = key;
        capturePageview(pathname || "/", locale);
    }, [pathname, locale, isAdmin]);

    return <>{children}</>;
}
