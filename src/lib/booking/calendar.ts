export type CalendarEventInput = {
    uid: string;
    title: string;
    description: string;
    startsAt: string;
    endsAt: string;
    timezone: string;
    organizerEmail: string;
    organizerName?: string;
    attendeeName: string;
    attendeeEmail: string;
};

function icsEscape(value: string) {
    return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function toIcsUtc(iso: string) {
    return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildIcs(event: CalendarEventInput & { meetLink?: string }): string {
    const stamp = toIcsUtc(new Date().toISOString());
    const description = event.meetLink
        ? `${event.description}\n\nGoogle Meet: ${event.meetLink}`
        : event.description;
    const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Cobreo//Diagnostic Booking//FR",
        "CALSCALE:GREGORIAN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        `UID:${event.uid}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${toIcsUtc(event.startsAt)}`,
        `DTEND:${toIcsUtc(event.endsAt)}`,
        `SUMMARY:${icsEscape(event.title)}`,
        `DESCRIPTION:${icsEscape(description)}`,
        `ORGANIZER;CN=${icsEscape(event.organizerName || "Cobreo")}:mailto:${event.organizerEmail}`,
        `ATTENDEE;CN=${icsEscape(event.attendeeName)};RSVP=TRUE:mailto:${event.attendeeEmail}`,
        "STATUS:CONFIRMED",
        "SEQUENCE:0",
    ];
    if (event.meetLink) {
        lines.push(`URL:${event.meetLink}`);
        lines.push(`LOCATION:${icsEscape(event.meetLink)}`);
    }
    lines.push("END:VEVENT", "END:VCALENDAR", "");
    return lines.join("\r\n");
}
