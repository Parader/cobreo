"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { createClient } from "@/lib/supabase/client";
import { getAdminSlug } from "@/lib/admin-path";

export function AdminLoginForm() {
    const t = useTranslations("admin");
    const locale = useLocale();
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState(false);

    function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const email = String(form.get("email") || "");
        const password = String(form.get("password") || "");

        startTransition(async () => {
            const supabase = createClient();
            const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
            if (authError) {
                setError(true);
                return;
            }
            router.replace(`/${locale}/${getAdminSlug()}`);
            router.refresh();
        });
    }

    return (
        <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-primary p-8 shadow-lg">
            <h1 className="text-xl font-semibold text-primary">{t("loginTitle")}</h1>
            <Input isRequired name="email" type="email" label={t("email")} autoComplete="username" />
            <Input isRequired name="password" type="password" label={t("password")} autoComplete="current-password" />
            {error ? <p className="text-sm text-error-primary">Auth failed</p> : null}
            <Button type="submit" color="primary" size="lg" isDisabled={pending} isLoading={pending}>
                {t("submit")}
            </Button>
        </form>
    );
}
