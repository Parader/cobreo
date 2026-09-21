"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/base/buttons/button";
import { createClient } from "@/lib/supabase/client";

export function AdminChangePassword() {
    const t = useTranslations("admin");
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    function reset() {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setError(null);
        setSuccess(false);
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (newPassword.length < 8) {
            setError(t("passwordTooShort"));
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t("passwordMismatch"));
            return;
        }

        startTransition(async () => {
            const supabase = createClient();
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user?.email) {
                setError(t("passwordChangeFailed"));
                return;
            }

            const { error: reauthError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword,
            });
            if (reauthError) {
                setError(t("passwordCurrentInvalid"));
                return;
            }

            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) {
                setError(t("passwordChangeFailed"));
                return;
            }

            reset();
            setSuccess(true);
            setOpen(false);
        });
    }

    if (!open) {
        return (
            <div className="flex flex-col items-end gap-1">
                {success ? <p className="text-sm text-success-primary">{t("passwordChanged")}</p> : null}
                <Button color="secondary" size="md" onClick={() => setOpen(true)}>
                    {t("changePassword")}
                </Button>
            </div>
        );
    }

    return (
        <form
            onSubmit={onSubmit}
            className="w-full max-w-sm rounded-xl bg-primary p-4 shadow-sm ring-1 ring-secondary"
        >
            <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-primary">{t("changePassword")}</h2>
                <Button
                    type="button"
                    color="tertiary"
                    size="sm"
                    onClick={() => {
                        reset();
                        setOpen(false);
                    }}
                >
                    {t("crmCancel")}
                </Button>
            </div>
            <div className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-secondary">{t("passwordCurrent")}</span>
                    <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-secondary">{t("passwordNew")}</span>
                    <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-secondary">{t("passwordConfirm")}</span>
                    <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
            </div>
            {error ? <p className="mt-3 text-sm text-error-primary">{error}</p> : null}
            <div className="mt-4 flex justify-end">
                <Button type="submit" color="primary" size="sm" isDisabled={pending} isLoading={pending}>
                    {t("passwordSave")}
                </Button>
            </div>
        </form>
    );
}
