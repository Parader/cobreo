"use client";

import { useLocale, useTranslations } from "next-intl";
import type {
    CrmFunnelStats,
    OrphanContact,
    PostHogFunnelStats,
} from "@/lib/admin/analytics";

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
    return (
        <div className="rounded-2xl bg-white p-5 ring-1 ring-[#171717]/10">
            <p className="text-xs font-semibold tracking-[0.12em] text-[#737373] uppercase">{label}</p>
            <p className="mt-2 font-display text-[32px] leading-none text-[#171717]">{value}</p>
            {hint ? <p className="mt-2 text-sm text-[#737373]">{hint}</p> : null}
        </div>
    );
}

export function AdminAnalytics({
    crm,
    posthog,
    orphanContacts,
}: {
    crm: CrmFunnelStats;
    posthog: PostHogFunnelStats;
    orphanContacts: OrphanContact[];
}) {
    const t = useTranslations("admin");
    const locale = useLocale();
    const dropOff =
        posthog.available && posthog.completed > 0
            ? Math.max(0, posthog.completed - posthog.diagnosticLeads)
            : null;

    return (
        <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h2 className="font-display text-[28px] text-[#171717]">{t("analyticsTitle")}</h2>
                        <p className="mt-1 max-w-2xl text-sm text-[#737373]">{t("analyticsIntro")}</p>
                    </div>
                    <a
                        href={posthog.posthogUrl}
                        target="_blank"
                        rel="noopener"
                        className="text-sm font-semibold text-[#4d6b97] hover:underline"
                    >
                        {t("analyticsOpenPosthog")}
                    </a>
                </div>

                {!posthog.available ? (
                    <p className="rounded-xl bg-[#ebe7e1] px-4 py-3 text-sm text-[#525252]">
                        {posthog.reason === "missing_key"
                            ? t("analyticsMissingKey")
                            : t("analyticsQueryFailed")}
                    </p>
                ) : null}

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Stat
                        label={t("analyticsVisitors")}
                        value={posthog.available ? posthog.pageviewUsers : "—"}
                        hint={t("analyticsLastDays", { days: posthog.windowDays })}
                    />
                    <Stat
                        label={t("analyticsStarted")}
                        value={posthog.available ? posthog.started : "—"}
                        hint={t("analyticsLastDays", { days: posthog.windowDays })}
                    />
                    <Stat
                        label={t("analyticsCompleted")}
                        value={posthog.available ? posthog.completed : "—"}
                        hint={
                            dropOff != null
                                ? t("analyticsCompletedNoLead", { count: dropOff })
                                : t("analyticsLastDays", { days: posthog.windowDays })
                        }
                    />
                    <Stat
                        label={t("analyticsLeadsTracked")}
                        value={
                            posthog.available
                                ? posthog.diagnosticLeads + posthog.contactLeads
                                : "—"
                        }
                        hint={t("analyticsLeadSplit", {
                            diagnostic: posthog.diagnosticLeads,
                            contact: posthog.contactLeads,
                        })}
                    />
                </div>
            </section>

            <section className="flex flex-col gap-4">
                <h2 className="font-display text-[24px] text-[#171717]">{t("analyticsCrmTitle")}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Stat label={t("analyticsCrmContacts")} value={crm.contacts} />
                    <Stat label={t("analyticsCrmLeads")} value={crm.leads} />
                    <Stat
                        label={t("analyticsCrmOrphans")}
                        value={crm.contactsWithoutLead}
                        hint={t("analyticsCrmOrphansHint")}
                    />
                    <Stat
                        label={t("analyticsCrmNoBooking")}
                        value={crm.leadsWithoutBooking}
                        hint={t("analyticsCrmNoBookingHint")}
                    />
                    <Stat label={t("analyticsCrmDiagnostic")} value={crm.diagnosticLeads} />
                    <Stat label={t("analyticsCrmContactForm")} value={crm.contactFormLeads} />
                    <Stat label={t("analyticsCrmBookings")} value={crm.bookingsConfirmed} />
                    <Stat label={t("analyticsCrmContactSubs")} value={crm.contactSubmissions} />
                </div>
            </section>

            {orphanContacts.length > 0 ? (
                <section className="flex flex-col gap-3">
                    <h2 className="font-display text-[24px] text-[#171717]">{t("analyticsOrphanListTitle")}</h2>
                    <p className="text-sm text-[#737373]">{t("analyticsOrphanListHint")}</p>
                    <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-[#171717]/10">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b border-[#171717]/10 text-xs uppercase tracking-[0.12em] text-[#737373]">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">{t("analyticsColName")}</th>
                                    <th className="px-4 py-3 font-semibold">{t("phone")}</th>
                                    <th className="px-4 py-3 font-semibold">{t("company")}</th>
                                    <th className="px-4 py-3 font-semibold">{t("analyticsColDate")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orphanContacts.map((c) => (
                                    <tr key={c.id} className="border-b border-[#171717]/06 last:border-0">
                                        <td className="px-4 py-3 text-[#171717]">
                                            <div className="font-medium">{c.full_name || "—"}</div>
                                            <div className="text-[#737373]">{c.email || "—"}</div>
                                        </td>
                                        <td className="px-4 py-3 text-[#525252]">{c.phone || "—"}</td>
                                        <td className="px-4 py-3 text-[#525252]">{c.company_name || "—"}</td>
                                        <td className="px-4 py-3 text-[#525252]">
                                            {new Date(c.created_at).toLocaleString(locale)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}
        </div>
    );
}
