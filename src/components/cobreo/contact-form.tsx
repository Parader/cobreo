"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { TextArea } from "@/components/base/textarea/textarea";
import { submitContact } from "@/app/actions/forms";

export function ContactForm() {
    const t = useTranslations("contact");
    const locale = useLocale();
    const [pending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        formData.set("locale", locale);
        startTransition(async () => {
            const result = await submitContact(formData);
            setStatus(result.ok ? "ok" : "error");
        });
    }

    if (status === "ok") {
        return <p className="rounded-xl bg-success-primary p-6 text-md text-primary">{t("success")}</p>;
    }

    return (
        <form onSubmit={onSubmit} className="flex max-w-xl flex-col gap-5">
            <Input isRequired name="name" label={t("name")} />
            <Input isRequired name="email" type="email" label={t("email")} />
            <Input name="company" label={t("company")} />
            <Input name="phone" type="tel" label={t("phone")} />
            <TextArea isRequired name="message" label={t("message")} rows={5} />
            {/* honeypot */}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
            {status === "error" ? <p className="text-sm text-error-primary">{t("error")}</p> : null}
            <Button type="submit" color="primary" size="lg" isDisabled={pending} isLoading={pending}>
                {t("submit")}
            </Button>
        </form>
    );
}
