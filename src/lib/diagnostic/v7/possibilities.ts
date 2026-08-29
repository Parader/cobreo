import { getScanAnswers } from "@/content/diagnostic/v7/catalog";
import {
    diagnosticSpecV7,
    type AmbitionId,
    type AreaAnswerValue,
    type AreaId,
    type AutomationInterest,
    type CompanyContext,
    type PossibilityCandidate,
    type PossibilitySourceTier,
    type ProspectServiceId,
    type SelectedPossibility,
} from "@/content/diagnostic/v7/types";
import { isSoloCompany } from "./coverage";
import { AMBITION_AREAS } from "./ambition-areas";

const MAX_CARDS = 9;
const MIN_CANDIDATES = 4;
const PREFER_SECTIONS = 3;

const TIER_RANK: Record<PossibilitySourceTier, number> = {
    observed: 3,
    emerging: 2,
    suggested: 1,
};

const AREA_ORDER: AreaId[] = [
    "leadership_performance",
    "sales_growth",
    "clients_service",
    "work_operations",
    "team_people",
    "finance_profitability",
    "information_ways",
    "offer_development",
    "tools_systems",
];

export type PossibilityLibraryItem = {
    id: string;
    label_fr: string;
    services: ProspectServiceId[];
};

export type PossibilityLibraryArea = {
    section_fr: string;
    possibilities: PossibilityLibraryItem[];
};

export type PossibilityLibrary = Partial<Record<AreaId, PossibilityLibraryArea>>;

type RawLibrary = Record<string, unknown>;

function isAreaId(id: string): id is AreaId {
    return (AREA_ORDER as string[]).includes(id);
}

/** Read v8 possibility library from the active diagnostic spec. */
export function getPossibilityLibrary(): PossibilityLibrary {
    const raw = (diagnosticSpecV7 as { v8_possibility_library?: RawLibrary }).v8_possibility_library;
    if (!raw || typeof raw !== "object") return {};

    const out: PossibilityLibrary = {};
    for (const [key, value] of Object.entries(raw)) {
        if (key === "library_rule" || !value || typeof value !== "object") continue;
        if (!isAreaId(key)) continue;
        const section = value as { section_fr?: string; possibilities?: unknown[] };
        const items = Array.isArray(section.possibilities) ? section.possibilities : [];
        out[key] = {
            section_fr: String(section.section_fr || key),
            possibilities: items
                .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
                .map((item) => ({
                    id: String(item.id),
                    label_fr: String(item.label_fr || item.id),
                    services: (Array.isArray(item.services) ? item.services : []) as ProspectServiceId[],
                })),
        };
    }
    return out;
}

function exclusiveIds(areaId: AreaId): Set<string> {
    return new Set(
        getScanAnswers(areaId)
            .filter(
                (a) =>
                    a.exclusive ||
                    /^(no_|too_early|not_|informal_|none_)/.test(a.id) ||
                    a.id === "no_overview" ||
                    a.id === "no_tools" ||
                    a.id === "no_formal_sales",
            )
            .map((a) => a.id),
    );
}

function positiveSignals(areaId: AreaId, answers: string[]): string[] {
    const excl = exclusiveIds(areaId);
    return answers.filter((id) => !excl.has(id) && id !== "other" && id !== "none");
}

function isEarlyStage(stage?: string): boolean {
    return stage === "testing" || stage === "early";
}

function hasEmergingAnswer(answers: string[]): boolean {
    return answers.some((id) => /^(too_early|not_yet|not_)/.test(id));
}

function ambitionAreaSet(declared: AmbitionId[] | undefined): Set<AreaId> {
    const set = new Set<AreaId>();
    for (const id of declared || []) {
        for (const area of AMBITION_AREAS[id] || []) set.add(area);
    }
    return set;
}

function allowTeamPeople(companyContext: CompanyContext, declared: AmbitionId[] | undefined): boolean {
    if (!isSoloCompany(companyContext.company_size)) return true;
    const ambitions = declared || [];
    return ambitions.includes("prepare_growth") || ambitions.includes("improve_team");
}

function candidateId(areaId: AreaId, possibilityId: string): string {
    return `${areaId}:${possibilityId}`;
}

function makeCandidate(
    areaId: AreaId,
    item: PossibilityLibraryItem,
    sectionLabel: string,
    sourceTier: PossibilitySourceTier,
    score: number,
): PossibilityCandidate {
    return {
        id: candidateId(areaId, item.id),
        possibilityId: item.id,
        areaId,
        sectionLabel,
        label: item.label_fr,
        sourceTier,
        services: item.services,
        score,
    };
}

function preferBetter(existing: PossibilityCandidate | undefined, next: PossibilityCandidate): PossibilityCandidate {
    if (!existing) return next;
    if (TIER_RANK[next.sourceTier] > TIER_RANK[existing.sourceTier]) return next;
    if (TIER_RANK[next.sourceTier] < TIER_RANK[existing.sourceTier]) return existing;
    if (next.score !== existing.score) return next.score > existing.score ? next : existing;
    return next.id < existing.id ? next : existing;
}

function sortCandidates(list: PossibilityCandidate[]): PossibilityCandidate[] {
    return [...list].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.id.localeCompare(b.id);
    });
}

function automationBoostAreas(automationInterest: AutomationInterest): Set<AreaId> {
    const tasks = (automationInterest.tasks || []).filter((t) => t !== "none");
    if (tasks.length === 0) return new Set();
    const areas = new Set<AreaId>(["work_operations"]);
    if (tasks.some((t) => t === "copy_transfer" || t === "find_combine" || t === "reports" || t === "documents")) {
        areas.add("information_ways");
    }
    if (tasks.some((t) => t === "followups" || t === "scheduling")) {
        areas.add("clients_service");
    }
    areas.add("tools_systems");
    return areas;
}

/**
 * Diversify selection: prefer ≥3 sections, then fill by score; cap at MAX_CARDS.
 */
function diversifySelect(sorted: PossibilityCandidate[], max: number): PossibilityCandidate[] {
    if (sorted.length <= max) return sorted;

    const selected: PossibilityCandidate[] = [];
    const selectedIds = new Set<string>();
    const areaCounts = new Map<AreaId, number>();

    const take = (c: PossibilityCandidate) => {
        if (selectedIds.has(c.id) || selected.length >= max) return;
        selected.push(c);
        selectedIds.add(c.id);
        areaCounts.set(c.areaId, (areaCounts.get(c.areaId) || 0) + 1);
    };

    // First pass: one best candidate per area until we cover PREFER_SECTIONS areas
    for (const c of sorted) {
        if (areaCounts.size >= PREFER_SECTIONS) break;
        if (areaCounts.has(c.areaId)) continue;
        take(c);
    }

    // Second pass: fill remaining by score, still limiting per-area stacking (max 2 until list is full)
    for (const c of sorted) {
        if (selected.length >= max) break;
        const count = areaCounts.get(c.areaId) || 0;
        if (count >= 2 && selected.length < max - 1 && areaCounts.size < PREFER_SECTIONS) continue;
        if (count >= 3) continue;
        take(c);
    }

    // Final pass: ignore per-area cap to reach max
    for (const c of sorted) {
        if (selected.length >= max) break;
        take(c);
    }

    return sortCandidates(selected);
}

function fillFromLibrary(
    library: PossibilityLibrary,
    existing: Map<string, PossibilityCandidate>,
    allowedAreas: AreaId[],
    minNeeded: number,
): void {
    let scoreBase = 25;
    for (const areaId of allowedAreas) {
        if (existing.size >= minNeeded) break;
        const section = library[areaId];
        if (!section) continue;
        for (const item of section.possibilities) {
            if (existing.size >= minNeeded) break;
            const id = candidateId(areaId, item.id);
            if (existing.has(id)) continue;
            existing.set(
                id,
                makeCandidate(areaId, item, section.section_fr, "suggested", scoreBase),
            );
            scoreBase -= 1;
        }
    }
}

/**
 * Build 4–9 possibility cards for respondent review (v8).
 * Deterministic: no randomness; French labels from library `label_fr`.
 */
export function buildPossibilityCandidates(input: {
    companyContext: CompanyContext;
    declared?: AmbitionId[];
    areaAnswers: Partial<Record<AreaId, AreaAnswerValue>>;
    automationInterest: AutomationInterest;
    locale?: string;
}): PossibilityCandidate[] {
    const library = getPossibilityLibrary();
    const declared = input.declared || [];
    const ambitionAreas = ambitionAreaSet(declared);
    const early = isEarlyStage(input.companyContext.company_stage);
    const teamOk = allowTeamPeople(input.companyContext, declared);
    const autoAreas = automationBoostAreas(input.automationInterest);

    const allowedAreas = AREA_ORDER.filter((areaId) => {
        if (areaId === "team_people" && !teamOk) return false;
        return Boolean(library[areaId]);
    });

    const byId = new Map<string, PossibilityCandidate>();

    const upsert = (candidate: PossibilityCandidate) => {
        byId.set(candidate.id, preferBetter(byId.get(candidate.id), candidate));
    };

    // --- Observed: positive non-exclusive signals → top 1–2 library items ---
    for (const areaId of allowedAreas) {
        const answers = input.areaAnswers[areaId] || [];
        if (answers.length === 0) continue;
        const signals = positiveSignals(areaId, answers);
        if (signals.length === 0) continue;

        const section = library[areaId];
        if (!section) continue;

        const take = Math.min(2, section.possibilities.length);
        for (let i = 0; i < take; i++) {
            const item = section.possibilities[i];
            let score = 90 - i * 5 + Math.min(signals.length, 3);
            if (ambitionAreas.has(areaId)) score += 4;
            if (autoAreas.has(areaId) && item.services.includes("automation")) score += 2;
            upsert(makeCandidate(areaId, item, section.section_fr, "observed", score));
        }
    }

    // --- Emerging: ambition-aligned + early stage OR too_early/not_yet answers ---
    for (const areaId of allowedAreas) {
        if (!ambitionAreas.has(areaId)) continue;
        const answers = input.areaAnswers[areaId] || [];
        const emergingContext = early || hasEmergingAnswer(answers) || answers.length === 0;
        if (!emergingContext) continue;

        const section = library[areaId];
        if (!section) continue;

        // Prefer later library items so we don't duplicate the observed top picks as emerging
        const start = positiveSignals(areaId, answers).length > 0 ? Math.min(2, section.possibilities.length) : 0;
        const take = Math.min(2, section.possibilities.length - start);
        for (let i = 0; i < take; i++) {
            const item = section.possibilities[start + i];
            if (!item) continue;
            let score = 65 - i * 4;
            if (early) score += 3;
            if (hasEmergingAnswer(answers)) score += 2;
            upsert(makeCandidate(areaId, item, section.section_fr, "emerging", score));
        }
    }

    // --- Suggested: areas with few/no positive signals ---
    for (const areaId of allowedAreas) {
        const answers = input.areaAnswers[areaId] || [];
        const signals = positiveSignals(areaId, answers);
        const thin = signals.length === 0 || signals.length === 1;
        if (!thin) continue;

        // Skip areas that were never scanned and have no ambition pull (unless automation boost)
        const scanned = answers.length > 0;
        if (!scanned && !ambitionAreas.has(areaId) && !autoAreas.has(areaId)) continue;

        const section = library[areaId];
        if (!section) continue;

        const existingForArea = [...byId.values()].filter((c) => c.areaId === areaId).length;
        if (existingForArea >= 2) continue;

        const item = section.possibilities[Math.min(existingForArea, section.possibilities.length - 1)];
        if (!item) continue;
        if (byId.has(candidateId(areaId, item.id))) {
            const alt = section.possibilities.find((p) => !byId.has(candidateId(areaId, p.id)));
            if (!alt) continue;
            let score = 40 + (ambitionAreas.has(areaId) ? 5 : 0) + (autoAreas.has(areaId) ? 3 : 0);
            upsert(makeCandidate(areaId, alt, section.section_fr, "suggested", score));
            continue;
        }
        let score = 42 + (ambitionAreas.has(areaId) ? 5 : 0) + (autoAreas.has(areaId) ? 3 : 0);
        upsert(makeCandidate(areaId, item, section.section_fr, "suggested", score));
    }

    // --- Fill to minimum 4 ---
    if (byId.size < MIN_CANDIDATES) {
        fillFromLibrary(library, byId, allowedAreas, MIN_CANDIDATES);
    }

    const sorted = sortCandidates([...byId.values()]);
    return diversifySelect(sorted, MAX_CARDS);
}

/** Map selected candidate ids to structured selected possibilities (skips none_selected). */
export function resolveSelectedPossibilities(
    ids: Array<string | "none_selected">,
    candidates: PossibilityCandidate[],
): SelectedPossibility[] {
    if (ids.includes("none_selected")) return [];
    const byId = new Map(candidates.map((c) => [c.id, c]));
    const out: SelectedPossibility[] = [];
    const seen = new Set<string>();

    for (const id of ids) {
        if (id === "none_selected" || seen.has(id)) continue;
        const c = byId.get(id);
        if (!c) continue;
        seen.add(id);
        out.push({
            id: c.id,
            possibilityId: c.possibilityId,
            areaId: c.areaId,
            label: c.label,
            sectionLabel: c.sectionLabel,
            services: c.services,
        });
    }
    return out;
}
