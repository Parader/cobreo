import {
    formatDiagnosticQa,
    parseDiagnosticPayload,
} from "@/lib/diagnostic/format-admin-answers";

export type BookingEmailContact = {
    name: string;
    email: string;
    phone: string;
    company: string | null;
};

export type BookingEmailContext = {
    locale: string;
    slotLabel: string;
    timezone: string;
    meetLink: string | null;
    summary: string;
    declaredAmbitions: string[];
    selectedSections: Array<{ areaId: string; title: string }>;
    suggestedServices: Array<{ id: string; label: string }>;
    selectedPossibilities?: Array<{ id: string; label: string }>;
    answers: unknown;
    bookingId: string;
    diagnosticId: string;
};

function isEn(locale: string) {
    return locale === "en";
}

/** Digits-only length check — accepts local and international formats. */
export function looksLikePhone(value: string): boolean {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
}

export function formatQuestionnaireText(answers: unknown, locale: string): string {
    const parsed = parseDiagnosticPayload(answers);
    if (!parsed) {
        return isEn(locale) ? "(Questionnaire unavailable)" : "(Questionnaire indisponible)";
    }
    const rows = formatDiagnosticQa(parsed);
    if (!rows.length) {
        return isEn(locale) ? "(No answers recorded)" : "(Aucune réponse enregistrée)";
    }
    return rows
        .map((row) => {
            const q = row.displayQuestion;
            const a = (row.displayValues ?? []).join(", ") || "—";
            return isEn(locale) ? `Q: ${q}\nA: ${a}` : `Q : ${q}\nR : ${a}`;
        })
        .join("\n\n");
}

function formatResultsReminder(ctx: BookingEmailContext): string {
    const en = isEn(ctx.locale);
    const lines: string[] = [];

    if (ctx.selectedPossibilities?.length) {
        lines.push(en ? "What you chose to explore:" : "Ce que vous avez choisi d’explorer :");
        for (const item of ctx.selectedPossibilities) {
            lines.push(`- ${item.label}`);
        }
        lines.push("");
    }

    if (ctx.selectedSections.length) {
        lines.push(en ? "Highlighted sections:" : "Sections mises de l’avant :");
        for (const section of ctx.selectedSections) {
            lines.push(`- ${section.title}`);
        }
        lines.push("");
    }

    if (ctx.suggestedServices.length) {
        lines.push(en ? "Suggested services:" : "Services suggérés :");
        for (const service of ctx.suggestedServices) {
            lines.push(`- ${service.label}`);
        }
        lines.push("");
    }

    if (ctx.declaredAmbitions.length) {
        lines.push(en ? "Ambitions mentioned:" : "Ambitions mentionnées :");
        for (const ambition of ctx.declaredAmbitions) {
            lines.push(`- ${ambition}`);
        }
        lines.push("");
    }

    if (ctx.summary) {
        lines.push(en ? `Summary: ${ctx.summary}` : `Résumé : ${ctx.summary}`);
    }

    return lines.join("\n").trim();
}

export function buildProspectBookingEmail(input: {
    contact: BookingEmailContact;
    ctx: BookingEmailContext;
}): { subject: string; text: string } {
    const { contact, ctx } = input;
    const en = isEn(ctx.locale);
    const meetLine = ctx.meetLink
        ? en
            ? `\nGoogle Meet: ${ctx.meetLink}\n`
            : `\nGoogle Meet : ${ctx.meetLink}\n`
        : "";

    const subject = en
        ? "Your Cobreo 15-minute call is booked"
        : "Votre échange Cobreo de 15 minutes est réservé";

    const text = en
        ? [
              `Hi ${contact.name},`,
              "",
              `Your 15-minute call with Cobreo is booked for ${ctx.slotLabel} (${ctx.timezone}).`,
              meetLine.trimEnd(),
              "",
              "A calendar invitation (.ics) is attached — open it to add the event to Google Calendar / Outlook.",
              "",
              "— Cobreo",
          ]
              .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
              .join("\n")
        : [
              `Bonjour ${contact.name},`,
              "",
              `Votre échange de 15 minutes avec Cobreo est prévu le ${ctx.slotLabel} (${ctx.timezone}).`,
              meetLine.trimEnd(),
              "",
              "Une invitation calendrier (.ics) est jointe — ouvrez-la pour l’ajouter à Google Calendar / Outlook.",
              "",
              "— Cobreo",
          ]
              .filter((line, i, arr) => !(line === "" && arr[i - 1] === ""))
              .join("\n");

    return { subject, text };
}

export function buildInternalBookingEmail(input: {
    contact: BookingEmailContact;
    ctx: BookingEmailContext;
}): { subject: string; text: string } {
    const { contact, ctx } = input;
    const titleCompany = contact.company || contact.email;
    const questionnaire = formatQuestionnaireText(ctx.answers, "fr");
    const results = formatResultsReminder({ ...ctx, locale: "fr" });

    const subject = `[Cobreo] Appel découverte — ${ctx.slotLabel} · ${titleCompany}`;
    const text = [
        "— Rendez-vous —",
        `Date / heure : ${ctx.slotLabel}`,
        `Fuseau : ${ctx.timezone}`,
        `Meet : ${ctx.meetLink || "—"}`,
        "",
        "— Coordonnées —",
        `Nom : ${contact.name}`,
        `Courriel : ${contact.email}`,
        `Téléphone : ${contact.phone}`,
        `Entreprise : ${contact.company || "—"}`,
        "",
        "— Résultats du diagnostic —",
        results || "—",
        "",
        "— Questionnaire (copie) —",
        questionnaire,
        "",
        `Booking : ${ctx.bookingId}`,
        `Diagnostic : ${ctx.diagnosticId}`,
        "",
        "Invitation .ics jointe (même lien Meet que le prospect).",
    ]
        .filter((line) => line !== null)
        .join("\n");

    return { subject, text };
}
