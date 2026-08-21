import type { AnswerType, AnswerValue, StoredAnswer } from "./types";

/** Higher = more friction / opportunity signal */
export const FREQUENCY_SCORES = {
    never: 0,
    rarely: 1,
    sometimes: 2,
    often: 3,
    very_often: 4,
} as const;

export const AGREEMENT_SCORES = {
    not_at_all: 0,
    little: 1,
    somewhat: 2,
    a_lot: 3,
    completely: 4,
} as const;

/** Ease: harder = more friction */
export const EASE_SCORES = {
    very_hard: 4,
    hard: 3,
    acceptable: 2,
    easy: 1,
    very_easy: 0,
} as const;

export const YES_PARTIAL_NO_SCORES = {
    yes: 4,
    partial: 2,
    no: 0,
} as const;

export const CHANNEL_OPTIONS: AnswerValue[] = [
    "phone",
    "email",
    "web_form",
    "messaging",
    "social",
    "referral",
    "walk_in",
    "other",
];

export const ANSWER_OPTIONS: Record<AnswerType, AnswerValue[]> = {
    frequency: ["never", "rarely", "sometimes", "often", "very_often"],
    agreement: ["not_at_all", "little", "somewhat", "a_lot", "completely"],
    ease: ["very_hard", "hard", "acceptable", "easy", "very_easy"],
    yesPartialNo: ["yes", "partial", "no"],
    channels: CHANNEL_OPTIONS,
};

export function isMultiAnswerType(answerType: AnswerType): boolean {
    return answerType === "channels";
}

/** More distinct inbound channels → higher fragmentation signal (capped at 4) */
export function intensityForChannels(selected: AnswerValue[]): number {
    const n = selected.length;
    if (n <= 0) return 0;
    if (n === 1) return 1;
    if (n === 2) return 2;
    if (n === 3) return 3;
    return 4;
}

export function intensityForAnswer(answerType: AnswerType, value: StoredAnswer): number {
    if (answerType === "channels") {
        const list = Array.isArray(value) ? value : value ? [value] : [];
        return intensityForChannels(list);
    }

    const single = Array.isArray(value) ? value[0] : value;
    if (!single) return 0;

    switch (answerType) {
        case "frequency":
            return FREQUENCY_SCORES[single as keyof typeof FREQUENCY_SCORES] ?? 0;
        case "agreement":
            return AGREEMENT_SCORES[single as keyof typeof AGREEMENT_SCORES] ?? 0;
        case "ease":
            return EASE_SCORES[single as keyof typeof EASE_SCORES] ?? 0;
        case "yesPartialNo":
            return YES_PARTIAL_NO_SCORES[single as keyof typeof YES_PARTIAL_NO_SCORES] ?? 0;
        default:
            return 0;
    }
}

export function asMultiValue(value: StoredAnswer | undefined): AnswerValue[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}
