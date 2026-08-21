"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/base/buttons/button";
import { NativeSelect } from "@/components/base/select/select-native";
import { createClient } from "@/lib/supabase/client";
import { deleteLead, updateLeadStatus } from "@/app/actions/admin";
import { getAdminSlug } from "@/lib/admin-path";
import {
    AdminBookingSettings,
    type AdminBookingRule,
    type AdminUpcomingBooking,
} from "@/components/cobreo/admin-booking-settings";
import {
    formatDiagnosticQa,
    formatDurationMs,
    formatOpportunities,
    formatResultKind,
    formatZones,
    getAnswerLanguage,
    getSessionStats,
    getSpecVersionLabel,
    parseDiagnosticPayload,
} from "@/lib/diagnostic/format-admin-answers";
import { cx } from "@/utils/cx";

type Contact = {
    full_name: string | null;
    email: string | null;
    company_name: string | null;
    phone: string | null;
};

type DiagnosticSubmission = {
    id: string;
    summary: string | null;
    answers: unknown;
    locale: string | null;
    created_at: string;
};

type BookingRow = {
    id: string;
    starts_at: string;
    ends_at: string;
    timezone: string;
    status: string;
    declared_ambitions: string[] | null;
    selected_sections: Array<{ areaId?: string; title?: string }> | null;
    suggested_services: Array<{ id?: string; label?: string }> | null;
};

type LeadRow = {
    id: string;
    title: string | null;
    source: string;
    status: string;
    created_at: string;
    contacts: Contact | Contact[] | null;
    diagnostic_submissions?: DiagnosticSubmission[] | null;
    bookings?: BookingRow[] | BookingRow | null;
};

const STATUSES = ["new", "in_progress", "won", "archived"] as const;

function LeadDate({ iso }: { iso: string }) {
    const locale = useLocale();
    const [text, setText] = useState(() => iso.slice(0, 10));

    useEffect(() => {
        setText(new Date(iso).toLocaleString(locale));
    }, [iso, locale]);

    return <time dateTime={iso}>{text}</time>;
}

export function AdminDashboard({
    leads,
    bookingRule,
    upcomingBookings,
}: {
    leads: LeadRow[];
    bookingRule: AdminBookingRule | null;
    upcomingBookings: AdminUpcomingBooking[];
}) {
    const t = useTranslations("admin");
    const td = useTranslations("diagnostic");
    const router = useRouter();
    const locale = useLocale();
    const [tab, setTab] = useState<"leads" | "booking">("leads");
    const [openId, setOpenId] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const [actionError, setActionError] = useState<string | null>(null);

    async function logout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace(`/${locale}/${getAdminSlug()}/login`);
        router.refresh();
    }

    function contactInfo(lead: LeadRow) {
        return Array.isArray(lead.contacts) ? lead.contacts[0] : lead.contacts;
    }

    function diagnosticInfo(lead: LeadRow) {
        const rows = lead.diagnostic_submissions;
        if (!rows) return null;
        const list = Array.isArray(rows) ? rows : [rows];
        if (!list.length) return null;
        return [...list].sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null;
    }

    function bookingInfo(lead: LeadRow) {
        const rows = lead.bookings;
        if (!rows) return null;
        const list = Array.isArray(rows) ? rows : [rows];
        if (!list.length) return null;
        return [...list].sort((a, b) => b.starts_at.localeCompare(a.starts_at))[0] ?? null;
    }

    function onStatusChange(leadId: string, status: string) {
        setActionError(null);
        startTransition(async () => {
            const result = await updateLeadStatus(leadId, status);
            if (!result.ok) setActionError(t("actionError"));
            else router.refresh();
        });
    }

    function onDelete(leadId: string, title: string | null) {
        const ok = window.confirm(t("deleteConfirm", { title: title || leadId }));
        if (!ok) return;
        setActionError(null);
        startTransition(async () => {
            const result = await deleteLead(leadId);
            if (!result.ok) setActionError(t("actionError"));
            else {
                if (openId === leadId) setOpenId(null);
                router.refresh();
            }
        });
    }

    function answerLabel(answerType: string, value: string) {
        try {
            return td(`answers.${answerType}.${value}`);
        } catch {
            return value;
        }
    }

    function questionLabel(questionId: string) {
        try {
            return td(`questions.${questionId}`);
        } catch {
            return questionId;
        }
    }

    function stageLabel(stage: string) {
        try {
            return td(`stages.${stage}`);
        } catch {
            return stage;
        }
    }

    function bandLabel(band: string) {
        try {
            return td(`bands.${band}`);
        } catch {
            return band;
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-display-xs font-semibold text-primary">
                        {tab === "booking" ? t("bookingTitle") : t("leads")}
                    </h1>
                    <div className="mt-3 flex gap-2">
                        <Button
                            color={tab === "leads" ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => setTab("leads")}
                        >
                            {t("leads")}
                        </Button>
                        <Button
                            color={tab === "booking" ? "primary" : "secondary"}
                            size="sm"
                            onClick={() => setTab("booking")}
                        >
                            {t("bookingTab")}
                        </Button>
                    </div>
                </div>
                <Button color="secondary" size="md" onClick={logout}>
                    {t("logout")}
                </Button>
            </div>

            {tab === "booking" ? (
                <AdminBookingSettings
                    rule={bookingRule}
                    upcoming={upcomingBookings}
                />
            ) : (
                <>
            {actionError ? <p className="text-sm text-error-primary">{actionError}</p> : null}

            {leads.length === 0 ? (
                <p className="text-tertiary">{t("empty")}</p>
            ) : (
                <div className="overflow-hidden rounded-xl bg-primary shadow-sm ring-1 ring-secondary">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary text-tertiary">
                            <tr>
                                <th className="px-4 py-3 font-semibold">{t("colTitle")}</th>
                                <th className="px-4 py-3 font-semibold">{t("colContact")}</th>
                                <th className="px-4 py-3 font-semibold">{t("colSource")}</th>
                                <th className="px-4 py-3 font-semibold">{t("colLanguage")}</th>
                                <th className="px-4 py-3 font-semibold">{t("colStatus")}</th>
                                <th className="px-4 py-3 font-semibold">{t("colDate")}</th>
                                <th className="px-4 py-3 font-semibold">{t("colActions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => {
                                const c = contactInfo(lead);
                                const diag = diagnosticInfo(lead);
                                const booking = bookingInfo(lead);
                                const open = openId === lead.id;
                                const isDiagnostic =
                                    lead.source === "diagnostic" || lead.source === "diagnostic_booking";
                                const payload = diag ? parseDiagnosticPayload(diag.answers) : null;
                                const qa = payload ? formatDiagnosticQa(payload) : [];
                                const zones = formatZones(payload);
                                const opportunities = formatOpportunities(payload);
                                const resultKind = formatResultKind(payload);
                                const answerLanguage = diag
                                    ? getAnswerLanguage(diag.answers, diag.locale)
                                    : null;
                                const specVersion = getSpecVersionLabel(payload);
                                const session = diag ? getSessionStats(diag.answers) : null;

                                return (
                                    <Fragment key={lead.id}>
                                        <tr className="border-t border-secondary hover:bg-secondary/30">
                                            <td className="px-4 py-3 text-primary">
                                                <button
                                                    type="button"
                                                    className="text-left font-medium hover:underline"
                                                    onClick={() => setOpenId(open ? null : lead.id)}
                                                >
                                                    {lead.title || "—"}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-secondary">
                                                <div>{c?.full_name || c?.company_name || "—"}</div>
                                                {c?.phone ? <div className="text-tertiary">{c.phone}</div> : null}
                                                {c?.email ? <div className="text-tertiary">{c.email}</div> : null}
                                            </td>
                                            <td className="px-4 py-3">
                                                {lead.source === "diagnostic" || lead.source === "diagnostic_booking"
                                                    ? lead.source === "diagnostic_booking"
                                                        ? "Diagnostic + RDV"
                                                        : t("sources.diagnostic")
                                                    : lead.source === "contact_form"
                                                      ? t("sources.contact_form")
                                                      : t("sources.manual")}
                                            </td>
                                            <td className="px-4 py-3 text-secondary">
                                                {isDiagnostic && answerLanguage ? (
                                                    <span className="inline-flex rounded-md bg-secondary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary ring-1 ring-secondary">
                                                        {answerLanguage}
                                                    </span>
                                                ) : (
                                                    "—"
                                                )}
                                            </td>
                                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                <NativeSelect
                                                    aria-label={t("colStatus")}
                                                    size="sm"
                                                    value={lead.status}
                                                    disabled={pending}
                                                    onChange={(e) => onStatusChange(lead.id, e.target.value)}
                                                    options={STATUSES.map((s) => ({
                                                        label: t(`statuses.${s}`),
                                                        value: s,
                                                    }))}
                                                    className="min-w-[9rem]"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-tertiary">
                                                <LeadDate iso={lead.created_at} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Button
                                                        color="secondary"
                                                        size="sm"
                                                        onClick={() => setOpenId(open ? null : lead.id)}
                                                    >
                                                        {open ? t("hideDetail") : t("viewDetail")}
                                                    </Button>
                                                    <Button
                                                        color="primary-destructive"
                                                        size="sm"
                                                        isDisabled={pending}
                                                        onClick={() => onDelete(lead.id, lead.title)}
                                                    >
                                                        {t("delete")}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>

                                        {open ? (
                                            <tr className="border-t border-secondary bg-secondary/25">
                                                <td colSpan={7} className="px-4 py-5">
                                                    {isDiagnostic && diag ? (
                                                        <div className="flex max-w-4xl flex-col gap-6">
                                                            {booking ? (
                                                                <section className="rounded-xl bg-primary p-4 ring-1 ring-secondary">
                                                                    <h3 className="text-sm font-semibold text-primary">
                                                                        Appel découverte
                                                                    </h3>
                                                                    <p className="mt-2 text-sm text-secondary">
                                                                        <LeadDate iso={booking.starts_at} />
                                                                        {" · "}
                                                                        {booking.timezone}
                                                                        {" · "}
                                                                        {booking.status}
                                                                    </p>
                                                                    {booking.declared_ambitions?.length ? (
                                                                        <p className="mt-2 text-sm text-secondary">
                                                                            Ambitions : {booking.declared_ambitions.join(", ")}
                                                                        </p>
                                                                    ) : null}
                                                                    {booking.selected_sections?.length ? (
                                                                        <p className="mt-1 text-sm text-secondary">
                                                                            Sections :{" "}
                                                                            {booking.selected_sections
                                                                                .map((s) => s.title)
                                                                                .filter(Boolean)
                                                                                .join(", ")}
                                                                        </p>
                                                                    ) : null}
                                                                    {booking.suggested_services?.length ? (
                                                                        <p className="mt-1 text-sm text-secondary">
                                                                            Services suggérés :{" "}
                                                                            {booking.suggested_services
                                                                                .map((s) => s.label)
                                                                                .filter(Boolean)
                                                                                .join(", ")}
                                                                        </p>
                                                                    ) : null}
                                                                </section>
                                                            ) : null}
                                                            <div className="grid gap-3 sm:grid-cols-2">
                                                                <p>
                                                                    <span className="font-semibold text-primary">{t("phone")}: </span>
                                                                    <span className="text-secondary">{c?.phone || "—"}</span>
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold text-primary">{t("company")}: </span>
                                                                    <span className="text-secondary">{c?.company_name || "—"}</span>
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold text-primary">{t("language")}: </span>
                                                                    <span className="text-secondary uppercase">
                                                                        {answerLanguage || diag.locale || "—"}
                                                                    </span>
                                                                </p>
                                                                <p>
                                                                    <span className="font-semibold text-primary">{t("diagnosticVersion")}: </span>
                                                                    <span className="text-secondary">{specVersion || "—"}</span>
                                                                </p>
                                                                <p className="sm:col-span-2">
                                                                    <span className="font-semibold text-primary">{t("summary")}: </span>
                                                                    <span className="text-secondary">{diag.summary || t("noDetail")}</span>
                                                                </p>
                                                            </div>

                                                            {session ? (
                                                                <section>
                                                                    <h3 className="mb-2 text-sm font-semibold text-primary">
                                                                        {t("sessionTitle")}
                                                                    </h3>
                                                                    <dl className="grid gap-2 rounded-xl bg-primary p-4 text-sm ring-1 ring-secondary sm:grid-cols-2">
                                                                        <div>
                                                                            <dt className="text-tertiary">{t("sessionDuration")}</dt>
                                                                            <dd className="font-medium text-primary">
                                                                                {formatDurationMs(session.duration_ms, locale)}
                                                                            </dd>
                                                                        </div>
                                                                        <div>
                                                                            <dt className="text-tertiary">{t("sessionSteps")}</dt>
                                                                            <dd className="font-medium text-primary">
                                                                                {session.steps_completed}
                                                                                {session.total_steps
                                                                                    ? ` / ${session.total_steps}`
                                                                                    : ""}
                                                                            </dd>
                                                                        </div>
                                                                        <div>
                                                                            <dt className="text-tertiary">{t("sessionResume")}</dt>
                                                                            <dd className="font-medium text-primary">
                                                                                {session.was_resume ? t("yes") : t("no")}
                                                                            </dd>
                                                                        </div>
                                                                        <div>
                                                                            <dt className="text-tertiary">{t("sessionCompletedAt")}</dt>
                                                                            <dd className="font-medium text-primary">
                                                                                <LeadDate iso={session.completed_at} />
                                                                            </dd>
                                                                        </div>
                                                                    </dl>
                                                                </section>
                                                            ) : null}

                                                            {resultKind ? (
                                                                <p>
                                                                    <span className="font-semibold text-primary">{t("resultKind")}: </span>
                                                                    <span className="text-secondary">
                                                                        {resultKind === "healthy"
                                                                            ? t("resultKindHealthy")
                                                                            : resultKind === "early_stage"
                                                                              ? t("resultKindEarly")
                                                                              : t("resultKindOpportunities")}
                                                                    </span>
                                                                </p>
                                                            ) : null}

                                                            {opportunities.length > 0 ? (
                                                                <section>
                                                                    <h3 className="mb-2 text-sm font-semibold text-primary">{t("opportunitiesTitle")}</h3>
                                                                    <ul className="flex flex-col gap-3">
                                                                        {opportunities.map((op) => (
                                                                            <li
                                                                                key={op.id}
                                                                                className="rounded-xl bg-primary p-4 ring-1 ring-secondary"
                                                                            >
                                                                                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-secondary">
                                                                                    {t(`opportunityLevel.${op.level}`)} · {t(`opportunityGain.${op.potentialGain}`)}
                                                                                </p>
                                                                                <p className="mt-1 font-medium text-primary">{op.label}</p>
                                                                                {op.why ? (
                                                                                    <p className="mt-2 text-secondary">{op.why}</p>
                                                                                ) : null}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </section>
                                                            ) : null}

                                                            {zones.length > 0 ? (
                                                                <section>
                                                                    <h3 className="mb-2 text-sm font-semibold text-primary">{t("bands")}</h3>
                                                                    <ul className="flex flex-wrap gap-2">
                                                                        {zones.map((z) => (
                                                                            <li
                                                                                key={z.stage}
                                                                                className={cx(
                                                                                    "rounded-full px-3 py-1 text-xs font-semibold",
                                                                                    z.band === "high" && "bg-[#4d6b97] text-white",
                                                                                    z.band === "moderate" && "bg-[#d7e0ec] text-[#253353]",
                                                                                    z.band === "some" && "bg-[#ebe7e1] text-[#525252]",
                                                                                    z.band === "low" && "bg-white text-[#737373] ring-1 ring-[#171717]/12",
                                                                                )}
                                                                            >
                                                                                {stageLabel(z.stage)} — {bandLabel(z.band)}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </section>
                                                            ) : null}

                                                            <section>
                                                                <h3 className="mb-3 text-sm font-semibold text-primary">{t("qaTitle")}</h3>
                                                                {qa.length === 0 ? (
                                                                    <p className="text-tertiary">{t("noDetail")}</p>
                                                                ) : (
                                                                    <ul className="flex flex-col gap-3">
                                                                        {qa.map((row) => (
                                                                            <li
                                                                                key={row.questionId}
                                                                                className="rounded-xl bg-primary p-4 ring-1 ring-secondary"
                                                                            >
                                                                                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-secondary">
                                                                                    {row.displayQuestion
                                                                                        ? row.stage
                                                                                        : stageLabel(String(row.stage))}
                                                                                </p>
                                                                                <p className="mt-1 font-medium text-primary">
                                                                                    {row.displayQuestion ?? questionLabel(row.questionId)}
                                                                                </p>
                                                                                <p className="mt-2 text-secondary">
                                                                                    {row.displayValues
                                                                                        ? row.displayValues.join(", ")
                                                                                        : row.values
                                                                                              .map((v) => answerLabel(row.answerType, v))
                                                                                              .join(", ")}
                                                                                </p>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                )}
                                                            </section>
                                                        </div>
                                                    ) : (
                                                        <p className="text-tertiary">{t("noDetail")}</p>
                                                    )}
                                                </td>
                                            </tr>
                                        ) : null}
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
                </>
            )}
        </div>
    );
}
