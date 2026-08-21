"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { getAdminSlug } from "@/lib/admin-path";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { cx } from "@/utils/cx";

import { AnalyticsEvents } from "@/lib/analytics/events";
import { optInAnalytics, optOutAnalytics, trackEvent } from "@/lib/analytics/posthog";

const STORAGE_KEY = "cobreo_cookie_consent_v1";

export type CookieConsentState = {
    necessary: true;
    analytics: boolean;
    marketing: boolean;
    decidedAt: string;
};

function readConsent(): CookieConsentState | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as CookieConsentState;
        if (parsed?.necessary !== true || typeof parsed.analytics !== "boolean") return null;
        return parsed;
    } catch {
        return null;
    }
}

function writeConsent(next: CookieConsentState) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    if (next.analytics) {
        optInAnalytics();
    } else {
        optOutAnalytics();
    }
    trackEvent(AnalyticsEvents.cookieConsentUpdated, {
        analytics: next.analytics,
        marketing: next.marketing,
    });
    window.dispatchEvent(new CustomEvent("cobreo:cookie-consent", { detail: next }));
}

export function getCookieConsent(): CookieConsentState | null {
    return readConsent();
}

export function CookieConsentBanner() {
    const t = useTranslations("cookiesBanner");
    const pathname = usePathname();
    const [visible, setVisible] = useState(false);
    const [manageOpen, setManageOpen] = useState(false);
    const [analytics, setAnalytics] = useState(false);
    const [marketing, setMarketing] = useState(false);

    useEffect(() => {
        if (pathname?.includes(getAdminSlug())) {
            setVisible(false);
            return;
        }
        const existing = readConsent();
        if (!existing) {
            setVisible(true);
            return;
        }
        setAnalytics(existing.analytics);
        setMarketing(existing.marketing);
        setVisible(false);
    }, [pathname]);

    if (!visible) return null;

    const save = (next: Omit<CookieConsentState, "necessary" | "decidedAt">) => {
        const payload: CookieConsentState = {
            necessary: true,
            analytics: next.analytics,
            marketing: next.marketing,
            decidedAt: new Date().toISOString(),
        };
        writeConsent(payload);
        setVisible(false);
    };

    return (
        <div
            role="region"
            aria-labelledby="cookie-consent-title"
            aria-describedby="cookie-consent-desc"
            className="fixed inset-x-0 bottom-0 z-[80] p-4 md:p-6"
        >
            <div className="mx-auto max-w-container rounded-2xl border border-[#171717]/10 bg-[#efedea] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] md:p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
                    <div className="max-w-3xl">
                        <h2 id="cookie-consent-title" className="text-[18px] font-semibold text-[#171717]">
                            {t("title")}
                        </h2>
                        <p id="cookie-consent-desc" className="mt-2 text-[15px] leading-6 text-[#525252]">
                            {t("body")}{" "}
                            <Link
                                href="/cookies"
                                className="font-semibold text-[#4d6b97] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]"
                            >
                                {t("policyLink")}
                            </Link>
                        </p>

                        {manageOpen ? (
                            <div className="mt-4 space-y-3 rounded-xl bg-white/70 p-4 ring-1 ring-[#171717]/8">
                                <label className="flex cursor-not-allowed items-start gap-3 opacity-80">
                                    <input type="checkbox" checked disabled className="mt-1" />
                                    <span>
                                        <span className="block text-sm font-semibold text-[#171717]">{t("necessaryTitle")}</span>
                                        <span className="block text-sm text-[#525252]">{t("necessaryBody")}</span>
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={analytics}
                                        onChange={(e) => setAnalytics(e.target.checked)}
                                        className="mt-1"
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-[#171717]">{t("analyticsTitle")}</span>
                                        <span className="block text-sm text-[#525252]">{t("analyticsBody")}</span>
                                    </span>
                                </label>
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={marketing}
                                        onChange={(e) => setMarketing(e.target.checked)}
                                        className="mt-1"
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-[#171717]">{t("marketingTitle")}</span>
                                        <span className="block text-sm text-[#525252]">{t("marketingBody")}</span>
                                    </span>
                                </label>
                            </div>
                        ) : null}
                    </div>

                    <div className={cx("flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row")}>
                        <CobreoButton
                            variant="secondary"
                            size="md"
                            onClick={() => save({ analytics: false, marketing: false })}
                        >
                            {t("reject")}
                        </CobreoButton>
                        <CobreoButton
                            variant="ghost"
                            size="md"
                            onClick={() => (manageOpen ? save({ analytics, marketing }) : setManageOpen(true))}
                            className="!border-[#d4d4d4] !bg-white"
                        >
                            {manageOpen ? t("save") : t("manage")}
                        </CobreoButton>
                        <CobreoButton variant="primary" size="md" onClick={() => save({ analytics: true, marketing: true })}>
                            {t("accept")}
                        </CobreoButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
