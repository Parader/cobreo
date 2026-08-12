"use server";

import { Resend } from "resend";
import { contactSchema, diagnosticSchema } from "@/lib/validators";
import { createServiceClient } from "@/lib/supabase/admin";

function isHoneypotFilled(website?: string) {
    return Boolean(website && website.length > 0);
}

async function notifyInternal(subject: string, text: string) {
    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_NOTIFY_EMAIL;
    if (!apiKey || !to) return;

    const resend = new Resend(apiKey);
    await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "Cobreo <onboarding@resend.dev>",
        to: [to],
        subject,
        text,
    });
}

export async function submitContact(formData: FormData) {
    const parsed = contactSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        company: formData.get("company") || "",
        phone: formData.get("phone") || "",
        message: formData.get("message"),
        website: formData.get("website") || "",
    });

    if (!parsed.success) {
        return { ok: false as const, error: "invalid" };
    }

    if (isHoneypotFilled(parsed.data.website)) {
        return { ok: true as const };
    }

    try {
        const supabase = createServiceClient();
        const { data: contact, error: contactError } = await supabase
            .from("contacts")
            .upsert(
                {
                    email: parsed.data.email.toLowerCase(),
                    full_name: parsed.data.name,
                    company_name: parsed.data.company || null,
                    phone: parsed.data.phone || null,
                },
                { onConflict: "email" },
            )
            .select("id")
            .single();

        if (contactError) throw contactError;

        const { data: lead, error: leadError } = await supabase
            .from("leads")
            .insert({
                contact_id: contact.id,
                source: "contact_form",
                status: "new",
                title: `Contact — ${parsed.data.name}`,
            })
            .select("id")
            .single();

        if (leadError) throw leadError;

        const { error: subError } = await supabase.from("contact_submissions").insert({
            lead_id: lead.id,
            contact_id: contact.id,
            message: parsed.data.message,
            locale: String(formData.get("locale") || "fr"),
        });

        if (subError) throw subError;

        await notifyInternal(
            `[Cobreo] Nouveau contact — ${parsed.data.name}`,
            `Nom: ${parsed.data.name}\nEmail: ${parsed.data.email}\nEntreprise: ${parsed.data.company}\n\n${parsed.data.message}`,
        );

        return { ok: true as const };
    } catch {
        return { ok: false as const, error: "server" };
    }
}

export async function submitDiagnostic(formData: FormData) {
    const parsed = diagnosticSchema.safeParse({
        company: formData.get("company"),
        companySize: formData.get("companySize"),
        challenge: formData.get("challenge"),
        tools: formData.get("tools"),
        email: formData.get("email"),
        website: formData.get("website") || "",
    });

    if (!parsed.success) {
        return { ok: false as const, error: "invalid" };
    }

    if (isHoneypotFilled(parsed.data.website)) {
        return { ok: true as const };
    }

    try {
        const supabase = createServiceClient();
        const { data: contact, error: contactError } = await supabase
            .from("contacts")
            .upsert(
                {
                    email: parsed.data.email.toLowerCase(),
                    company_name: parsed.data.company,
                    full_name: parsed.data.company,
                },
                { onConflict: "email" },
            )
            .select("id")
            .single();

        if (contactError) throw contactError;

        const { data: lead, error: leadError } = await supabase
            .from("leads")
            .insert({
                contact_id: contact.id,
                source: "diagnostic",
                status: "new",
                title: `Diagnostic — ${parsed.data.company}`,
            })
            .select("id")
            .single();

        if (leadError) throw leadError;

        const { error: subError } = await supabase.from("diagnostic_submissions").insert({
            lead_id: lead.id,
            contact_id: contact.id,
            answers: {
                company: parsed.data.company,
                companySize: parsed.data.companySize,
                challenge: parsed.data.challenge,
                tools: parsed.data.tools,
            },
            locale: String(formData.get("locale") || "fr"),
        });

        if (subError) throw subError;

        await notifyInternal(
            `[Cobreo] Nouveau diagnostic — ${parsed.data.company}`,
            `Entreprise: ${parsed.data.company}\nTaille: ${parsed.data.companySize}\nEmail: ${parsed.data.email}\nDéfi: ${parsed.data.challenge}\nOutils: ${parsed.data.tools}`,
        );

        return { ok: true as const };
    } catch {
        return { ok: false as const, error: "server" };
    }
}
