"use server";

import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const LEAD_STATUSES = ["new", "in_progress", "won", "archived"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

async function requireAdmin() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false as const, supabase: null, error: "unauthorized" as const };

    const { data: profile } = await supabase
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!profile) return { ok: false as const, supabase: null, error: "unauthorized" as const };
    return { ok: true as const, supabase, error: null };
}

export async function updateLeadStatus(leadId: string, status: string) {
    if (!LEAD_STATUSES.includes(status as LeadStatus)) {
        return { ok: false as const, error: "invalid" as const };
    }

    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const { error } = await auth.supabase
        .from("leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", leadId);

    if (error) {
        console.error("[updateLeadStatus]", error);
        return { ok: false as const, error: "server" as const };
    }

    return { ok: true as const };
}

export async function deleteLead(leadId: string) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const { error } = await auth.supabase.from("leads").delete().eq("id", leadId);
    if (error) {
        console.error("[deleteLead]", error);
        return { ok: false as const, error: "server" as const };
    }

    return { ok: true as const };
}

export type BookingRuleInput = {
    id?: string;
    name: string;
    timezone: string;
    duration_minutes: number;
    buffer_minutes: number;
    notice_minutes: number;
    horizon_days: number;
    max_slots_displayed: number;
    weekdays: number[];
    windows: Array<{ start: string; end: string }>;
    is_active: boolean;
};

function normalizeHm(value: string): string | null {
    const trimmed = value.trim();
    const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function asPositiveInt(value: number, fallback: number, min = 0) {
    if (!Number.isFinite(value)) return fallback;
    return Math.max(min, Math.round(value));
}

export async function saveBookingAvailabilityRule(input: BookingRuleInput) {
    const auth = await requireAdmin();
    if (!auth.ok) return { ok: false as const, error: "unauthorized" as const };

    const windows = input.windows
        .map((w) => {
            const start = normalizeHm(w.start);
            const end = normalizeHm(w.end);
            if (!start || !end) return null;
            return { start, end };
        })
        .filter((w): w is { start: string; end: string } => Boolean(w));

    const weekdays = [...new Set(input.weekdays.map((d) => Number(d)).filter((d) => d >= 0 && d <= 6))];

    if (!input.name.trim() || !input.timezone.trim() || weekdays.length === 0 || windows.length === 0) {
        return { ok: false as const, error: "invalid" as const };
    }

    const duration = asPositiveInt(input.duration_minutes, 0, 0);
    if (duration < 5) return { ok: false as const, error: "invalid" as const };

    const payload = {
        name: input.name.trim(),
        timezone: input.timezone.trim(),
        duration_minutes: duration,
        buffer_minutes: asPositiveInt(input.buffer_minutes, 0),
        notice_minutes: asPositiveInt(input.notice_minutes, 0),
        horizon_days: asPositiveInt(input.horizon_days, 1, 1),
        max_slots_displayed: asPositiveInt(input.max_slots_displayed, 1, 1),
        weekdays,
        windows,
        is_active: Boolean(input.is_active),
        updated_at: new Date().toISOString(),
    };

    // Service role after admin check — avoids silent 0-row updates under RLS
    const db = createServiceClient();

    if (input.id) {
        const { data, error } = await db
            .from("booking_availability_rules")
            .update(payload)
            .eq("id", input.id)
            .select("id")
            .maybeSingle();
        if (error || !data) {
            console.error("[saveBookingAvailabilityRule update]", error || "no row updated");
            return { ok: false as const, error: "server" as const };
        }
    } else {
        const { data, error } = await db.from("booking_availability_rules").insert(payload).select("id").maybeSingle();
        if (error || !data) {
            console.error("[saveBookingAvailabilityRule insert]", error || "no row inserted");
            return { ok: false as const, error: "server" as const };
        }
    }

    return { ok: true as const };
}
