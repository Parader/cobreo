"use server";

import { createClient } from "@/lib/supabase/server";

const ACTIVITY_KINDS = ["note", "call", "email", "meeting", "other"] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

const NEXT_STEP_STATUSES = ["open", "done", "cancelled"] as const;
export type NextStepStatus = (typeof NEXT_STEP_STATUSES)[number];

const APPOINTMENT_STATUSES = ["planned", "done", "cancelled", "no_show"] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

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

function clean(value: string | null | undefined): string | null {
    const trimmed = value?.trim() ?? "";
    return trimmed ? trimmed : null;
}

export type CreateManualLeadInput = {
    companyName: string;
    personName: string;
    role?: string;
    phone?: string;
    email?: string;
    title?: string;
    notes?: string;
    nextStep?: string;
    nextStepDue?: string; // YYYY-MM-DD
};

export async function createManualLead(input: CreateManualLeadInput) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const companyName = clean(input.companyName);
    const personName = clean(input.personName);
    if (!companyName || !personName) {
        return { ok: false as const, error: "invalid" as const };
    }

    const phone = clean(input.phone);
    const email = clean(input.email)?.toLowerCase() ?? null;
    if (!phone && !email) {
        return { ok: false as const, error: "need_contact" as const };
    }

    const now = new Date().toISOString();
    const title = clean(input.title) || `${companyName} — prospection`;

    // Prefer matching existing contact by phone or email
    let contactId: string | null = null;
    if (email) {
        const { data } = await auth.supabase.from("contacts").select("id").eq("email", email).maybeSingle();
        contactId = data?.id ?? null;
    }
    if (!contactId && phone) {
        const { data } = await auth.supabase.from("contacts").select("id").eq("phone", phone).maybeSingle();
        contactId = data?.id ?? null;
    }

    if (contactId) {
        await auth.supabase
            .from("contacts")
            .update({
                full_name: personName,
                company_name: companyName,
                phone: phone,
                email: email,
                notes: clean(input.notes),
                updated_at: now,
            })
            .eq("id", contactId);
    } else {
        const { data: created, error: contactError } = await auth.supabase
            .from("contacts")
            .insert({
                full_name: personName,
                company_name: companyName,
                phone,
                email,
                notes: clean(input.notes),
            })
            .select("id")
            .single();
        if (contactError || !created) {
            console.error("[createManualLead] contact", contactError);
            return { ok: false as const, error: "server" as const };
        }
        contactId = created.id;
    }

    const { data: lead, error: leadError } = await auth.supabase
        .from("leads")
        .insert({
            contact_id: contactId,
            source: "manual",
            status: "new",
            title,
            notes: clean(input.notes),
        })
        .select("id")
        .single();

    if (leadError || !lead) {
        console.error("[createManualLead] lead", leadError);
        return { ok: false as const, error: "server" as const };
    }

    const { data: person, error: personError } = await auth.supabase
        .from("lead_people")
        .insert({
            lead_id: lead.id,
            full_name: personName,
            role: clean(input.role),
            email,
            phone,
            is_primary: true,
        })
        .select("id")
        .single();

    if (personError) {
        console.error("[createManualLead] person", personError);
    }

    const note = clean(input.notes);
    if (note) {
        await auth.supabase.from("lead_activities").insert({
            lead_id: lead.id,
            person_id: person?.id ?? null,
            kind: "note",
            summary: note,
            occurred_at: now,
        });
    }

    const nextStep = clean(input.nextStep);
    if (nextStep) {
        await auth.supabase.from("lead_next_steps").insert({
            lead_id: lead.id,
            person_id: person?.id ?? null,
            title: nextStep,
            due_at: clean(input.nextStepDue),
            status: "open",
        });
    }

    return { ok: true as const, leadId: lead.id };
}

export async function updateLeadNotes(leadId: string, notes: string) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const { error } = await auth.supabase
        .from("leads")
        .update({ notes: clean(notes), updated_at: new Date().toISOString() })
        .eq("id", leadId);

    if (error) {
        console.error("[updateLeadNotes]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}

export type UpdateLeadDetailsInput = {
    leadId: string;
    contactId: string;
    title?: string;
    notes?: string;
    companyName?: string;
    personName?: string;
    phone?: string;
    email?: string;
};

export async function updateLeadDetails(input: UpdateLeadDetailsInput) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const companyName = clean(input.companyName);
    const personName = clean(input.personName);
    const phone = clean(input.phone);
    const email = clean(input.email)?.toLowerCase() ?? null;
    const title = clean(input.title);
    const notes = clean(input.notes);

    if (!companyName || !personName) {
        return { ok: false as const, error: "invalid" as const };
    }
    if (!phone && !email) {
        return { ok: false as const, error: "need_contact" as const };
    }

    const now = new Date().toISOString();

    const { error: contactError } = await auth.supabase
        .from("contacts")
        .update({
            full_name: personName,
            company_name: companyName,
            phone,
            email,
            updated_at: now,
        })
        .eq("id", input.contactId);

    if (contactError) {
        console.error("[updateLeadDetails] contact", contactError);
        return { ok: false as const, error: "server" as const };
    }

    const { error: leadError } = await auth.supabase
        .from("leads")
        .update({
            title: title || `${companyName} — prospection`,
            notes,
            updated_at: now,
        })
        .eq("id", input.leadId);

    if (leadError) {
        console.error("[updateLeadDetails] lead", leadError);
        return { ok: false as const, error: "server" as const };
    }

    // Keep primary CRM person in sync when present
    const { data: primary } = await auth.supabase
        .from("lead_people")
        .select("id")
        .eq("lead_id", input.leadId)
        .eq("is_primary", true)
        .maybeSingle();

    if (primary?.id) {
        await auth.supabase
            .from("lead_people")
            .update({
                full_name: personName,
                email,
                phone,
                updated_at: now,
            })
            .eq("id", primary.id);
    }

    return { ok: true as const };
}

export async function updateLeadPerson(input: {
    personId: string;
    fullName: string;
    role?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
    leadId?: string;
}) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const fullName = clean(input.fullName);
    if (!fullName) return { ok: false as const, error: "invalid" as const };

    if (input.isPrimary && input.leadId) {
        await auth.supabase.from("lead_people").update({ is_primary: false }).eq("lead_id", input.leadId);
    }

    const patch: {
        full_name: string;
        role: string | null;
        email: string | null;
        phone: string | null;
        updated_at: string;
        is_primary?: boolean;
    } = {
        full_name: fullName,
        role: clean(input.role),
        email: clean(input.email)?.toLowerCase() ?? null,
        phone: clean(input.phone),
        updated_at: new Date().toISOString(),
    };
    if (input.isPrimary !== undefined) patch.is_primary = Boolean(input.isPrimary);

    const { error } = await auth.supabase.from("lead_people").update(patch).eq("id", input.personId);

    if (error) {
        console.error("[updateLeadPerson]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}

export async function addLeadPerson(input: {
    leadId: string;
    fullName: string;
    role?: string;
    email?: string;
    phone?: string;
    isPrimary?: boolean;
}) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const fullName = clean(input.fullName);
    if (!fullName) return { ok: false as const, error: "invalid" as const };

    if (input.isPrimary) {
        await auth.supabase.from("lead_people").update({ is_primary: false }).eq("lead_id", input.leadId);
    }

    const { error } = await auth.supabase.from("lead_people").insert({
        lead_id: input.leadId,
        full_name: fullName,
        role: clean(input.role),
        email: clean(input.email)?.toLowerCase() ?? null,
        phone: clean(input.phone),
        is_primary: Boolean(input.isPrimary),
    });

    if (error) {
        console.error("[addLeadPerson]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}

export async function deleteLeadPerson(personId: string) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const { error } = await auth.supabase.from("lead_people").delete().eq("id", personId);
    if (error) {
        console.error("[deleteLeadPerson]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}

export async function addLeadActivity(input: {
    leadId: string;
    kind: string;
    summary: string;
    details?: string;
    personId?: string;
    occurredAt?: string;
}) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    if (!ACTIVITY_KINDS.includes(input.kind as ActivityKind)) {
        return { ok: false as const, error: "invalid" as const };
    }
    const summary = clean(input.summary);
    if (!summary) return { ok: false as const, error: "invalid" as const };

    const { error } = await auth.supabase.from("lead_activities").insert({
        lead_id: input.leadId,
        person_id: clean(input.personId),
        kind: input.kind,
        summary,
        details: clean(input.details),
        occurred_at: clean(input.occurredAt) || new Date().toISOString(),
    });

    if (error) {
        console.error("[addLeadActivity]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}

export async function deleteLeadActivity(activityId: string) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const { error } = await auth.supabase.from("lead_activities").delete().eq("id", activityId);
    if (error) {
        console.error("[deleteLeadActivity]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}

export async function addLeadNextStep(input: {
    leadId: string;
    title: string;
    dueAt?: string;
    personId?: string;
    notes?: string;
}) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const title = clean(input.title);
    if (!title) return { ok: false as const, error: "invalid" as const };

    const { error } = await auth.supabase.from("lead_next_steps").insert({
        lead_id: input.leadId,
        person_id: clean(input.personId),
        title,
        due_at: clean(input.dueAt),
        notes: clean(input.notes),
        status: "open",
    });

    if (error) {
        console.error("[addLeadNextStep]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}

export async function updateLeadNextStepStatus(stepId: string, status: string) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    if (!NEXT_STEP_STATUSES.includes(status as NextStepStatus)) {
        return { ok: false as const, error: "invalid" as const };
    }

    const now = new Date().toISOString();
    const { error } = await auth.supabase
        .from("lead_next_steps")
        .update({
            status,
            updated_at: now,
            completed_at: status === "done" ? now : null,
        })
        .eq("id", stepId);

    if (error) {
        console.error("[updateLeadNextStepStatus]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}

export async function deleteLeadNextStep(stepId: string) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const { error } = await auth.supabase.from("lead_next_steps").delete().eq("id", stepId);
    if (error) {
        console.error("[deleteLeadNextStep]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}

export async function addLeadAppointment(input: {
    leadId: string;
    title: string;
    startsAt: string;
    endsAt?: string;
    locationOrLink?: string;
    personId?: string;
    notes?: string;
}) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const title = clean(input.title);
    const startsAt = clean(input.startsAt);
    if (!title || !startsAt) return { ok: false as const, error: "invalid" as const };

    const { error } = await auth.supabase.from("lead_appointments").insert({
        lead_id: input.leadId,
        person_id: clean(input.personId),
        title,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: clean(input.endsAt) ? new Date(input.endsAt!).toISOString() : null,
        location_or_link: clean(input.locationOrLink),
        notes: clean(input.notes),
        status: "planned",
    });

    if (error) {
        console.error("[addLeadAppointment]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}

export async function updateLeadAppointmentStatus(appointmentId: string, status: string) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    if (!APPOINTMENT_STATUSES.includes(status as AppointmentStatus)) {
        return { ok: false as const, error: "invalid" as const };
    }

    const { error } = await auth.supabase
        .from("lead_appointments")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", appointmentId);

    if (error) {
        console.error("[updateLeadAppointmentStatus]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}

export async function deleteLeadAppointment(appointmentId: string) {
    const auth = await requireAdmin();
    if (!auth.ok || !auth.supabase) return { ok: false as const, error: "unauthorized" as const };

    const { error } = await auth.supabase.from("lead_appointments").delete().eq("id", appointmentId);
    if (error) {
        console.error("[deleteLeadAppointment]", error);
        return { ok: false as const, error: "server" as const };
    }
    return { ok: true as const };
}
