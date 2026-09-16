"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/base/buttons/button";
import { updateLeadDetails } from "@/app/actions/crm";

export function AdminEditLead({
    leadId,
    contactId,
    initial,
    onDone,
}: {
    leadId: string;
    contactId: string;
    initial: {
        title: string;
        notes: string;
        companyName: string;
        personName: string;
        phone: string;
        email: string;
    };
    onDone: () => void;
}) {
    const t = useTranslations("admin");
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [companyName, setCompanyName] = useState(initial.companyName);
    const [personName, setPersonName] = useState(initial.personName);
    const [phone, setPhone] = useState(initial.phone);
    const [email, setEmail] = useState(initial.email);
    const [title, setTitle] = useState(initial.title);
    const [notes, setNotes] = useState(initial.notes);

    useEffect(() => {
        setCompanyName(initial.companyName);
        setPersonName(initial.personName);
        setPhone(initial.phone);
        setEmail(initial.email);
        setTitle(initial.title);
        setNotes(initial.notes);
        setError(null);
    }, [initial]);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            const result = await updateLeadDetails({
                leadId,
                contactId,
                companyName,
                personName,
                phone,
                email,
                title,
                notes,
            });
            if (!result.ok) {
                setError(
                    result.error === "need_contact"
                        ? t("crmNeedContact")
                        : result.error === "invalid"
                          ? t("crmInvalid")
                          : t("actionError"),
                );
                return;
            }
            onDone();
            router.refresh();
        });
    }

    return (
        <form
            onSubmit={onSubmit}
            className="mb-5 rounded-xl bg-primary p-4 ring-1 ring-secondary"
        >
            <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-primary">{t("crmEditLeadTitle")}</h3>
                <Button type="button" color="tertiary" size="sm" onClick={onDone}>
                    {t("crmCancel")}
                </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-secondary">{t("crmCompany")} *</span>
                    <input
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-secondary">{t("crmPerson")} *</span>
                    <input
                        required
                        value={personName}
                        onChange={(e) => setPersonName(e.target.value)}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-secondary">{t("crmPhone")}</span>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-secondary">{t("crmEmail")}</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm md:col-span-2">
                    <span className="font-medium text-secondary">{t("crmTitle")}</span>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm md:col-span-2">
                    <span className="font-medium text-secondary">{t("crmNotes")}</span>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
            </div>

            {error ? <p className="mt-3 text-sm text-error-primary">{error}</p> : null}

            <div className="mt-4 flex justify-end">
                <Button type="submit" color="primary" size="sm" isDisabled={pending} isLoading={pending}>
                    {t("crmSaveEdits")}
                </Button>
            </div>
        </form>
    );
}
