"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Toggle } from "@/components/base/toggle/toggle";
import { saveBookingAvailabilityRule } from "@/app/actions/admin";
import { cx } from "@/utils/cx";

export type AdminBookingRule = {
    id: string;
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

export type AdminUpcomingBooking = {
    id: string;
    starts_at: string;
    timezone: string;
    status: string;
    prospect_name: string;
    prospect_email: string;
    company_name: string | null;
};

const WEEKDAYS = [
    { id: 1, fr: "Lun", en: "Mon" },
    { id: 2, fr: "Mar", en: "Tue" },
    { id: 3, fr: "Mer", en: "Wed" },
    { id: 4, fr: "Jeu", en: "Thu" },
    { id: 5, fr: "Ven", en: "Fri" },
    { id: 6, fr: "Sam", en: "Sat" },
    { id: 0, fr: "Dim", en: "Sun" },
] as const;

function defaultRule(): Omit<AdminBookingRule, "id"> {
    return {
        name: "Cobreo — appels découverte 15 min",
        timezone: "America/Toronto",
        duration_minutes: 15,
        buffer_minutes: 0,
        notice_minutes: 120,
        horizon_days: 14,
        max_slots_displayed: 24,
        weekdays: [1, 2, 3, 4, 5],
        windows: [
            { start: "09:00", end: "12:00" },
            { start: "13:00", end: "17:00" },
        ],
        is_active: true,
    };
}

export function AdminBookingSettings({
    rule,
    upcoming,
}: {
    rule: AdminBookingRule | null;
    upcoming: AdminUpcomingBooking[];
}) {
    const t = useTranslations("admin");
    const locale = useLocale();
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const initial = useMemo(() => rule || { id: "", ...defaultRule() }, [rule]);
    const [name, setName] = useState(initial.name);
    const [timezone, setTimezone] = useState(initial.timezone);
    const [duration, setDuration] = useState(String(initial.duration_minutes));
    const [buffer, setBuffer] = useState(String(initial.buffer_minutes));
    const [notice, setNotice] = useState(String(initial.notice_minutes));
    const [horizon, setHorizon] = useState(String(initial.horizon_days));
    const [maxSlots, setMaxSlots] = useState(String(initial.max_slots_displayed));
    const [weekdays, setWeekdays] = useState<number[]>(initial.weekdays);
    const [windows, setWindows] = useState(initial.windows);
    const [ruleActive, setRuleActive] = useState(initial.is_active);

    function toggleWeekday(day: number) {
        setWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
    }

    function saveRule() {
        setMessage(null);
        setError(null);
        startTransition(async () => {
            const result = await saveBookingAvailabilityRule({
                id: rule?.id,
                name,
                timezone,
                duration_minutes: Number(duration),
                buffer_minutes: Number(buffer),
                notice_minutes: Number(notice),
                horizon_days: Number(horizon),
                max_slots_displayed: Number(maxSlots),
                weekdays,
                windows,
                is_active: ruleActive,
            });
            if (!result.ok) {
                setError(result.error === "invalid" ? t("bookingInvalid") : t("actionError"));
                return;
            }
            setMessage(t("bookingSaved"));
            router.refresh();
        });
    }

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h2 className="text-display-xs font-semibold text-primary">{t("bookingTitle")}</h2>
                <p className="mt-2 max-w-2xl text-sm text-secondary">{t("bookingIntro")}</p>
            </div>

            {message ? <p className="text-sm text-success-primary">{message}</p> : null}
            {error ? <p className="text-sm text-error-primary">{error}</p> : null}

            <section className="rounded-xl bg-primary p-5 shadow-sm ring-1 ring-secondary md:p-6">
                <h3 className="text-lg font-semibold text-primary">{t("bookingAvailability")}</h3>
                <p className="mt-1 text-sm text-tertiary">{t("bookingAvailabilityHint")}</p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <Input label={t("bookingRuleName")} value={name} onChange={setName} />
                    <Input label={t("bookingTimezone")} value={timezone} onChange={setTimezone} hint="America/Toronto" />
                    <Input label={t("bookingDuration")} value={duration} onChange={setDuration} />
                    <Input label={t("bookingBuffer")} value={buffer} onChange={setBuffer} />
                    <Input label={t("bookingNotice")} value={notice} onChange={setNotice} />
                    <Input label={t("bookingHorizon")} value={horizon} onChange={setHorizon} />
                    <Input label={t("bookingMaxSlots")} value={maxSlots} onChange={setMaxSlots} />
                </div>

                <div className="mt-5">
                    <p className="text-sm font-medium text-secondary">{t("bookingWeekdays")}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {WEEKDAYS.map((day) => {
                            const active = weekdays.includes(day.id);
                            return (
                                <button
                                    key={day.id}
                                    type="button"
                                    onClick={() => toggleWeekday(day.id)}
                                    className={cx(
                                        "rounded-lg px-3 py-1.5 text-sm font-medium ring-1",
                                        active
                                            ? "bg-brand-solid text-white ring-brand-solid"
                                            : "bg-primary text-secondary ring-secondary hover:bg-secondary",
                                    )}
                                >
                                    {locale === "en" ? day.en : day.fr}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-5">
                    <p className="text-sm font-medium text-secondary">{t("bookingWindows")}</p>
                    <div className="mt-2 flex flex-col gap-3">
                        {windows.map((window, index) => (
                            <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                                <Input
                                    label={t("bookingWindowStart")}
                                    value={window.start}
                                    onChange={(value) =>
                                        setWindows((prev) =>
                                            prev.map((w, i) => (i === index ? { ...w, start: value } : w)),
                                        )
                                    }
                                />
                                <Input
                                    label={t("bookingWindowEnd")}
                                    value={window.end}
                                    onChange={(value) =>
                                        setWindows((prev) =>
                                            prev.map((w, i) => (i === index ? { ...w, end: value } : w)),
                                        )
                                    }
                                />
                                <div className="flex items-end pb-1">
                                    <Button
                                        color="secondary"
                                        size="md"
                                        isDisabled={windows.length <= 1}
                                        onClick={() => setWindows((prev) => prev.filter((_, i) => i !== index))}
                                    >
                                        {t("bookingRemoveWindow")}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button
                        color="secondary"
                        size="sm"
                        className="mt-3"
                        onClick={() => setWindows((prev) => [...prev, { start: "09:00", end: "12:00" }])}
                    >
                        {t("bookingAddWindow")}
                    </Button>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                    <Toggle
                        label={t("bookingRuleActive")}
                        isSelected={ruleActive}
                        onChange={setRuleActive}
                    />
                    <Button color="primary" size="md" isDisabled={pending} onClick={saveRule}>
                        {t("bookingSaveRule")}
                    </Button>
                </div>
            </section>

            <section className="rounded-xl bg-primary p-5 shadow-sm ring-1 ring-secondary md:p-6">
                <h3 className="text-lg font-semibold text-primary">{t("bookingUpcoming")}</h3>
                {upcoming.length === 0 ? (
                    <p className="mt-3 text-sm text-tertiary">{t("bookingUpcomingEmpty")}</p>
                ) : (
                    <ul className="mt-4 flex flex-col gap-3">
                        {upcoming.map((item) => (
                            <li
                                key={item.id}
                                className="rounded-lg bg-secondary/40 px-4 py-3 text-sm ring-1 ring-secondary"
                            >
                                <p className="font-medium text-primary">
                                    {new Date(item.starts_at).toLocaleString(locale, {
                                        timeZone: item.timezone,
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                    {" · "}
                                    {item.status}
                                </p>
                                <p className="mt-1 text-secondary">
                                    {item.prospect_name}
                                    {item.company_name ? ` · ${item.company_name}` : ""}
                                </p>
                                <p className="text-tertiary">{item.prospect_email}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
