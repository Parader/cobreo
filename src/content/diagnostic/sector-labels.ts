import type { SectorId, StageId } from "@/content/diagnostic/types";

/** Sector-specific vocabulary for stage names (overlay, same questions). */
const STAGE_LABEL_KEYS: Record<SectorId, Record<StageId, string>> = {
    generic: {
        acquisition: "stages.acquisition",
        conversion: "stages.conversion",
        delivery: "stages.delivery",
        coordination: "stages.coordination",
        admin: "stages.admin",
        tools: "stages.tools",
        team: "stages.team",
    },
    construction: {
        acquisition: "stagesSector.construction.acquisition",
        conversion: "stagesSector.construction.conversion",
        delivery: "stagesSector.construction.delivery",
        coordination: "stagesSector.construction.coordination",
        admin: "stagesSector.construction.admin",
        tools: "stages.tools",
        team: "stages.team",
    },
    clinic: {
        acquisition: "stagesSector.clinic.acquisition",
        conversion: "stagesSector.clinic.conversion",
        delivery: "stagesSector.clinic.delivery",
        coordination: "stagesSector.clinic.coordination",
        admin: "stagesSector.clinic.admin",
        tools: "stages.tools",
        team: "stages.team",
    },
    professional: {
        acquisition: "stagesSector.professional.acquisition",
        conversion: "stagesSector.professional.conversion",
        delivery: "stagesSector.professional.delivery",
        coordination: "stagesSector.professional.coordination",
        admin: "stagesSector.professional.admin",
        tools: "stages.tools",
        team: "stages.team",
    },
};

export function stageLabelKey(sector: SectorId, stage: StageId): string {
    return STAGE_LABEL_KEYS[sector][stage] ?? STAGE_LABEL_KEYS.generic[stage];
}
