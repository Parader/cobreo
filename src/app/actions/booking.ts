"use server";

import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/admin";
import {
    generateCandidateSlots,
    randomHoldToken,
    formatSlotLabel,
    type BookingAvailabilityRule,
    type AvailableSlot,
    type BookingDay,
    type BookingConfirmInput,
} from "@/lib/booking/availability";
import { buildIcs } from "@/lib/booking/calendar";
import {
    buildInternalBookingEmail,
    buildProspectBookingEmail,
    looksLikePhone,
} from "@/lib/booking/email-copy";
import { ensureServerEnv } from "@/lib/server-env";

const HOLD_MINUTES = 5;

type RuleRow = {
    id: string;
    name: string;
    timezone: string;
    duration_minutes: number;
    buffer_minutes: number;
    notice_minutes: number;
    horizon_days: number;
    max_slots_displayed: number;
    weekdays: number[];
    windows: unknown;
    is_active: boolean;
};

function asRule(row: RuleRow): BookingAvailabilityRule {
    const windows = Array.isArray(row.windows)
        ? (row.windows as Array<{ start?: string; end?: string }>)
              .filter((w) => w.start && w.end)
              .map((w) => ({ start: String(w.start), end: String(w.end) }))
        : [{ start: "09:00", end: "12:00" }, { start: "13:00", end: "17:00" }];

    return {
        id: row.id,
        name: row.name,
        timezone: row.timezone,
        duration_minutes: row.duration_minutes,
        buffer_minutes: row.buffer_minutes,
        notice_minutes: row.notice_minutes,
        horizon_days: row.horizon_days,
        max_slots_displayed: row.max_slots_displayed,
        weekdays: row.weekdays || [1, 2, 3, 4, 5],
        windows,
        is_active: row.is_active,
    };
}

type EmailSendResult =
    | { ok: true; id?: string }
    | { ok: false; reason: string };

function resendFromAddress() {
    ensureServerEnv();
    return process.env.RESEND_FROM_EMAIL?.trim() || "Cobreo <derick@cobreo.ca>";
}

function emailConfigIssues(): string[] {
    ensureServerEnv();
    const issues: string[] = [];
    if (!process.env.RESEND_API_KEY?.trim()) issues.push("missing_RESEND_API_KEY");
    if (!process.env.CONTACT_NOTIFY_EMAIL?.trim()) issues.push("missing_CONTACT_NOTIFY_EMAIL");
    if (/@resend\.dev/i.test(resendFromAddress())) {
        issues.push("sandbox_FROM_only_allows_resend_account_inbox");
    }
    return issues;
}

async function notifyInternal(subject: string, text: string, ics?: string): Promise<EmailSendResult> {
    ensureServerEnv();
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const to = process.env.CONTACT_NOTIFY_EMAIL?.trim();
    if (!apiKey || !to) {
        const reason = !apiKey ? "missing_RESEND_API_KEY" : "missing_CONTACT_NOTIFY_EMAIL";
        console.warn(`[booking notifyInternal] skipped — ${reason}`);
        return { ok: false, reason };
    }
    try {
        const resend = new Resend(apiKey);
        const from = resendFromAddress();
        const { data, error } = await resend.emails.send({
            from,
            to: [to],
            subject,
            text,
            attachments: ics
                ? [{ filename: "cobreo-rdv.ics", content: Buffer.from(ics, "utf8") }]
                : undefined,
        });
        if (error) {
            console.error("[booking notifyInternal]", { from, to, error });
            return { ok: false, reason: error.message || "resend_error" };
        }
        console.info("[booking notifyInternal] sent", data?.id);
        return { ok: true, id: data?.id };
    } catch (error) {
        console.error("[booking notifyInternal]", error);
        return { ok: false, reason: "exception" };
    }
}

async function notifyProspect(input: {
    email: string;
    name: string;
    subject: string;
    text: string;
    ics: string;
}): Promise<EmailSendResult> {
    ensureServerEnv();
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
        console.warn("[booking notifyProspect] skipped — missing_RESEND_API_KEY");
        return { ok: false, reason: "missing_RESEND_API_KEY" };
    }
    try {
        const resend = new Resend(apiKey);
        const from = resendFromAddress();
        const { data, error } = await resend.emails.send({
            from,
            to: [input.email],
            subject: input.subject,
            text: input.text,
            attachments: [{ filename: "cobreo-rdv.ics", content: Buffer.from(input.ics, "utf8") }],
        });
        if (error) {
            console.error("[booking notifyProspect]", { from, to: input.email, error });
            return { ok: false, reason: error.message || "resend_error" };
        }
        console.info("[booking notifyProspect] sent", data?.id);
        return { ok: true, id: data?.id };
    } catch (error) {
        console.error("[booking notifyProspect]", error);
        return { ok: false, reason: "exception" };
    }
}

export async function listBookingSlots(locale: string = "fr"): Promise<
    | {
          ok: true;
          slots: AvailableSlot[];
          days: BookingDay[];
          timezone: string;
          durationMinutes: number;
      }
    | { ok: false; error: string }
> {
    try {
        const supabase = createServiceClient();
        await supabase.rpc("expire_stale_booking_holds");

        const { data: ruleRow, error: ruleError } = await supabase
            .from("booking_availability_rules")
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();

        if (ruleError) throw ruleError;
        if (!ruleRow) return { ok: false, error: "no_rules" };

        const rule = asRule(ruleRow as RuleRow);
        const horizonEnd = new Date(Date.now() + rule.horizon_days * 86_400_000).toISOString();

        const [{ data: bookings }, { data: holds }] = await Promise.all([
            supabase
                .from("bookings")
                .select("starts_at, ends_at")
                .in("status", ["pending", "confirmed"])
                .gte("ends_at", new Date().toISOString())
                .lte("starts_at", horizonEnd),
            supabase
                .from("booking_slots")
                .select("starts_at, ends_at")
                .eq("status", "held")
                .gt("hold_expires_at", new Date().toISOString())
                .gte("ends_at", new Date().toISOString()),
        ]);

        const busy = [...(bookings || []), ...(holds || [])];
        const { slots, days } = generateCandidateSlots({ rule, busy, locale, simulateTraffic: true });
        return {
            ok: true,
            slots,
            days,
            timezone: rule.timezone,
            durationMinutes: rule.duration_minutes,
        };
    } catch (error) {
        console.error("[listBookingSlots]", error);
        return { ok: false, error: "server" };
    }
}

export async function holdBookingSlot(input: {
    startsAt: string;
    endsAt: string;
    timezone: string;
    /** Release this hold first (previous selection in the same session). */
    previousHoldToken?: string | null;
}): Promise<{ ok: true; holdToken: string; expiresAt: string } | { ok: false; error: string }> {
    try {
        const supabase = createServiceClient();
        await supabase.rpc("expire_stale_booking_holds");

        if (input.previousHoldToken) {
            await supabase
                .from("booking_slots")
                .update({ status: "released" })
                .eq("hold_token", input.previousHoldToken)
                .eq("status", "held");
        }

        const starts = new Date(input.startsAt);
        const ends = new Date(input.endsAt);
        if (!(starts.getTime() < ends.getTime())) return { ok: false, error: "invalid_slot" };

        const [{ data: bookings }, { data: holds }] = await Promise.all([
            supabase
                .from("bookings")
                .select("id")
                .in("status", ["pending", "confirmed"])
                .lt("starts_at", ends.toISOString())
                .gt("ends_at", starts.toISOString())
                .limit(1),
            supabase
                .from("booking_slots")
                .select("id")
                .eq("status", "held")
                .gt("hold_expires_at", new Date().toISOString())
                .lt("starts_at", ends.toISOString())
                .gt("ends_at", starts.toISOString())
                .limit(1),
        ]);

        if ((bookings && bookings.length > 0) || (holds && holds.length > 0)) {
            return { ok: false, error: "slot_taken" };
        }

        const holdToken = randomHoldToken();
        const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000).toISOString();
        const { error } = await supabase.from("booking_slots").insert({
            starts_at: starts.toISOString(),
            ends_at: ends.toISOString(),
            timezone: input.timezone,
            status: "held",
            hold_token: holdToken,
            hold_expires_at: expiresAt,
        });
        if (error) {
            // Unique/exclusion race
            return { ok: false, error: "slot_taken" };
        }
        return { ok: true, holdToken, expiresAt };
    } catch (error) {
        console.error("[holdBookingSlot]", error);
        return { ok: false, error: "server" };
    }
}

/** Free a held slot (leave page, change selection, failed confirm). */
export async function releaseBookingHold(
    holdToken: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
    try {
        if (!holdToken) return { ok: true };
        const supabase = createServiceClient();
        await supabase
            .from("booking_slots")
            .update({ status: "released" })
            .eq("hold_token", holdToken)
            .eq("status", "held");
        return { ok: true };
    } catch (error) {
        console.error("[releaseBookingHold]", error);
        return { ok: false, error: "server" };
    }
}

export async function confirmBooking(
    input: BookingConfirmInput,
): Promise<
    | {
          ok: true;
          bookingId: string;
          startsAt: string;
          endsAt: string;
          timezone: string;
          confirmationLabel: string;
          emails: { prospect: boolean; internal: boolean; issues: string[] };
      }
    | { ok: false; error: string }
> {
    try {
        const email = input.email.trim().toLowerCase();
        const name = input.name.trim();
        const phone = input.phone.trim();
        if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !looksLikePhone(phone)) {
            return { ok: false, error: "invalid" };
        }

        const supabase = createServiceClient();
        await supabase.rpc("expire_stale_booking_holds");

        const starts = new Date(input.startsAt);
        const ends = new Date(input.endsAt);

        const { data: hold, error: holdError } = await supabase
            .from("booking_slots")
            .select("*")
            .eq("hold_token", input.holdToken)
            .eq("status", "held")
            .maybeSingle();

        if (holdError) throw holdError;
        if (!hold) return { ok: false, error: "hold_expired" };
        if (new Date(hold.hold_expires_at).getTime() < Date.now()) {
            await supabase.from("booking_slots").update({ status: "expired" }).eq("id", hold.id);
            return { ok: false, error: "hold_expired" };
        }
        // Postgres/Supabase may return "+00:00" while the client sends ".000Z" — compare instants, not strings
        const holdStartMs = new Date(hold.starts_at as string).getTime();
        const holdEndMs = new Date(hold.ends_at as string).getTime();
        if (holdStartMs !== starts.getTime() || holdEndMs !== ends.getTime()) {
            console.error("[confirmBooking] slot_mismatch", {
                holdStarts: hold.starts_at,
                holdEnds: hold.ends_at,
                inputStarts: starts.toISOString(),
                inputEnds: ends.toISOString(),
            });
            return { ok: false, error: "slot_mismatch" };
        }

        // Re-check conflicts before converting hold
        const { data: conflicts } = await supabase
            .from("bookings")
            .select("id")
            .in("status", ["pending", "confirmed"])
            .lt("starts_at", ends.toISOString())
            .gt("ends_at", starts.toISOString())
            .limit(1);
        if (conflicts && conflicts.length > 0) return { ok: false, error: "slot_taken" };

        const company = input.company?.trim() || null;

        const { data: existing } = await supabase.from("contacts").select("id").eq("email", email).maybeSingle();
        let contactId: string;
        if (existing?.id) {
            await supabase
                .from("contacts")
                .update({
                    full_name: name,
                    company_name: company,
                    email,
                    phone,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id);
            contactId = existing.id;
        } else {
            const { data: contact, error: contactError } = await supabase
                .from("contacts")
                .insert({ email, full_name: name, company_name: company, phone })
                .select("id")
                .single();
            if (contactError) throw contactError;
            contactId = contact.id;
        }

        const slotLabel = formatSlotLabel(starts.toISOString(), input.timezone, input.locale);
        const { data: lead, error: leadError } = await supabase
            .from("leads")
            .insert({
                contact_id: contactId,
                source: "diagnostic_booking",
                status: "new",
                title: `Appel découverte — ${slotLabel} · ${name}`,
                notes: [
                    `Appel découverte — ${slotLabel}`,
                    `Téléphone : ${phone}`,
                    input.declaredAmbitions.length
                        ? `Ambitions : ${input.declaredAmbitions.join(", ")}`
                        : null,
                    input.selectedSections.length
                        ? `Sections : ${input.selectedSections.map((s) => s.title).join(", ")}`
                        : null,
                    input.suggestedServices.length
                        ? `Services suggérés : ${input.suggestedServices.map((s) => s.label).join(", ")}`
                        : null,
                ]
                    .filter(Boolean)
                    .join("\n"),
            })
            .select("id")
            .single();
        if (leadError) throw leadError;

        const { data: diagnostic, error: diagError } = await supabase
            .from("diagnostic_submissions")
            .insert({
                lead_id: lead.id,
                contact_id: contactId,
                answers: input.answers,
                summary: input.summary,
                locale: input.locale,
            })
            .select("id")
            .single();
        if (diagError) throw diagError;

        const icsUid = `${crypto.randomUUID()}@cobreo.ca`;
        const organizerEmail =
            process.env.BOOKING_ORGANIZER_EMAIL?.trim() ||
            process.env.CONTACT_NOTIFY_EMAIL?.trim() ||
            "derick@cobreo.ca";
        const meetLink = process.env.BOOKING_MEET_LINK?.trim() || null;

        const eventTitle = `Cobreo — échange de 15 min avec ${company || name}`;
        const eventDescription = [
            "Échange de 15 minutes pour reprendre les opportunités identifiées et regarder les solutions possibles.",
            "",
            `Contact : ${name} · ${email} · ${phone}`,
            input.declaredAmbitions.length
                ? `Ambitions : ${input.declaredAmbitions.join(", ")}`
                : null,
            input.selectedSections.length
                ? `Sections : ${input.selectedSections.map((s) => s.title).join(", ")}`
                : null,
            input.suggestedServices.length
                ? `Services : ${input.suggestedServices.map((s) => s.label).join(", ")}`
                : null,
            `Diagnostic: ${diagnostic.id}`,
        ]
            .filter(Boolean)
            .join("\n");

        const { data: booking, error: bookingError } = await supabase
            .from("bookings")
            .insert({
                contact_id: contactId,
                lead_id: lead.id,
                diagnostic_submission_id: diagnostic.id,
                calendar_connection_id: null,
                starts_at: starts.toISOString(),
                ends_at: ends.toISOString(),
                timezone: input.timezone,
                status: "confirmed",
                prospect_name: name,
                prospect_email: email,
                company_name: company,
                declared_ambitions: input.declaredAmbitions,
                selected_sections: input.selectedSections,
                suggested_services: input.suggestedServices,
                diagnostic_summary: input.summary,
                calendar_event_id: null,
                calendar_html_link: meetLink,
                ics_uid: icsUid,
                locale: input.locale,
                meta: { phone },
            })
            .select("id")
            .single();

        if (bookingError) {
            // Exclusion constraint race — release path for the prospect
            console.error("[confirmBooking insert]", bookingError);
            return { ok: false, error: "slot_taken" };
        }

        await supabase.from("booking_slots").update({ status: "converted" }).eq("id", hold.id);

        const ics = buildIcs({
            uid: icsUid,
            title: eventTitle,
            description: eventDescription,
            startsAt: starts.toISOString(),
            endsAt: ends.toISOString(),
            timezone: input.timezone,
            organizerEmail,
            organizerName: "Dérick · Cobreo",
            attendeeName: name,
            attendeeEmail: email,
            meetLink: meetLink || undefined,
        });

        const answersPayload = input.answers as {
            result?: { selectedPossibilities?: Array<{ id: string; label: string }> };
        } | null;
        const emailCtx = {
            locale: input.locale,
            slotLabel,
            timezone: input.timezone,
            meetLink,
            summary: input.summary,
            declaredAmbitions: input.declaredAmbitions,
            selectedSections: input.selectedSections,
            suggestedServices: input.suggestedServices,
            selectedPossibilities: answersPayload?.result?.selectedPossibilities || [],
            answers: input.answers,
            bookingId: booking.id,
            diagnosticId: diagnostic.id,
        };
        const contactPayload = { name, email, phone, company };

        const prospectMail = buildProspectBookingEmail({ contact: contactPayload, ctx: emailCtx });
        const prospectSend = await notifyProspect({
            email,
            name,
            subject: prospectMail.subject,
            text: prospectMail.text,
            ics,
        });

        const internalMail = buildInternalBookingEmail({ contact: contactPayload, ctx: emailCtx });
        const internalSend = await notifyInternal(internalMail.subject, internalMail.text, ics);

        const issues = [
            ...emailConfigIssues(),
            ...(prospectSend.ok ? [] : [`prospect:${prospectSend.reason}`]),
            ...(internalSend.ok ? [] : [`internal:${internalSend.reason}`]),
        ];
        if (issues.length) {
            console.warn("[confirmBooking] email issues", { bookingId: booking.id, issues });
        }

        return {
            ok: true,
            bookingId: booking.id,
            startsAt: starts.toISOString(),
            endsAt: ends.toISOString(),
            timezone: input.timezone,
            confirmationLabel: slotLabel,
            emails: {
                prospect: prospectSend.ok,
                internal: internalSend.ok,
                issues,
            },
        };
    } catch (error) {
        console.error("[confirmBooking]", error);
        return { ok: false, error: "server" };
    }
}
