"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle } from "@untitledui/icons";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { Link } from "@/i18n/navigation";
import { submitContact } from "@/app/actions/forms";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/posthog";

function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function PrivacyConsentLabel() {
    const t = useTranslations("contact");
    const suffix = t("privacySuffix");
    const needsSpaceBeforeSuffix = Boolean(suffix) && !/^[.,;:!?]/.test(suffix);

    return (
        <span className="font-normal leading-relaxed text-[#525252]">
            {t("privacyPrefix")}{" "}
            <Link
                href="/confidentialite"
                className="font-medium text-[#4d6b97] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]"
                onClick={(event) => event.stopPropagation()}
            >
                {t("privacyLink")}
            </Link>
            {needsSpaceBeforeSuffix ? " " : null}
            {suffix}
        </span>
    );
}

export function ContactForm() {
    const t = useTranslations("contact");
    const locale = useLocale();
    const [pending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [company, setCompany] = useState("");
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [consent, setConsent] = useState(false);
    const [nameInvalid, setNameInvalid] = useState(false);
    const [emailInvalid, setEmailInvalid] = useState(false);
    const [messageInvalid, setMessageInvalid] = useState(false);
    const [consentInvalid, setConsentInvalid] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    function clearAlerts() {
        if (formError) setFormError(null);
        if (status === "error") setStatus("idle");
    }

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (pending) return;

        const nameOk = name.trim().length >= 2;
        const emailOk = isValidEmail(email);
        const messageOk = message.trim().length >= 10;

        setNameInvalid(!nameOk);
        setEmailInvalid(!emailOk);
        setMessageInvalid(!messageOk);
        setConsentInvalid(!consent);

        if (!nameOk) {
            setFormError(t("needName"));
            return;
        }
        if (!emailOk) {
            setFormError(t("needEmail"));
            return;
        }
        if (!messageOk) {
            setFormError(t("needMessage"));
            return;
        }
        if (!consent) {
            setFormError(t("needConsent"));
            return;
        }

        setFormError(null);
        const formData = new FormData(e.currentTarget);
        formData.set("name", name);
        formData.set("email", email);
        formData.set("company", company);
        formData.set("phone", phone);
        formData.set("message", message);
        formData.set("locale", locale);
        if (!formData.get("website")) {
            formData.set("website", "");
        }

        startTransition(async () => {
            const result = await submitContact(formData);
            if (result.ok) {
                trackEvent(AnalyticsEvents.contactLeadSubmitted, { locale });
                setStatus("ok");
            } else {
                setStatus("error");
                setFormError(t("error"));
            }
        });
    }

    if (status === "ok") {
        return (
            <div
                role="status"
                className="flex flex-col items-start gap-4 rounded-2xl bg-[#e8ebe0] px-6 py-8 ring-1 ring-[#b1b6a6]/60"
            >
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-[#b1b6a6]/50 text-[#171717]">
                    <CheckCircle className="size-6" aria-hidden />
                </span>
                <div>
                    <p className="font-display text-xl text-[#171717] md:text-2xl">{t("successTitle")}</p>
                    <p className="mt-2 text-base leading-relaxed text-[#404040]">{t("success")}</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-5" noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
                <Input
                    isRequired
                    name="name"
                    label={t("name")}
                    value={name}
                    autoComplete="name"
                    onChange={(v) => {
                        setName(v);
                        setNameInvalid(false);
                        clearAlerts();
                    }}
                    isInvalid={nameInvalid}
                    hint={nameInvalid ? t("needName") : undefined}
                />
                <Input
                    isRequired
                    name="email"
                    type="email"
                    label={t("email")}
                    value={email}
                    autoComplete="email"
                    onChange={(v) => {
                        setEmail(v);
                        setEmailInvalid(false);
                        clearAlerts();
                    }}
                    isInvalid={emailInvalid}
                    hint={emailInvalid ? t("needEmail") : undefined}
                />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <Input
                    name="company"
                    label={t("company")}
                    value={company}
                    autoComplete="organization"
                    onChange={(v) => {
                        setCompany(v);
                        clearAlerts();
                    }}
                />
                <Input
                    name="phone"
                    type="tel"
                    label={t("phone")}
                    value={phone}
                    autoComplete="tel"
                    onChange={(v) => {
                        setPhone(v);
                        clearAlerts();
                    }}
                />
            </div>
            <TextArea
                isRequired
                name="message"
                label={t("message")}
                rows={6}
                value={message}
                onChange={(v) => {
                    setMessage(v);
                    setMessageInvalid(false);
                    clearAlerts();
                }}
                isInvalid={messageInvalid}
                hint={messageInvalid ? t("needMessage") : undefined}
            />
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

            <div>
                <Checkbox
                    isRequired
                    name="consent"
                    isSelected={consent}
                    onChange={(selected) => {
                        setConsent(selected);
                        setConsentInvalid(false);
                        clearAlerts();
                    }}
                    isInvalid={consentInvalid}
                    label={<PrivacyConsentLabel />}
                />
                {consentInvalid ? (
                    <p role="alert" className="mt-2 text-sm font-medium text-error-primary">
                        {t("needConsent")}
                    </p>
                ) : null}
            </div>

            {formError && !nameInvalid && !emailInvalid && !messageInvalid && !consentInvalid ? (
                <p role="alert" className="text-sm font-medium text-error-primary">
                    {formError}
                </p>
            ) : null}

            <div className="pt-1">
                <CobreoButton type="submit" size="xl" className="w-full sm:w-auto" disabled={pending}>
                    {pending ? t("submitting") : t("submit")}
                </CobreoButton>
            </div>
        </form>
    );
}
