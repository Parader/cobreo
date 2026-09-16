"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/base/buttons/button";
import { createManualLead } from "@/app/actions/crm";

export function AdminCreateLead({ onCreated }: { onCreated?: (leadId: string) => void }) {
    const t = useTranslations("admin");
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [companyName, setCompanyName] = useState("");
    const [personName, setPersonName] = useState("");
    const [role, setRole] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [nextStep, setNextStep] = useState("");
    const [nextStepDue, setNextStepDue] = useState("");

    function reset() {
        setCompanyName("");
        setPersonName("");
        setRole("");
        setPhone("");
        setEmail("");
        setTitle("");
        setNotes("");
        setNextStep("");
        setNextStepDue("");
        setError(null);
    }

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
            const result = await createManualLead({
                companyName,
                personName,
                role,
                phone,
                email,
                title,
                notes,
                nextStep,
                nextStepDue,
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
            reset();
            setOpen(false);
            onCreated?.(result.leadId);
            router.refresh();
        });
    }

    if (!open) {
        return (
            <Button color="primary" size="sm" onClick={() => setOpen(true)}>
                {t("crmAddLead")}
            </Button>
        );
    }

    return (
        <form
            onSubmit={onSubmit}
            className="rounded-xl bg-primary p-4 shadow-sm ring-1 ring-secondary md:p-5"
        >
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-md font-semibold text-primary">{t("crmAddLeadTitle")}</h2>
                    <p className="mt-1 text-sm text-tertiary">{t("crmAddLeadHint")}</p>
                </div>
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
                    <span className="font-medium text-secondary">{t("crmRole")}</span>
                    <input
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder={t("crmRolePlaceholder")}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-secondary">{t("crmTitle")}</span>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t("crmTitlePlaceholder")}
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
                    <span className="font-medium text-secondary">{t("crmNotes")}</span>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-secondary">{t("crmNextStep")}</span>
                    <input
                        value={nextStep}
                        onChange={(e) => setNextStep(e.target.value)}
                        placeholder={t("crmNextStepPlaceholder")}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-secondary">{t("crmDueDate")}</span>
                    <input
                        type="date"
                        value={nextStepDue}
                        onChange={(e) => setNextStepDue(e.target.value)}
                        className="rounded-lg bg-primary px-3 py-2 text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                </label>
            </div>

            {error ? <p className="mt-3 text-sm text-error-primary">{error}</p> : null}

            <div className="mt-4 flex justify-end gap-2">
                <Button type="submit" color="primary" size="sm" isDisabled={pending} isLoading={pending}>
                    {t("crmSaveLead")}
                </Button>
            </div>
        </form>
    );
}
