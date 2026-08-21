"use server";

import { Resend } from "resend";
import { contactSchema, diagnosticSchema } from "@/lib/validators";
import { createServiceClient } from "@/lib/supabase/admin";
import { ensureServerEnv } from "@/lib/server-env";

function isHoneypotFilled(website?: string) {
    return Boolean(website && website.length > 0);
}

async function notifyInternal(subject: string, text: string) {
    ensureServerEnv();
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const to = process.env.CONTACT_NOTIFY_EMAIL?.trim();
    if (!apiKey || !to) {
        console.warn("[notifyInternal] skipped — missing RESEND_API_KEY or CONTACT_NOTIFY_EMAIL");
        return;
    }

    try {
        const resend = new Resend(apiKey);
        const { data, error } = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL?.trim() || "Cobreo <derick@cobreo.ca>",
            to: [to],
            subject,
            text,
        });
        if (error) {
            console.error("[notifyInternal]", error);
            return;
        }
        console.info("[notifyInternal] sent", data?.id);
    } catch (error) {
        // Never fail the CRM write because notification email failed
        console.error("[notifyInternal]", error);
    }
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
        name: formData.get("name"),
        company: formData.get("company") || "",
        contact: formData.get("contact") || formData.get("phone") || "",
        summary: formData.get("summary") || "",
        answers: formData.get("answers"),
        website: formData.get("website") || "",
    });

    if (!parsed.success) {
        return { ok: false as const, error: "invalid" };
    }

    if (isHoneypotFilled(parsed.data.website)) {
        return { ok: true as const };
    }

    let answersJson: unknown = {};
    try {
        answersJson = JSON.parse(parsed.data.answers);
    } catch {
        return { ok: false as const, error: "invalid" };
    }

    const contactValue = parsed.data.contact.replace(/\s+/g, " ").trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue);
    const email = isEmail ? contactValue : null;
    const phone = isEmail ? null : contactValue;
    const company = parsed.data.company?.trim() || null;
    const locale = String(formData.get("locale") || "fr");
    const summary = parsed.data.summary || null;
    const fullName = parsed.data.name;

    try {
        const supabase = createServiceClient();

        let existing: { id: string } | null = null;
        if (phone) {
            const { data } = await supabase.from("contacts").select("id").eq("phone", phone).maybeSingle();
            existing = data;
        } else if (email) {
            const { data } = await supabase.from("contacts").select("id").eq("email", email).maybeSingle();
            existing = data;
        }

        let contactId: string;
        if (existing?.id) {
            const { error: updateError } = await supabase
                .from("contacts")
                .update({
                    company_name: company,
                    full_name: fullName,
                    phone,
                    email,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", existing.id);
            if (updateError) throw updateError;
            contactId = existing.id;
        } else {
            const { data: contact, error: contactError } = await supabase
                .from("contacts")
                .insert({
                    email,
                    company_name: company,
                    full_name: fullName,
                    phone,
                })
                .select("id")
                .single();
            if (contactError) throw contactError;
            contactId = contact.id;
        }

        const titleCompany = company || contactValue;
        const { data: lead, error: leadError } = await supabase
            .from("leads")
            .insert({
                contact_id: contactId,
                source: "diagnostic",
                status: "new",
                title: `Diagnostic — ${fullName} · ${titleCompany}`,
            })
            .select("id")
            .single();

        if (leadError) throw leadError;

        const { error: subError } = await supabase.from("diagnostic_submissions").insert({
            lead_id: lead.id,
            contact_id: contactId,
            answers: answersJson,
            summary,
            locale,
        });

        if (subError) throw subError;

        await notifyInternal(
            `[Cobreo] Nouveau diagnostic — ${titleCompany}`,
            `Nom: ${fullName}\nEntreprise: ${company || "—"}\nContact: ${contactValue}\nRésumé: ${summary || "—"}\nLocale UI: ${locale}\nLangue réponses: ${
                answersJson && typeof answersJson === "object" && "language" in answersJson
                    ? String((answersJson as { language?: string }).language || locale)
                    : locale
            }\nVersion: ${
                answersJson && typeof answersJson === "object" && "specVersion" in answersJson
                    ? String((answersJson as { specVersion?: string }).specVersion || "—")
                    : "—"
            }`,
        );

        return { ok: true as const };
    } catch (error) {
        console.error("[submitDiagnostic]", error);
        return { ok: false as const, error: "server" };
    }
}
