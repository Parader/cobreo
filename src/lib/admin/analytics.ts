import { createServiceClient } from "@/lib/supabase/admin";

export type CrmFunnelStats = {
    contacts: number;
    leads: number;
    contactsWithoutLead: number;
    diagnosticLeads: number;
    contactFormLeads: number;
    bookingLeads: number;
    diagnosticSubmissions: number;
    contactSubmissions: number;
    bookingsConfirmed: number;
    leadsWithoutBooking: number;
};

export type OrphanContact = {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    company_name: string | null;
    created_at: string;
};

export type PostHogFunnelStats = {
    available: boolean;
    reason?: string;
    windowDays: number;
    started: number;
    completed: number;
    diagnosticLeads: number;
    contactLeads: number;
    pageviewUsers: number;
    posthogUrl: string;
};

const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID || "561368";

function countOrNull(res: { count: number | null }): number {
    return res.count ?? 0;
}

export async function loadCrmFunnelStats(): Promise<CrmFunnelStats> {
    const db = createServiceClient();

    const [
        contacts,
        leads,
        diagnosticLeads,
        contactFormLeads,
        bookingLeads,
        diagnosticSubmissions,
        contactSubmissions,
        bookingsConfirmed,
        contactRows,
        leadContactRows,
        diagLeadRows,
    ] = await Promise.all([
        db.from("contacts").select("id", { count: "exact", head: true }),
        db.from("leads").select("id", { count: "exact", head: true }),
        db.from("leads").select("id", { count: "exact", head: true }).eq("source", "diagnostic"),
        db.from("leads").select("id", { count: "exact", head: true }).eq("source", "contact_form"),
        db.from("leads").select("id", { count: "exact", head: true }).eq("source", "diagnostic_booking"),
        db.from("diagnostic_submissions").select("id", { count: "exact", head: true }),
        db.from("contact_submissions").select("id", { count: "exact", head: true }),
        db.from("bookings").select("id", { count: "exact", head: true }).in("status", ["confirmed", "pending"]),
        db.from("contacts").select("id").limit(500),
        db.from("leads").select("contact_id").limit(500),
        db.from("leads").select("id, bookings(id)").in("source", ["diagnostic", "diagnostic_booking"]).limit(200),
    ]);

    const withLead = new Set((leadContactRows.data || []).map((r) => r.contact_id));
    const contactsWithoutLead = (contactRows.data || []).filter((c) => !withLead.has(c.id)).length;

    const leadsWithoutBooking = (diagLeadRows.data || []).filter((l) => {
        const rows = l.bookings;
        const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
        return list.length === 0;
    }).length;

    return {
        contacts: countOrNull(contacts),
        leads: countOrNull(leads),
        contactsWithoutLead,
        diagnosticLeads: countOrNull(diagnosticLeads),
        contactFormLeads: countOrNull(contactFormLeads),
        bookingLeads: countOrNull(bookingLeads),
        diagnosticSubmissions: countOrNull(diagnosticSubmissions),
        contactSubmissions: countOrNull(contactSubmissions),
        bookingsConfirmed: countOrNull(bookingsConfirmed),
        leadsWithoutBooking,
    };
}

export async function loadOrphanContacts(): Promise<OrphanContact[]> {
    const db = createServiceClient();
    const [{ data: contacts }, { data: leads }] = await Promise.all([
        db
            .from("contacts")
            .select("id, full_name, email, phone, company_name, created_at")
            .order("created_at", { ascending: false })
            .limit(100),
        db.from("leads").select("contact_id").limit(500),
    ]);
    const withLead = new Set((leads || []).map((r) => r.contact_id));
    return (contacts || []).filter((c) => !withLead.has(c.id));
}

type HogQLResponse = {
    results?: Array<Array<string | number>>;
};

async function runHogQL(query: string): Promise<HogQLResponse | null> {
    const key = process.env.POSTHOG_PERSONAL_API_KEY?.trim();
    if (!key) return null;

    const res = await fetch(`https://us.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: { kind: "HogQLQuery", query },
        }),
        next: { revalidate: 300 },
    });

    if (!res.ok) {
        console.error("[posthog-query]", res.status, await res.text());
        return null;
    }
    return (await res.json()) as HogQLResponse;
}

export async function loadPostHogFunnelStats(windowDays = 30): Promise<PostHogFunnelStats> {
    const posthogUrl = `https://us.posthog.com/project/${POSTHOG_PROJECT_ID}`;
    const key = process.env.POSTHOG_PERSONAL_API_KEY?.trim();
    if (!key) {
        return {
            available: false,
            reason: "missing_key",
            windowDays,
            started: 0,
            completed: 0,
            diagnosticLeads: 0,
            contactLeads: 0,
            pageviewUsers: 0,
            posthogUrl,
        };
    }

    const [events, users] = await Promise.all([
        runHogQL(`
            SELECT event, count() AS total
            FROM events
            WHERE timestamp > now() - INTERVAL ${windowDays} DAY
              AND event IN (
                'diagnostic_started',
                'diagnostic_completed',
                'diagnostic_lead_submitted',
                'contact_lead_submitted'
              )
            GROUP BY event
        `),
        runHogQL(`
            SELECT count(DISTINCT person_id)
            FROM events
            WHERE timestamp > now() - INTERVAL ${windowDays} DAY
              AND event = '$pageview'
        `),
    ]);

    if (!events?.results) {
        return {
            available: false,
            reason: "query_failed",
            windowDays,
            started: 0,
            completed: 0,
            diagnosticLeads: 0,
            contactLeads: 0,
            pageviewUsers: 0,
            posthogUrl,
        };
    }

    const map = new Map<string, number>();
    for (const row of events.results) {
        map.set(String(row[0]), Number(row[1]) || 0);
    }

    return {
        available: true,
        windowDays,
        started: map.get("diagnostic_started") || 0,
        completed: map.get("diagnostic_completed") || 0,
        diagnosticLeads: map.get("diagnostic_lead_submitted") || 0,
        contactLeads: map.get("contact_lead_submitted") || 0,
        pageviewUsers: Number(users?.results?.[0]?.[0] || 0),
        posthogUrl,
    };
}
