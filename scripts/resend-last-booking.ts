/**
 * One-shot: resend booking emails for the latest confirmed booking.
 * Usage: npx tsx scripts/resend-last-booking.ts
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { formatSlotLabel } from "../src/lib/booking/availability";
import { buildIcs } from "../src/lib/booking/calendar";
import {
    buildInternalBookingEmail,
    buildProspectBookingEmail,
} from "../src/lib/booking/email-copy";

function loadEnvFile(filePath: string) {
    if (!fs.existsSync(filePath)) return;
    for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 0) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        if (!(key in process.env) || !process.env[key]) {
            process.env[key] = value;
        }
    }
}

loadEnvFile(path.join(process.cwd(), ".env"));
loadEnvFile(path.join(process.cwd(), ".env.local"));

async function main() {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = process.env.RESEND_FROM_EMAIL?.trim();
    const notifyTo = process.env.CONTACT_NOTIFY_EMAIL?.trim();
    const organizer = process.env.BOOKING_ORGANIZER_EMAIL?.trim() || notifyTo;
    const meetLink = process.env.BOOKING_MEET_LINK?.trim() || null;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseKey =
        process.env.SUPABASE_SECRET_KEY?.trim() ||
        process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!apiKey) {
        console.error("RESEND_API_KEY missing — aborting");
        process.exit(1);
    }
    if (!from) {
        console.error("RESEND_FROM_EMAIL missing — aborting");
        process.exit(1);
    }
    if (!organizer) {
        console.error("BOOKING_ORGANIZER_EMAIL (or CONTACT_NOTIFY_EMAIL) missing — aborting");
        process.exit(1);
    }
    if (!supabaseUrl || !supabaseKey) {
        console.error("Supabase URL/secret missing — aborting");
        process.exit(1);
    }

    console.log("Config:", {
        fromIsSandbox: /resend\.dev/i.test(from),
        hasNotifyTo: Boolean(notifyTo),
        hasMeetLink: Boolean(meetLink),
    });

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: booking, error } = await supabase
        .from("bookings")
        .select(
            "id, prospect_name, prospect_email, company_name, starts_at, ends_at, timezone, locale, diagnostic_summary, declared_ambitions, selected_sections, suggested_services, ics_uid, meta, diagnostic_submission_id, diagnostic_submissions(answers, summary)",
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (error || !booking) {
        console.error("Failed to load booking:", error);
        process.exit(1);
    }

    const diag = Array.isArray(booking.diagnostic_submissions)
        ? booking.diagnostic_submissions[0]
        : booking.diagnostic_submissions;
    const answers = (diag as { answers?: unknown } | null)?.answers ?? null;
    const phone =
        (booking.meta as { phone?: string } | null)?.phone ||
        "";

    const slotLabel = formatSlotLabel(
        new Date(booking.starts_at).toISOString(),
        booking.timezone,
        booking.locale || "fr",
    );

    const contact = {
        name: booking.prospect_name || "Prospect",
        email: String(booking.prospect_email).toLowerCase(),
        phone,
        company: booking.company_name,
    };

    const selectedPossibilities =
        (
            answers as {
                result?: { selectedPossibilities?: Array<{ id: string; label: string }> };
            } | null
        )?.result?.selectedPossibilities || [];

    const ctx = {
        locale: booking.locale || "fr",
        slotLabel,
        timezone: booking.timezone,
        meetLink,
        summary: booking.diagnostic_summary || "",
        declaredAmbitions: (booking.declared_ambitions as string[]) || [],
        selectedSections:
            (booking.selected_sections as Array<{ areaId: string; title: string }>) || [],
        suggestedServices:
            (booking.suggested_services as Array<{ id: string; label: string }>) || [],
        selectedPossibilities,
        answers,
        bookingId: booking.id,
        diagnosticId: booking.diagnostic_submission_id || "",
    };

    console.log("Booking:", {
        id: booking.id,
        prospect: contact.email,
        slotLabel,
    });

    const eventTitle = `Cobreo — échange de 15 min avec ${contact.company || contact.name}`;
    const eventDescription = [
        "Échange de 15 minutes pour reprendre les opportunités identifiées et regarder les solutions possibles.",
        "",
        `Contact : ${contact.name} · ${contact.email} · ${contact.phone}`,
        ctx.declaredAmbitions.length
            ? `Ambitions : ${ctx.declaredAmbitions.join(", ")}`
            : null,
        ctx.selectedSections.length
            ? `Sections : ${ctx.selectedSections.map((s) => s.title).join(", ")}`
            : null,
        `Diagnostic: ${ctx.diagnosticId}`,
    ]
        .filter(Boolean)
        .join("\n");

    const ics = buildIcs({
        uid: booking.ics_uid || `${booking.id}@cobreo.ca`,
        title: eventTitle,
        description: eventDescription,
        startsAt: new Date(booking.starts_at).toISOString(),
        endsAt: new Date(booking.ends_at).toISOString(),
        timezone: booking.timezone,
        organizerEmail: organizer,
        organizerName: "Dérick · Cobreo",
        attendeeName: contact.name,
        attendeeEmail: contact.email,
        meetLink: meetLink || undefined,
    });

    const resend = new Resend(apiKey);
    const prospectMail = buildProspectBookingEmail({ contact, ctx });
    const internalMail = buildInternalBookingEmail({ contact, ctx });

    console.log("Sending prospect…");
    const prospect = await resend.emails.send({
        from,
        to: [contact.email],
        subject: prospectMail.subject,
        text: prospectMail.text,
        attachments: [{ filename: "cobreo-rdv.ics", content: Buffer.from(ics, "utf8") }],
    });
    if (prospect.error) console.error("Prospect FAILED:", prospect.error);
    else console.log("Prospect OK:", prospect.data?.id);

    if (!notifyTo) {
        console.error("Internal SKIPPED: CONTACT_NOTIFY_EMAIL missing");
    } else {
        console.log("Sending internal…");
        const internal = await resend.emails.send({
            from,
            to: [notifyTo],
            subject: internalMail.subject,
            text: internalMail.text,
            attachments: [{ filename: "cobreo-rdv.ics", content: Buffer.from(ics, "utf8") }],
        });
        if (internal.error) console.error("Internal FAILED:", internal.error);
        else console.log("Internal OK:", internal.data?.id);
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
