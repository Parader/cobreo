import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAdminSlug } from "@/lib/admin-path";
import { AdminDashboard } from "@/components/cobreo/admin-dashboard";
import type {
    AdminBookingRule,
    AdminUpcomingBooking,
} from "@/components/cobreo/admin-booking-settings";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function AdminHomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/${getAdminSlug()}/login`);
    }

    const { data: profile } = await supabase
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (!profile) {
        redirect(`/${locale}/${getAdminSlug()}/login`);
    }

    // Booking tables: service role after admin check (same pattern as booking engine writes)
    const db = createServiceClient();

    const [{ data: leads }, { data: rules }, { data: bookings }] = await Promise.all([
        supabase
            .from("leads")
            .select(
                "id, title, source, status, created_at, contacts(full_name, email, company_name, phone), diagnostic_submissions(id, summary, answers, locale, created_at), bookings(id, starts_at, ends_at, timezone, status, declared_ambitions, selected_sections, suggested_services)",
            )
            .order("created_at", { ascending: false })
            .limit(50),
        db
            .from("booking_availability_rules")
            .select(
                "id, name, timezone, duration_minutes, buffer_minutes, notice_minutes, horizon_days, max_slots_displayed, weekdays, windows, is_active",
            )
            .order("updated_at", { ascending: false })
            .limit(1),
        db
            .from("bookings")
            .select("id, starts_at, timezone, status, prospect_name, prospect_email, company_name")
            .in("status", ["confirmed", "pending"])
            .gte("starts_at", new Date().toISOString())
            .order("starts_at", { ascending: true })
            .limit(20),
    ]);

    const ruleRow = rules?.[0] ?? null;
    const bookingRule: AdminBookingRule | null = ruleRow
        ? {
              id: ruleRow.id,
              name: ruleRow.name,
              timezone: ruleRow.timezone,
              duration_minutes: ruleRow.duration_minutes,
              buffer_minutes: ruleRow.buffer_minutes,
              notice_minutes: ruleRow.notice_minutes,
              horizon_days: ruleRow.horizon_days,
              max_slots_displayed: ruleRow.max_slots_displayed,
              weekdays: ruleRow.weekdays ?? [],
              windows: (ruleRow.windows as Array<{ start: string; end: string }>) ?? [],
              is_active: ruleRow.is_active,
          }
        : null;

    const upcomingBookings: AdminUpcomingBooking[] = (bookings ?? []).map((b) => ({
        id: b.id,
        starts_at: b.starts_at,
        timezone: b.timezone,
        status: b.status,
        prospect_name: b.prospect_name,
        prospect_email: b.prospect_email,
        company_name: b.company_name,
    }));

    return (
        <div className="mx-auto max-w-container px-4 py-10 md:px-8">
            <AdminDashboard
                leads={leads || []}
                bookingRule={bookingRule}
                upcomingBookings={upcomingBookings}
            />
        </div>
    );
}
