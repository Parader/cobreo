import type { StageId } from "./types";

/** Stages offered on the first-screen picker */
export const SELECTABLE_STAGES: { id: StageId; order: number }[] = [
    { id: "acquisition", order: 1 },
    { id: "conversion", order: 2 },
    { id: "delivery", order: 3 },
    { id: "coordination", order: 4 },
    { id: "admin", order: 5 },
    { id: "tools", order: 6 },
    { id: "team", order: 7 },
];

export const STAGES = SELECTABLE_STAGES;
