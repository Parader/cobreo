export type AvailabilityWindow = { start: string; end: string };

export type BookingAvailabilityRule = {
    id: string;
    name: string;
    timezone: string;
    duration_minutes: number;
    buffer_minutes: number;
    notice_minutes: number;
    horizon_days: number;
    max_slots_displayed: number;
    weekdays: number[];
    windows: AvailabilityWindow[];
    is_active: boolean;
};

export type AvailableSlot = {
    startsAt: string;
    endsAt: string;
    timezone: string;
    label: string;
    /** Local calendar day key in the rule timezone (YYYY-MM-DD). */
    dateKey: string;
    /** Time-only label for list UIs (e.g. "10:30"). */
    timeLabel: string;
};

export type BookingDay = {
    dateKey: string;
    weekdayShort: string;
    dayNumber: string;
    monthShort: string;
    status: "open" | "full";
    slotCount: number;
};

export type BookingConfirmInput = {
    holdToken: string;
    startsAt: string;
    endsAt: string;
    timezone: string;
    name: string;
    email: string;
    phone: string;
    company?: string;
    locale: string;
    summary: string;
    answers: unknown;
    declaredAmbitions: string[];
    selectedSections: Array<{ areaId: string; title: string }>;
    suggestedServices: Array<{ id: string; label: string }>;
};

function parseHm(value: string): { h: number; m: number } {
    const [h, m] = value.split(":").map((part) => Number(part));
    return { h: h || 0, m: m || 0 };
}

/** Convert a local wall-clock in `timeZone` to a UTC Date. */
export function zonedLocalToUtc(
    year: number,
    monthIndex: number,
    day: number,
    hour: number,
    minute: number,
    timeZone: string,
): Date {
    const rough = new Date(Date.UTC(year, monthIndex, day, hour, minute, 0));
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    }).formatToParts(rough);
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value || 0);
    const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
    const offset = asUtc - rough.getTime();
    return new Date(rough.getTime() - offset);
}

function ymdInZone(date: Date, timeZone: string) {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
    }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
    const weekdayMap: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };
    return {
        year: Number(get("year")),
        monthIndex: Number(get("month")) - 1,
        day: Number(get("day")),
        weekday: weekdayMap[get("weekday")] ?? 0,
    };
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
    return aStart < bEnd && bStart < aEnd;
}

export function formatSlotLabel(iso: string, timeZone: string, locale: string): string {
    return new Intl.DateTimeFormat(locale === "en" ? "en-CA" : "fr-CA", {
        timeZone,
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(iso));
}

export function formatTimeLabel(iso: string, timeZone: string, locale: string): string {
    return new Intl.DateTimeFormat(locale === "en" ? "en-CA" : "fr-CA", {
        timeZone,
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(iso));
}

export function dateKeyInZone(iso: string, timeZone: string): string {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date(iso));
}

function localHourInZone(iso: string, timeZone: string): number {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "2-digit",
        hourCycle: "h23",
    }).formatToParts(new Date(iso));
    return Number(parts.find((p) => p.type === "hour")?.value || 0);
}

function hashString(value: string): number {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

/** Fixed salt — never use Math.random / clock, so refresh always shows the same “taken” slots. */
const DEMAND_SALT = "cobreo-booking-demand-v1";

function demandUnit(key: string): number {
    return (hashString(`${DEMAND_SALT}:${key}`) % 10_000) / 10_000;
}

/**
 * Deterministic scarcity: hides some otherwise-free slots so the calendar looks busy.
 * Pure function of slot start times (+ timezone for hour/weekday weight). Refresh-safe.
 * Tuned light: most openings stay visible; a minority look taken.
 */
export function applyTrafficScarcity(
    slots: AvailableSlot[],
    opts: {
        timezone: string;
        /** Fraction of slots to keep after demand (default ~0.72). */
        keepRatio?: number;
        minKeep?: number;
    },
): AvailableSlot[] {
    if (slots.length === 0) return slots;

    const tz = opts.timezone;
    const baseKeep = opts.keepRatio ?? 0.72;
    const minKeep = Math.min(slots.length, opts.minKeep ?? Math.max(8, Math.ceil(slots.length * 0.55)));

    const dayFullness = new Map<string, number>();
    for (const slot of slots) {
        if (!dayFullness.has(slot.dateKey)) {
            dayFullness.set(slot.dateKey, demandUnit(`day:${slot.dateKey}`));
        }
    }

    const kept: AvailableSlot[] = [];
    const dropped: AvailableSlot[] = [];

    for (const slot of slots) {
        const roll = demandUnit(`slot:${slot.startsAt}`);
        const hour = localHourInZone(slot.startsAt, tz);
        const fullness = dayFullness.get(slot.dateKey) ?? 0.5;

        let keepChance = baseKeep;
        keepChance -= fullness * 0.12;
        if (hour >= 10 && hour < 12) keepChance -= 0.06;
        if (hour >= 13 && hour < 15) keepChance -= 0.08;
        if (hour === 9) keepChance += 0.06;
        if (hour >= 16) keepChance += 0.04;
        // Fridays feel slightly busier
        const weekday = ymdInZone(new Date(slot.startsAt), tz).weekday;
        if (weekday === 5) keepChance -= 0.05;

        keepChance = Math.max(0.45, Math.min(0.92, keepChance));
        if (roll < keepChance) kept.push(slot);
        else dropped.push(slot);
    }

    if (kept.length < minKeep) {
        const need = minKeep - kept.length;
        kept.push(...dropped.slice(0, need));
        kept.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    }

    // Occasionally mark one quieter day as “full” — light touch only
    const dayKeys = [...new Set(kept.map((s) => s.dateKey))].sort();
    if (dayKeys.length <= 2) return kept;

    const wipe = new Set<string>();
    for (const key of dayKeys) {
        if (demandUnit(`fullday:${key}`) < 0.12) wipe.add(key);
    }
    // Never wipe more than one day, and always leave ≥2 bookable days
    if (wipe.size > 1) {
        const keepWiped = dayKeys.find((k) => wipe.has(k));
        wipe.clear();
        if (keepWiped) wipe.add(keepWiped);
    }
    while (wipe.size >= dayKeys.length - 1) {
        const spare = dayKeys.find((k) => wipe.has(k));
        if (!spare) break;
        wipe.delete(spare);
    }

    if (wipe.size === 0) return kept;

    const remaining = kept.filter((s) => !wipe.has(s.dateKey));
    if (remaining.length >= Math.min(minKeep, 8)) return remaining;

    return kept;
}

export function buildBookingDays(input: {
    openDateKeys: string[];
    slots: AvailableSlot[];
    timezone: string;
    locale?: string;
}): BookingDay[] {
    const locale = input.locale || "fr";
    const byDay = new Map<string, number>();
    for (const slot of input.slots) {
        byDay.set(slot.dateKey, (byDay.get(slot.dateKey) || 0) + 1);
    }

    return input.openDateKeys.map((dateKey) => {
        const [y, m, d] = dateKey.split("-").map(Number);
        const noon = zonedLocalToUtc(y!, (m || 1) - 1, d || 1, 12, 0, input.timezone);
        const weekdayShort = new Intl.DateTimeFormat(locale === "en" ? "en-CA" : "fr-CA", {
            timeZone: input.timezone,
            weekday: "short",
        }).format(noon);
        const dayNumber = new Intl.DateTimeFormat(locale === "en" ? "en-CA" : "fr-CA", {
            timeZone: input.timezone,
            day: "numeric",
        }).format(noon);
        const monthShort = new Intl.DateTimeFormat(locale === "en" ? "en-CA" : "fr-CA", {
            timeZone: input.timezone,
            month: "short",
        }).format(noon);
        const slotCount = byDay.get(dateKey) || 0;
        return {
            dateKey,
            weekdayShort,
            dayNumber,
            monthShort,
            status: slotCount > 0 ? ("open" as const) : ("full" as const),
            slotCount,
        };
    });
}

export function generateCandidateSlots(input: {
    rule: BookingAvailabilityRule;
    now?: Date;
    locale?: string;
    busy: Array<{ starts_at: string; ends_at: string }>;
    /** When true (default), hide some free slots to simulate demand. */
    simulateTraffic?: boolean;
}): { slots: AvailableSlot[]; days: BookingDay[] } {
    const now = input.now || new Date();
    const locale = input.locale || "fr";
    const tz = input.rule.timezone;
    const durationMs = input.rule.duration_minutes * 60_000;
    const bufferMs = input.rule.buffer_minutes * 60_000;
    const earliest = now.getTime() + input.rule.notice_minutes * 60_000;
    const raw: AvailableSlot[] = [];
    const openDateKeys: string[] = [];
    const seenDays = new Set<string>();

    for (let dayOffset = 0; dayOffset <= input.rule.horizon_days; dayOffset++) {
        const probe = new Date(now.getTime() + dayOffset * 86_400_000);
        const local = ymdInZone(probe, tz);
        if (!input.rule.weekdays.includes(local.weekday)) continue;

        const dateKey = `${local.year}-${String(local.monthIndex + 1).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;
        if (!seenDays.has(dateKey)) {
            seenDays.add(dateKey);
            openDateKeys.push(dateKey);
        }

        for (const window of input.rule.windows) {
            const startHm = parseHm(window.start);
            const endHm = parseHm(window.end);
            let cursor = zonedLocalToUtc(
                local.year,
                local.monthIndex,
                local.day,
                startHm.h,
                startHm.m,
                tz,
            ).getTime();
            const windowEnd = zonedLocalToUtc(
                local.year,
                local.monthIndex,
                local.day,
                endHm.h,
                endHm.m,
                tz,
            ).getTime();

            while (cursor + durationMs <= windowEnd) {
                const start = cursor;
                const end = cursor + durationMs;
                cursor += durationMs + bufferMs;

                if (start < earliest) continue;

                const conflict = input.busy.some((b) =>
                    overlaps(start, end, new Date(b.starts_at).getTime(), new Date(b.ends_at).getTime()),
                );
                if (conflict) continue;

                const startsAt = new Date(start).toISOString();
                raw.push({
                    startsAt,
                    endsAt: new Date(end).toISOString(),
                    timezone: tz,
                    label: formatSlotLabel(startsAt, tz, locale),
                    dateKey,
                    timeLabel: formatTimeLabel(startsAt, tz, locale),
                });
            }
        }
    }

    // Drop open days that never produced a raw slot (entirely in the past / notice window)
    const rawDays = new Set(raw.map((s) => s.dateKey));
    const actionableDays = openDateKeys.filter((k) => rawDays.has(k));

    if (input.simulateTraffic === false) {
        const slots = raw.slice(0, input.rule.max_slots_displayed);
        return {
            slots,
            days: buildBookingDays({
                openDateKeys: actionableDays,
                slots,
                timezone: tz,
                locale,
            }),
        };
    }

    const afterDemand = applyTrafficScarcity(raw, {
        timezone: tz,
        keepRatio: 0.72,
        minKeep: Math.min(raw.length, Math.max(12, Math.ceil(raw.length * 0.55))),
    });

    // Scarcity is the main limiter; soft-cap only for safety
    const slots = afterDemand.slice(0, 64);
    const days = buildBookingDays({
        openDateKeys: actionableDays,
        slots,
        timezone: tz,
        locale,
    });

    return { slots, days };
}

export function randomHoldToken() {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(24));
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
