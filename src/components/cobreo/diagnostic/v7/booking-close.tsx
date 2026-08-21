"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/base/input/input";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { LeadCapture } from "@/components/cobreo/diagnostic/lead-capture";
import { getBookingSpec } from "@/content/diagnostic/v7/catalog";
import type { DiagnosticV7AnswersPayload } from "@/content/diagnostic/v7/types";
import { ambitionLabel } from "@/content/diagnostic/v7/catalog";
import { pickLocalized } from "@/lib/diagnostic/localize";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/posthog";
import { confirmBooking, holdBookingSlot, listBookingSlots, releaseBookingHold } from "@/app/actions/booking";
import type { AvailableSlot, BookingDay } from "@/lib/booking/availability";
import { looksLikePhone } from "@/lib/booking/email-copy";
import type { AmbitionId } from "@/content/diagnostic/v7/types";
import { cx } from "@/utils/cx";

const HOLD_STORAGE_KEY = "cobreo_booking_hold_v1";

function looksLikeEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function readStoredHold(): string | null {
    try {
        return sessionStorage.getItem(HOLD_STORAGE_KEY);
    } catch {
        return null;
    }
}

function writeStoredHold(token: string | null) {
    try {
        if (token) sessionStorage.setItem(HOLD_STORAGE_KEY, token);
        else sessionStorage.removeItem(HOLD_STORAGE_KEY);
    } catch {
        /* ignore */
    }
}

export function BookingClose({
    payload,
    summary,
    onDone,
}: {
    payload: DiagnosticV7AnswersPayload;
    summary: string;
    onDone: () => void;
}) {
    const t = useTranslations("diagnostic");
    const locale = useLocale();
    const booking = getBookingSpec();
    const [slots, setSlots] = useState<AvailableSlot[]>([]);
    const [days, setDays] = useState<BookingDay[]>([]);
    const [timezone, setTimezone] = useState("America/Toronto");
    const [loadError, setLoadError] = useState<string | null>(null);
    const [loadingSlots, setLoadingSlots] = useState(true);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);
    const [selected, setSelected] = useState<AvailableSlot | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [company, setCompany] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [pending, startTransition] = useTransition();
    const [confirmation, setConfirmation] = useState<{
        label: string;
        emailWarning?: string;
    } | null>(null);
    /** Hold only exists briefly during confirm — keep a ref for pagehide cleanup. */
    const inFlightHoldRef = useRef<string | null>(null);

    const context = useMemo(() => {
        const ambitions = (payload.result.declaredAmbitions || [])
            .filter((id) => id !== "nothing_specific" && id !== "other")
            .map((id) => ambitionLabel(id as AmbitionId, locale));
        const sections = (payload.result.serviceSections || []).map((s) => ({
            areaId: s.areaId,
            title: s.title,
        }));
        const services = (payload.result.serviceSections || []).flatMap((s) => s.services);
        const uniqueServices = [...new Map(services.map((s) => [s.id, s])).values()];
        return { ambitions, sections, services: uniqueServices };
    }, [payload, locale]);

    const daySlots = useMemo(
        () => (selectedDay ? slots.filter((s) => s.dateKey === selectedDay) : []),
        [slots, selectedDay],
    );

    const selectedDayMeta = useMemo(
        () => days.find((d) => d.dateKey === selectedDay) || null,
        [days, selectedDay],
    );

    useEffect(() => {
        const orphan = readStoredHold();
        if (!orphan) return;
        writeStoredHold(null);
        void releaseBookingHold(orphan);
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoadingSlots(true);
            const result = await listBookingSlots(locale);
            if (cancelled) return;
            if (!result.ok) {
                setLoadError(result.error);
                setSlots([]);
                setDays([]);
                setSelectedDay(null);
            } else {
                setSlots(result.slots);
                setDays(result.days);
                setTimezone(result.timezone);
                setLoadError(null);
                const firstOpen = result.days.find((d) => d.status === "open")?.dateKey || null;
                setSelectedDay(firstOpen);
            }
            setLoadingSlots(false);
        })();
        return () => {
            cancelled = true;
        };
    }, [locale]);

    useEffect(() => {
        const release = () => {
            const token = inFlightHoldRef.current || readStoredHold();
            if (!token) return;
            inFlightHoldRef.current = null;
            writeStoredHold(null);
            void releaseBookingHold(token);
        };
        window.addEventListener("pagehide", release);
        return () => {
            window.removeEventListener("pagehide", release);
            if (inFlightHoldRef.current) release();
        };
    }, []);

    function selectDay(day: BookingDay) {
        if (day.status !== "open") return;
        setSelectedDay(day.dateKey);
        setSelected(null);
        setError(null);
    }

    function selectSlot(slot: AvailableSlot) {
        setError(null);
        setSelected(slot);
    }

    function onConfirm() {
        if (!selected || pending) return;
        const nameOk = name.trim().length >= 2;
        const emailOk = looksLikeEmail(email.trim());
        const phoneOk = looksLikePhone(phone.trim());
        if (!nameOk || !emailOk || !phoneOk) {
            setError(
                !nameOk
                    ? t("captureNeedName")
                    : !emailOk
                      ? locale === "en"
                          ? "Enter a valid email."
                          : "Entrez un courriel valide."
                      : t("captureNeedPhone"),
            );
            return;
        }
        setError(null);
        startTransition(async () => {
            const held = await holdBookingSlot({
                startsAt: selected.startsAt,
                endsAt: selected.endsAt,
                timezone: selected.timezone,
            });
            if (!held.ok) {
                setError(
                    held.error === "slot_taken"
                        ? locale === "en"
                            ? "That slot was just taken. Pick another."
                            : "Ce créneau vient d’être pris. Choisissez-en un autre."
                        : t("error"),
                );
                setSelected(null);
                const refreshed = await listBookingSlots(locale);
                if (refreshed.ok) {
                    setSlots(refreshed.slots);
                    setDays(refreshed.days);
                }
                return;
            }

            inFlightHoldRef.current = held.holdToken;
            writeStoredHold(held.holdToken);

            const result = await confirmBooking({
                holdToken: held.holdToken,
                startsAt: selected.startsAt,
                endsAt: selected.endsAt,
                timezone: selected.timezone,
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                company: company.trim(),
                locale,
                summary,
                answers: payload,
                declaredAmbitions: context.ambitions,
                selectedSections: context.sections,
                suggestedServices: context.services,
            });

            if (!result.ok) {
                await releaseBookingHold(held.holdToken);
                inFlightHoldRef.current = null;
                writeStoredHold(null);
                setError(
                    result.error === "hold_expired" ||
                        result.error === "slot_taken" ||
                        result.error === "slot_mismatch"
                        ? locale === "en"
                            ? "That slot is no longer available. Please choose another."
                            : "Ce créneau n’est plus disponible. Choisissez-en un autre."
                        : result.error === "invalid"
                          ? locale === "en"
                              ? "Check your name, email and phone."
                              : "Vérifiez votre nom, courriel et téléphone."
                          : t("error"),
                );
                setSelected(null);
                const refreshed = await listBookingSlots(locale);
                if (refreshed.ok) {
                    setSlots(refreshed.slots);
                    setDays(refreshed.days);
                }
                return;
            }

            inFlightHoldRef.current = null;
            writeStoredHold(null);
            trackEvent(AnalyticsEvents.diagnosticLeadSubmitted, {
                locale,
                has_opportunity: payload.result.hasCredibleOpportunity,
            });
            const emailWarning = result.emails && !result.emails.prospect
                    ? locale === "en"
                        ? "Your booking is confirmed, but the confirmation email could not be sent. We’ll follow up manually."
                        : "Votre réservation est confirmée, mais le courriel de confirmation n’a pas pu être envoyé. Nous vous recontacterons manuellement."
                    : undefined;
            setConfirmation({ label: result.confirmationLabel, emailWarning });
        });
    }

    if (confirmation) {
        return (
            <section className="overflow-hidden rounded-3xl bg-[#253353] text-white shadow-[0_20px_48px_rgba(37,51,83,0.28)]">
                <div className="px-6 py-8 md:px-8">
                    <h3 className="font-display text-[28px] tracking-[-0.02em]">
                        {pickLocalized(booking.confirmation as Record<string, unknown>, "title", locale) ||
                            booking.confirmation.title_fr}
                    </h3>
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-white/85">
                        {(
                            pickLocalized(booking.confirmation as Record<string, unknown>, "body_template", locale) ||
                            booking.confirmation.body_template_fr
                        )
                            .replace("{date}", confirmation.label)
                            .replace("{time}", "")
                            .replace("{timezone}", timezone)
                            .replace("{email}", email.trim())
                            .replace(/\s+/g, " ")
                            .trim()}
                    </p>
                    {confirmation.emailWarning ? (
                        <p className="mt-4 max-w-xl text-sm leading-relaxed text-amber-200/95">
                            {confirmation.emailWarning}
                        </p>
                    ) : null}
                </div>
            </section>
        );
    }

    // Engine unavailable → contact fallback (never fake a reservation)
    if (!loadingSlots && (loadError || slots.length === 0)) {
        return (
            <section className="flex flex-col gap-4">
                <div>
                    <h3 className="font-display text-2xl tracking-[-0.02em] text-[#171717]">
                        {pickLocalized(booking as Record<string, unknown>, "title", locale) || booking.title_fr}
                    </h3>
                    <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#525252]">
                        {pickLocalized(booking as Record<string, unknown>, "body", locale) || booking.body_fr}
                    </p>
                    <p className="mt-2 text-sm text-[#737373]">
                        {locale === "en"
                            ? "No live slots are available right now — leave your details and we’ll follow up."
                            : "Aucun créneau n’est disponible pour le moment — laissez vos coordonnées et nous vous recontacterons."}
                    </p>
                </div>
                <LeadCapture
                    payload={payload}
                    summary={summary}
                    onDone={onDone}
                    titleOverride={locale === "en" ? "Leave your contact details" : "Laissez vos coordonnées"}
                    bodyOverride={pickLocalized(booking as Record<string, unknown>, "body", locale) || booking.body_fr}
                    ctaOverride={locale === "en" ? "Send" : "Envoyer"}
                />
            </section>
        );
    }

    return (
        <section className="overflow-hidden rounded-3xl bg-[#253353] text-white shadow-[0_20px_48px_rgba(37,51,83,0.28)]">
            <div className="border-b border-white/10 px-6 py-7 md:px-8 md:py-8">
                <h3 className="font-display text-[26px] font-normal leading-[1.15] tracking-[-0.02em] md:text-[32px]">
                    {pickLocalized(booking as Record<string, unknown>, "title", locale) || booking.title_fr}
                </h3>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-white/80">
                    {pickLocalized(booking as Record<string, unknown>, "body", locale) || booking.body_fr}
                </p>
                <p className="mt-3 text-xs text-white/55">
                    {locale === "en" ? "Calendar timezone" : "Fuseau du calendrier"} · {timezone} ·{" "}
                    {booking.duration_minutes} min
                </p>
            </div>

            <div className="bg-[#efedea] px-6 py-6 text-[#171717] md:px-8 md:py-7">
                {loadingSlots ? (
                    <p className="text-sm text-[#525252]">
                        {locale === "en" ? "Loading available times…" : "Chargement des créneaux…"}
                    </p>
                ) : (
                    <div className="flex flex-col gap-5">
                        <div>
                            <p className="text-sm font-semibold text-[#404040]">
                                {locale === "en" ? "Pick a day" : "Choisissez un jour"}
                            </p>
                            <p className="mt-1 text-xs text-[#737373]">
                                {locale === "en"
                                    ? "Some days fill up quickly — grey days are already full."
                                    : "Certains jours se remplissent vite — les jours grisés sont déjà complets."}
                            </p>
                            <div className="mt-3 -mx-2 overflow-x-auto px-2 py-2">
                                <div className="flex w-max gap-2">
                                {days.map((day) => {
                                    const active = selectedDay === day.dateKey;
                                    const full = day.status === "full";
                                    return (
                                        <button
                                            key={day.dateKey}
                                            type="button"
                                            disabled={full || pending}
                                            onClick={() => selectDay(day)}
                                            className={cx(
                                                "flex min-w-[4.5rem] shrink-0 flex-col items-center rounded-2xl px-3 py-3 text-center transition duration-100 ease-linear",
                                                full && "cursor-not-allowed bg-[#e7e5e1] text-[#a3a3a3] ring-1 ring-[#171717]/06",
                                                !full &&
                                                    active &&
                                                    "bg-[#253353] text-white shadow-sm",
                                                !full &&
                                                    !active &&
                                                    "bg-white text-[#171717] ring-1 ring-[#171717]/10 hover:bg-[#4d6b97]/10",
                                            )}
                                        >
                                            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] opacity-80">
                                                {day.weekdayShort}
                                            </span>
                                            <span className="mt-1 text-xl font-semibold leading-none">{day.dayNumber}</span>
                                            <span className="mt-1 text-[10px] uppercase tracking-[0.04em] opacity-70">
                                                {day.monthShort}
                                            </span>
                                            {full ? (
                                                <span className="mt-2 text-[9px] font-medium uppercase tracking-[0.06em]">
                                                    {locale === "en" ? "Full" : "Complet"}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-semibold text-[#404040]">
                                {selectedDayMeta
                                    ? locale === "en"
                                        ? `Times · ${selectedDayMeta.weekdayShort} ${selectedDayMeta.dayNumber} ${selectedDayMeta.monthShort}`
                                        : `Horaires · ${selectedDayMeta.weekdayShort} ${selectedDayMeta.dayNumber} ${selectedDayMeta.monthShort}`
                                    : locale === "en"
                                      ? "Available times"
                                      : "Horaires disponibles"}
                            </p>
                            {daySlots.length === 0 ? (
                                <p className="mt-3 text-sm text-[#737373]">
                                    {locale === "en"
                                        ? "No openings on this day."
                                        : "Aucun créneau ce jour-là."}
                                </p>
                            ) : (
                                <ul className="mt-3 flex max-w-md flex-col gap-2">
                                    {daySlots.map((slot) => {
                                        const active = selected?.startsAt === slot.startsAt;
                                        return (
                                            <li key={slot.startsAt}>
                                                <button
                                                    type="button"
                                                    disabled={pending}
                                                    onClick={() => selectSlot(slot)}
                                                    className={cx(
                                                        "w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition duration-100 ease-linear",
                                                        active
                                                            ? "bg-[#253353] text-white"
                                                            : "bg-white text-[#171717] ring-1 ring-[#171717]/10 hover:bg-[#4d6b97]/10",
                                                    )}
                                                >
                                                    {slot.timeLabel}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        {selected ? (
                            <div className="flex max-w-md flex-col gap-4 border-t border-[#171717]/10 pt-5">
                                <p className="text-sm text-[#404040]">
                                    {locale === "en" ? "Confirming" : "Confirmation"} ·{" "}
                                    <span className="font-medium text-[#171717]">{selected.label}</span>
                                </p>
                                <Input
                                    isRequired
                                    label={booking.required_fields.find((f) => f.id === "name")?.label_fr || "Nom"}
                                    value={name}
                                    autoComplete="name"
                                    onChange={setName}
                                />
                                <Input
                                    isRequired
                                    label={
                                        locale === "en"
                                            ? "Email"
                                            : booking.required_fields.find((f) => f.id === "email")?.label_fr ||
                                              "Courriel"
                                    }
                                    value={email}
                                    autoComplete="email"
                                    inputMode="email"
                                    onChange={setEmail}
                                />
                                <Input
                                    isRequired
                                    label={t("capturePhone")}
                                    value={phone}
                                    autoComplete="tel"
                                    inputMode="tel"
                                    onChange={setPhone}
                                />
                                <Input
                                    label={
                                        booking.optional_fields.find((f) => f.id === "company")?.label_fr || "Entreprise"
                                    }
                                    value={company}
                                    autoComplete="organization"
                                    onChange={setCompany}
                                />
                                <CobreoButton size="lg" className="self-start" disabled={pending} onClick={onConfirm}>
                                    {pending
                                        ? locale === "en"
                                            ? "Confirming…"
                                            : "Confirmation…"
                                        : pickLocalized(booking as Record<string, unknown>, "cta", locale) ||
                                          booking.cta_fr}
                                </CobreoButton>
                                <p className="text-xs text-[#737373]">
                                    {locale === "en"
                                        ? "We’ll re-check availability, lock the slot, then send your calendar invitation."
                                        : "On revérifie la disponibilité, on verrouille le créneau, puis on envoie l’invitation calendrier."}
                                </p>
                            </div>
                        ) : null}

                        {error ? <p className="text-sm text-[#b42318]">{error}</p> : null}
                    </div>
                )}
            </div>
        </section>
    );
}
