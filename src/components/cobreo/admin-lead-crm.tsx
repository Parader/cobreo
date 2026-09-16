"use client";

import { useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/base/buttons/button";
import { NativeSelect } from "@/components/base/select/select-native";
import {
    addLeadActivity,
    addLeadAppointment,
    addLeadNextStep,
    addLeadPerson,
    deleteLeadActivity,
    deleteLeadAppointment,
    deleteLeadNextStep,
    deleteLeadPerson,
    updateLeadAppointmentStatus,
    updateLeadNextStepStatus,
} from "@/app/actions/crm";

export type CrmPerson = {
    id: string;
    full_name: string;
    role: string | null;
    email: string | null;
    phone: string | null;
    is_primary: boolean;
};

export type CrmActivity = {
    id: string;
    kind: string;
    summary: string;
    details: string | null;
    occurred_at: string;
    person_id: string | null;
};

export type CrmNextStep = {
    id: string;
    title: string;
    due_at: string | null;
    status: string;
    notes: string | null;
    person_id: string | null;
};

export type CrmAppointment = {
    id: string;
    title: string;
    starts_at: string;
    ends_at: string | null;
    location_or_link: string | null;
    status: string;
    notes: string | null;
    person_id: string | null;
};

const ACTIVITY_KINDS = ["call", "meeting", "note", "email", "other"] as const;

function asList<T>(value: T[] | T | null | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

function DateText({ iso }: { iso: string }) {
    const locale = useLocale();
    return <time dateTime={iso}>{new Date(iso).toLocaleString(locale)}</time>;
}

export function AdminLeadCrm({
    leadId,
    contact,
    people: peopleProp,
    activities: activitiesProp,
    nextSteps: nextStepsProp,
    appointments: appointmentsProp,
}: {
    leadId: string;
    contact?: {
        full_name: string | null;
        email: string | null;
        phone: string | null;
        company_name: string | null;
    } | null;
    people?: CrmPerson[] | CrmPerson | null;
    activities?: CrmActivity[] | CrmActivity | null;
    nextSteps?: CrmNextStep[] | CrmNextStep | null;
    appointments?: CrmAppointment[] | CrmAppointment | null;
}) {
    const t = useTranslations("admin");
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const people = useMemo(
        () =>
            asList(peopleProp).sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.full_name.localeCompare(b.full_name)),
        [peopleProp],
    );
    const activities = useMemo(
        () => asList(activitiesProp).sort((a, b) => b.occurred_at.localeCompare(a.occurred_at)),
        [activitiesProp],
    );
    const nextSteps = useMemo(
        () =>
            asList(nextStepsProp).sort((a, b) => {
                if (a.status !== b.status) return a.status === "open" ? -1 : 1;
                return (a.due_at || "9999").localeCompare(b.due_at || "9999");
            }),
        [nextStepsProp],
    );
    const appointments = useMemo(
        () => asList(appointmentsProp).sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
        [appointmentsProp],
    );

    const personOptions = [
        { label: t("crmNoPerson"), value: "" },
        ...people.map((p) => ({
            label: p.role ? `${p.full_name} (${p.role})` : p.full_name,
            value: p.id,
        })),
    ];

    function personName(id: string | null) {
        if (!id) return null;
        return people.find((p) => p.id === id)?.full_name ?? null;
    }

    function run(action: () => Promise<{ ok: boolean }>) {
        setError(null);
        startTransition(async () => {
            const result = await action();
            if (!result.ok) setError(t("actionError"));
            else router.refresh();
        });
    }

    // People form
    const [personNameInput, setPersonNameInput] = useState("");
    const [personRole, setPersonRole] = useState("");
    const [personPhone, setPersonPhone] = useState("");
    const [personEmail, setPersonEmail] = useState("");

    // Activity form
    const [activityKind, setActivityKind] = useState<string>("call");
    const [activitySummary, setActivitySummary] = useState("");
    const [activityPersonId, setActivityPersonId] = useState("");

    // Next step form
    const [stepTitle, setStepTitle] = useState("");
    const [stepDue, setStepDue] = useState("");
    const [stepPersonId, setStepPersonId] = useState("");

    // Appointment form
    const [apptTitle, setApptTitle] = useState("");
    const [apptStarts, setApptStarts] = useState("");
    const [apptLink, setApptLink] = useState("");
    const [apptPersonId, setApptPersonId] = useState("");

    return (
        <div className="mt-5 space-y-5 border-t border-secondary pt-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-tertiary">{t("crmPanelTitle")}</h3>
            {error ? <p className="text-sm text-error-primary">{error}</p> : null}

            {/* People */}
            <section className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">{t("crmPeople")}</h4>
                {people.length === 0 ? (
                    <div className="space-y-2">
                        <p className="text-sm text-tertiary">{t("crmPeopleEmpty")}</p>
                        {contact?.full_name ? (
                            <Button
                                color="secondary"
                                size="sm"
                                isDisabled={pending}
                                onClick={() =>
                                    run(() =>
                                        addLeadPerson({
                                            leadId,
                                            fullName: contact.full_name!,
                                            email: contact.email || undefined,
                                            phone: contact.phone || undefined,
                                            isPrimary: true,
                                        }),
                                    )
                                }
                            >
                                {t("crmImportContact", { name: contact.full_name })}
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {people.map((person) => (
                            <li
                                key={person.id}
                                className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-secondary/40 px-3 py-2"
                            >
                                <div>
                                    <div className="font-medium text-primary">
                                        {person.full_name}
                                        {person.is_primary ? (
                                            <span className="ml-2 text-xs font-semibold text-brand-secondary">
                                                {t("crmPrimary")}
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="text-sm text-secondary">
                                        {[person.role, person.phone, person.email].filter(Boolean).join(" · ") || "—"}
                                    </div>
                                </div>
                                <Button
                                    color="link-destructive"
                                    size="sm"
                                    isDisabled={pending}
                                    onClick={() => run(() => deleteLeadPerson(person.id))}
                                >
                                    {t("delete")}
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="grid gap-2 md:grid-cols-5">
                    <input
                        value={personNameInput}
                        onChange={(e) => setPersonNameInput(e.target.value)}
                        placeholder={`${t("crmPerson")} *`}
                        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand md:col-span-1"
                    />
                    <input
                        value={personRole}
                        onChange={(e) => setPersonRole(e.target.value)}
                        placeholder={t("crmRole")}
                        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                    <input
                        value={personPhone}
                        onChange={(e) => setPersonPhone(e.target.value)}
                        placeholder={t("crmPhone")}
                        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                    <input
                        value={personEmail}
                        onChange={(e) => setPersonEmail(e.target.value)}
                        placeholder={t("crmEmail")}
                        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                    <Button
                        color="secondary"
                        size="sm"
                        isDisabled={pending || !personNameInput.trim()}
                        onClick={() =>
                            run(async () => {
                                const result = await addLeadPerson({
                                    leadId,
                                    fullName: personNameInput,
                                    role: personRole,
                                    phone: personPhone,
                                    email: personEmail,
                                    isPrimary: people.length === 0,
                                });
                                if (result.ok) {
                                    setPersonNameInput("");
                                    setPersonRole("");
                                    setPersonPhone("");
                                    setPersonEmail("");
                                }
                                return result;
                            })
                        }
                    >
                        {t("crmAddPerson")}
                    </Button>
                </div>
            </section>

            {/* Next steps */}
            <section className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">{t("crmWhatsNext")}</h4>
                {nextSteps.length === 0 ? (
                    <p className="text-sm text-tertiary">{t("crmNextEmpty")}</p>
                ) : (
                    <ul className="space-y-2">
                        {nextSteps.map((step) => (
                            <li
                                key={step.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary/40 px-3 py-2"
                            >
                                <div className={step.status === "done" ? "opacity-60 line-through" : undefined}>
                                    <div className="font-medium text-primary">{step.title}</div>
                                    <div className="text-sm text-tertiary">
                                        {[
                                            step.due_at ? `${t("crmDueDate")}: ${step.due_at}` : null,
                                            personName(step.person_id),
                                            t(`crmStepStatus.${step.status}` as "crmStepStatus.open"),
                                        ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {step.status === "open" ? (
                                        <Button
                                            color="secondary"
                                            size="sm"
                                            isDisabled={pending}
                                            onClick={() => run(() => updateLeadNextStepStatus(step.id, "done"))}
                                        >
                                            {t("crmMarkDone")}
                                        </Button>
                                    ) : (
                                        <Button
                                            color="tertiary"
                                            size="sm"
                                            isDisabled={pending}
                                            onClick={() => run(() => updateLeadNextStepStatus(step.id, "open"))}
                                        >
                                            {t("crmReopen")}
                                        </Button>
                                    )}
                                    <Button
                                        color="link-destructive"
                                        size="sm"
                                        isDisabled={pending}
                                        onClick={() => run(() => deleteLeadNextStep(step.id))}
                                    >
                                        {t("delete")}
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="grid gap-2 md:grid-cols-4">
                    <input
                        value={stepTitle}
                        onChange={(e) => setStepTitle(e.target.value)}
                        placeholder={`${t("crmNextStep")} *`}
                        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand md:col-span-2"
                    />
                    <input
                        type="date"
                        value={stepDue}
                        onChange={(e) => setStepDue(e.target.value)}
                        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                    <NativeSelect
                        aria-label={t("crmPerson")}
                        size="sm"
                        value={stepPersonId}
                        onChange={(e) => setStepPersonId(e.target.value)}
                        options={personOptions}
                    />
                    <Button
                        color="secondary"
                        size="sm"
                        className="md:col-span-4 md:justify-self-start"
                        isDisabled={pending || !stepTitle.trim()}
                        onClick={() =>
                            run(async () => {
                                const result = await addLeadNextStep({
                                    leadId,
                                    title: stepTitle,
                                    dueAt: stepDue,
                                    personId: stepPersonId || undefined,
                                });
                                if (result.ok) {
                                    setStepTitle("");
                                    setStepDue("");
                                    setStepPersonId("");
                                }
                                return result;
                            })
                        }
                    >
                        {t("crmAddNextStep")}
                    </Button>
                </div>
            </section>

            {/* Appointments */}
            <section className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">{t("crmAppointments")}</h4>
                {appointments.length === 0 ? (
                    <p className="text-sm text-tertiary">{t("crmAppointmentsEmpty")}</p>
                ) : (
                    <ul className="space-y-2">
                        {appointments.map((appt) => (
                            <li
                                key={appt.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary/40 px-3 py-2"
                            >
                                <div>
                                    <div className="font-medium text-primary">{appt.title}</div>
                                    <div className="text-sm text-tertiary">
                                        <DateText iso={appt.starts_at} />
                                        {appt.location_or_link ? ` · ${appt.location_or_link}` : ""}
                                        {personName(appt.person_id) ? ` · ${personName(appt.person_id)}` : ""}
                                        {` · ${t(`crmApptStatus.${appt.status}` as "crmApptStatus.planned")}`}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {appt.status === "planned" ? (
                                        <>
                                            <Button
                                                color="secondary"
                                                size="sm"
                                                isDisabled={pending}
                                                onClick={() => run(() => updateLeadAppointmentStatus(appt.id, "done"))}
                                            >
                                                {t("crmMarkDone")}
                                            </Button>
                                            <Button
                                                color="tertiary"
                                                size="sm"
                                                isDisabled={pending}
                                                onClick={() =>
                                                    run(() => updateLeadAppointmentStatus(appt.id, "cancelled"))
                                                }
                                            >
                                                {t("crmCancel")}
                                            </Button>
                                        </>
                                    ) : null}
                                    <Button
                                        color="link-destructive"
                                        size="sm"
                                        isDisabled={pending}
                                        onClick={() => run(() => deleteLeadAppointment(appt.id))}
                                    >
                                        {t("delete")}
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <div className="grid gap-2 md:grid-cols-4">
                    <input
                        value={apptTitle}
                        onChange={(e) => setApptTitle(e.target.value)}
                        placeholder={`${t("crmAppointmentTitle")} *`}
                        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                    <input
                        type="datetime-local"
                        value={apptStarts}
                        onChange={(e) => setApptStarts(e.target.value)}
                        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                    <input
                        value={apptLink}
                        onChange={(e) => setApptLink(e.target.value)}
                        placeholder={t("crmLocationOrLink")}
                        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand"
                    />
                    <NativeSelect
                        aria-label={t("crmPerson")}
                        size="sm"
                        value={apptPersonId}
                        onChange={(e) => setApptPersonId(e.target.value)}
                        options={personOptions}
                    />
                    <Button
                        color="secondary"
                        size="sm"
                        className="md:col-span-4 md:justify-self-start"
                        isDisabled={pending || !apptTitle.trim() || !apptStarts}
                        onClick={() =>
                            run(async () => {
                                const result = await addLeadAppointment({
                                    leadId,
                                    title: apptTitle,
                                    startsAt: apptStarts,
                                    locationOrLink: apptLink,
                                    personId: apptPersonId || undefined,
                                });
                                if (result.ok) {
                                    setApptTitle("");
                                    setApptStarts("");
                                    setApptLink("");
                                    setApptPersonId("");
                                }
                                return result;
                            })
                        }
                    >
                        {t("crmAddAppointment")}
                    </Button>
                </div>
            </section>

            {/* Activities / encounters */}
            <section className="space-y-2">
                <h4 className="text-sm font-semibold text-primary">{t("crmActivity")}</h4>
                <div className="grid gap-2 md:grid-cols-4">
                    <NativeSelect
                        aria-label={t("crmActivityKind")}
                        size="sm"
                        value={activityKind}
                        onChange={(e) => setActivityKind(e.target.value)}
                        options={ACTIVITY_KINDS.map((kind) => ({
                            label: t(`crmActivityKinds.${kind}`),
                            value: kind,
                        }))}
                    />
                    <input
                        value={activitySummary}
                        onChange={(e) => setActivitySummary(e.target.value)}
                        placeholder={`${t("crmActivitySummary")} *`}
                        className="rounded-lg bg-primary px-3 py-2 text-sm text-primary ring-1 ring-primary outline-none focus:ring-2 focus:ring-brand md:col-span-2"
                    />
                    <NativeSelect
                        aria-label={t("crmPerson")}
                        size="sm"
                        value={activityPersonId}
                        onChange={(e) => setActivityPersonId(e.target.value)}
                        options={personOptions}
                    />
                    <Button
                        color="secondary"
                        size="sm"
                        className="md:col-span-4 md:justify-self-start"
                        isDisabled={pending || !activitySummary.trim()}
                        onClick={() =>
                            run(async () => {
                                const result = await addLeadActivity({
                                    leadId,
                                    kind: activityKind,
                                    summary: activitySummary,
                                    personId: activityPersonId || undefined,
                                });
                                if (result.ok) {
                                    setActivitySummary("");
                                    setActivityPersonId("");
                                }
                                return result;
                            })
                        }
                    >
                        {t("crmLogActivity")}
                    </Button>
                </div>
                {activities.length === 0 ? (
                    <p className="text-sm text-tertiary">{t("crmActivityEmpty")}</p>
                ) : (
                    <ul className="max-h-72 space-y-2 overflow-y-auto">
                        {activities.map((item) => (
                            <li
                                key={item.id}
                                className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-secondary/40 px-3 py-2"
                            >
                                <div>
                                    <div className="text-xs font-semibold uppercase tracking-wide text-tertiary">
                                        {t(`crmActivityKinds.${item.kind}` as "crmActivityKinds.call")} ·{" "}
                                        <DateText iso={item.occurred_at} />
                                        {personName(item.person_id) ? ` · ${personName(item.person_id)}` : ""}
                                    </div>
                                    <div className="mt-0.5 text-sm text-primary">{item.summary}</div>
                                    {item.details ? (
                                        <div className="mt-1 text-sm text-secondary">{item.details}</div>
                                    ) : null}
                                </div>
                                <Button
                                    color="link-destructive"
                                    size="sm"
                                    isDisabled={pending}
                                    onClick={() => run(() => deleteLeadActivity(item.id))}
                                >
                                    {t("delete")}
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
