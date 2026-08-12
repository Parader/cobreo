"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Button } from "@/components/base/buttons/button";
import { createClient } from "@/lib/supabase/client";
import { getAdminSlug } from "@/lib/admin-path";

type LeadRow = {
    id: string;
    title: string | null;
    source: string;
    status: string;
    created_at: string;
    contacts: { full_name: string | null; email: string; company_name: string | null } | { full_name: string | null; email: string; company_name: string | null }[] | null;
};

export function AdminDashboard({
    leads,
    labels,
}: {
    leads: LeadRow[];
    labels: { leads: string; empty: string; logout: string };
}) {
    const router = useRouter();
    const locale = useLocale();

    async function logout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.replace(`/${locale}/${getAdminSlug()}/login`);
        router.refresh();
    }

    function contactInfo(lead: LeadRow) {
        const c = Array.isArray(lead.contacts) ? lead.contacts[0] : lead.contacts;
        return c;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-display-xs font-semibold text-primary">{labels.leads}</h1>
                <Button color="secondary" size="md" onClick={logout}>
                    {labels.logout}
                </Button>
            </div>

            {leads.length === 0 ? (
                <p className="text-tertiary">{labels.empty}</p>
            ) : (
                <div className="overflow-hidden rounded-xl bg-primary shadow-sm ring-1 ring-secondary">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-secondary text-tertiary">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Title</th>
                                <th className="px-4 py-3 font-semibold">Contact</th>
                                <th className="px-4 py-3 font-semibold">Source</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => {
                                const c = contactInfo(lead);
                                return (
                                    <tr key={lead.id} className="border-t border-secondary">
                                        <td className="px-4 py-3 text-primary">{lead.title}</td>
                                        <td className="px-4 py-3 text-secondary">
                                            <div>{c?.full_name || c?.company_name}</div>
                                            <div className="text-tertiary">{c?.email}</div>
                                        </td>
                                        <td className="px-4 py-3">{lead.source}</td>
                                        <td className="px-4 py-3">{lead.status}</td>
                                        <td className="px-4 py-3 text-tertiary">{new Date(lead.created_at).toLocaleDateString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
