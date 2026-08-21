import {
    applyTrafficScarcity,
    generateCandidateSlots,
    type AvailableSlot,
    type BookingAvailabilityRule,
} from "@/lib/booking/availability";

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(`[booking selftest] ${message}`);
}

const rule: BookingAvailabilityRule = {
    id: "test",
    name: "test",
    timezone: "America/Toronto",
    duration_minutes: 15,
    buffer_minutes: 0,
    notice_minutes: 0,
    horizon_days: 7,
    max_slots_displayed: 12,
    weekdays: [1, 2, 3, 4, 5],
    windows: [
        { start: "09:00", end: "12:00" },
        { start: "13:00", end: "17:00" },
    ],
    is_active: true,
};

// Fixed Monday morning in Toronto
const now = new Date("2026-08-17T12:00:00.000Z"); // Monday ~8am ET in Aug
const { slots, days } = generateCandidateSlots({
    rule,
    now,
    locale: "fr",
    busy: [],
    simulateTraffic: false,
});

assert(slots.length > 0, "generates slots");
assert(slots.length <= 12, "respects max displayed without traffic");
assert(slots.every((s) => new Date(s.endsAt) > new Date(s.startsAt)), "valid ranges");
assert(slots.every((s) => s.dateKey && s.timeLabel), "slot has dateKey + timeLabel");
assert(days.length > 0, "builds calendar days");

const blockedStart = slots[0]!.startsAt;
const blocked = generateCandidateSlots({
    rule,
    now,
    locale: "fr",
    busy: [{ starts_at: blockedStart, ends_at: slots[0]!.endsAt }],
    simulateTraffic: false,
});
assert(
    !blocked.slots.some((s) => s.startsAt === blockedStart),
    "busy interval removes slot",
);

const withTraffic = generateCandidateSlots({
    rule: { ...rule, max_slots_displayed: 48, horizon_days: 10 },
    now,
    locale: "fr",
    busy: [],
    simulateTraffic: true,
});
const raw = generateCandidateSlots({
    rule: { ...rule, max_slots_displayed: 200, horizon_days: 10 },
    now,
    locale: "fr",
    busy: [],
    simulateTraffic: false,
});
assert(withTraffic.slots.length < raw.slots.length, "traffic scarcity removes some slots");
const filtered = applyTrafficScarcity(raw.slots, { timezone: rule.timezone, keepRatio: 0.72 });
assert(filtered.length < raw.slots.length, "scarcity drops some openings");
assert(filtered.length >= Math.floor(raw.slots.length * 0.55), "scarcity keeps most openings");

const again = applyTrafficScarcity(raw.slots as AvailableSlot[], {
    timezone: rule.timezone,
});
const again2 = applyTrafficScarcity(raw.slots as AvailableSlot[], {
    timezone: rule.timezone,
});
assert(
    again.map((s) => s.startsAt).join("|") === again2.map((s) => s.startsAt).join("|"),
    "scarcity is deterministic across calls",
);

const a = generateCandidateSlots({
    rule: { ...rule, max_slots_displayed: 200, horizon_days: 10 },
    now,
    locale: "fr",
    busy: [],
    simulateTraffic: true,
});
const b = generateCandidateSlots({
    rule: { ...rule, max_slots_displayed: 200, horizon_days: 10 },
    now,
    locale: "fr",
    busy: [],
    simulateTraffic: true,
});
assert(
    a.slots.map((s) => s.startsAt).join("|") === b.slots.map((s) => s.startsAt).join("|"),
    "refresh with same clock yields identical slots",
);

console.log("booking selftests passed", {
    count: slots.length,
    first: slots[0]?.label,
    traffic: withTraffic.slots.length,
    days: withTraffic.days.length,
});
