"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/base/input/input";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { getLeadCaptureSpec } from "@/content/diagnostic/v6/catalog";
import { submitDiagnostic } from "@/app/actions/forms";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/diagnostic/localize";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/posthog";

function looksLikeEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function looksLikePhone(value: string) {
    return /^[+\d\s().-]{7,40}$/.test(value) && (value.match(/\d/g)?.length ?? 0) >= 7;
}

/** Compact contact prompt — embedded under results, not a separate screen */
export function LeadCapture({
    payload,
    summary,
    healthy,
    onDone,
    titleOverride,
    bodyOverride,
    ctaOverride,
}: {
    payload: object;
    summary: string;
    /** Secondary link-only variant for healthy/early results */
    healthy?: boolean;
    onDone: () => void;
    titleOverride?: string;
    bodyOverride?: string;
    ctaOverride?: string;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const spec = getLeadCaptureSpec();
    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [contact, setContact] = useState("");
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [nameInvalid, setNameInvalid] = useState(false);
    const [contactInvalid, setContactInvalid] = useState(false);

    const nameField = spec.primary.fields.find((f) => f.id === "name") as Record<string, unknown> | undefined;
    const contactField = spec.primary.fields.find((f) => f.id === "contact") as
        | Record<string, unknown>
        | undefined;
    const companyField = spec.primary.fields.find((f) => f.id === "company") as
        | Record<string, unknown>
        | undefined;

    if (healthy) {
        return (
            <p className="text-sm text-[#525252]">
                <Link href="/contact" className="font-semibold text-[#4d6b97] hover:underline">
                    {pickLocalized(spec.healthy_result_variant as Record<string, unknown>, "label", locale)}
                </Link>
            </p>
        );
    }

    function clearFieldErrors() {
        if (error) setError(null);
    }

    function onSubmit() {
        if (pending) return;

        const nameOk = name.trim().length >= 2;
        const contactTrim = contact.trim();
        const contactOk = looksLikeEmail(contactTrim) || looksLikePhone(contactTrim);
        setNameInvalid(!nameOk);
        setContactInvalid(!contactOk);

        if (!nameOk) {
            setError(t("captureNeedName"));
            return;
        }
        if (!contactOk) {
            setError(t("captureNeedContact"));
            return;
        }

        setError(null);
        const formData = new FormData();
        formData.set("name", name);
        formData.set("company", company.trim());
        formData.set("contact", contactTrim);
        formData.set("locale", locale);
        formData.set("summary", summary);
        formData.set("answers", JSON.stringify(payload));
        formData.set("website", "");
        startTransition(async () => {
            const result = await submitDiagnostic(formData);
            if (result.ok) {
                trackEvent(AnalyticsEvents.diagnosticLeadSubmitted, {
                    locale,
                    has_opportunity: Boolean(
                        (payload as { result?: { hasCredibleOpportunity?: boolean } }).result
                            ?.hasCredibleOpportunity,
                    ),
                });
                window.scrollTo({ top: 0, behavior: "auto" });
                onDone();
            } else {
                setError(t("error"));
            }
        });
    }

    return (
        <div className="overflow-hidden rounded-3xl bg-[#253353] text-white shadow-[0_20px_48px_rgba(37,51,83,0.28)]">
            <div className="border-b border-white/10 px-6 py-7 md:px-8 md:py-8">
                <h3 className="font-display text-[26px] font-normal leading-[1.15] tracking-[-0.02em] md:text-[32px]">
                    {titleOverride ||
                        pickLocalized(spec.primary as Record<string, unknown>, "title", locale)}
                </h3>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80">
                    {bodyOverride ||
                        pickLocalized(spec.primary as Record<string, unknown>, "body", locale)}
                </p>
            </div>

            <div className="bg-[#efedea] px-6 py-6 text-[#171717] md:px-8 md:py-7">
                <div className="flex flex-col gap-4">
                    <Input
                        isRequired
                        label={pickLocalized(nameField, "label", locale) || t("captureName")}
                        value={name}
                        autoComplete="name"
                        onChange={(v) => {
                            setName(v);
                            setNameInvalid(false);
                            clearFieldErrors();
                        }}
                        isInvalid={nameInvalid}
                        hint={nameInvalid ? t("captureNeedName") : undefined}
                    />
                    <Input
                        isRequired
                        label={pickLocalized(contactField, "label", locale) || t("captureContact")}
                        value={contact}
                        autoComplete="email tel"
                        onChange={(v) => {
                            setContact(v);
                            setContactInvalid(false);
                            clearFieldErrors();
                        }}
                        isInvalid={contactInvalid}
                        hint={contactInvalid ? t("captureNeedContact") : undefined}
                    />
                    <Input
                        label={pickLocalized(companyField, "label", locale) || t("captureCompany")}
                        value={company}
                        autoComplete="organization"
                        onChange={(v) => {
                            setCompany(v);
                            clearFieldErrors();
                        }}
                    />

                    <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

                    {error && !nameInvalid && !contactInvalid ? (
                        <p role="alert" className="text-sm font-medium text-error-primary">
                            {error}
                        </p>
                    ) : null}

                    <CobreoButton size="xl" onClick={onSubmit} className="w-full">
                        {pending
                            ? t("submitting")
                            : ctaOverride ||
                              pickLocalized(spec.primary as Record<string, unknown>, "cta", locale)}
                    </CobreoButton>
                    <p className="text-center text-xs leading-relaxed text-[#737373]">
                        {pickLocalized(spec.primary as Record<string, unknown>, "privacy", locale)}
                    </p>
                </div>
            </div>
        </div>
    );
}
