import type {
    AreaId,
    PossibilitySourceTier,
    PriorityBand,
    ProspectServiceId,
    ServiceSectionCard,
} from "@/content/diagnostic/v7/types";

/** Inputs used to rank a result card by real business priority — not just list order. */
export type PrioritySignals = {
    areaId: AreaId;
    /** How many respondent-confirmed (or strongly observed) items sit in this area. */
    confirmedCount: number;
    bestTier: PossibilitySourceTier | null;
    services: ProspectServiceId[];
    /** Area overlaps declared ambitions. */
    ambitionAligned: boolean;
    /** Raw evidence / selection weight already computed upstream. */
    evidenceScore: number;
};

type RankedCard = ServiceSectionCard & {
    signals: PrioritySignals;
    priorityScore: number;
    factors: PriorityFactor[];
};

type PriorityFactor =
    | "confirmed_need"
    | "observed_signal"
    | "quick_win"
    | "foundation"
    | "ambition"
    | "growth_pain"
    | "structural_build"
    | "softer_signal";

const FOUNDATION_AREAS: AreaId[] = [
    "work_operations",
    "tools_systems",
    "information_ways",
    "finance_profitability",
];

const GROWTH_AREAS: AreaId[] = ["sales_growth", "clients_service", "offer_development"];

const QUICK_WIN_SERVICES: ProspectServiceId[] = ["automation", "operations_optimization"];

const STRUCTURAL_SERVICES: ProspectServiceId[] = ["custom_tool", "internal_tool"];

const TIER_WEIGHT: Record<PossibilitySourceTier, number> = {
    observed: 40,
    emerging: 22,
    suggested: 8,
};

function isFoundation(areaId: AreaId): boolean {
    return FOUNDATION_AREAS.includes(areaId);
}

function isGrowth(areaId: AreaId): boolean {
    return GROWTH_AREAS.includes(areaId);
}

function hasQuickWin(services: ProspectServiceId[]): boolean {
    return services.some((s) => QUICK_WIN_SERVICES.includes(s));
}

function hasStructuralBuild(services: ProspectServiceId[]): boolean {
    return services.some((s) => STRUCTURAL_SERVICES.includes(s));
}

function scoreCard(signals: PrioritySignals, growthPainDominant: boolean): { score: number; factors: PriorityFactor[] } {
    const factors: PriorityFactor[] = [];
    let score = signals.evidenceScore;

    if (signals.confirmedCount > 0) {
        score += 18 + Math.min(signals.confirmedCount, 3) * 8;
        factors.push("confirmed_need");
    }

    if (signals.bestTier) {
        score += TIER_WEIGHT[signals.bestTier];
        if (signals.bestTier === "observed") factors.push("observed_signal");
        else if (signals.bestTier === "suggested") factors.push("softer_signal");
    }

    if (hasQuickWin(signals.services)) {
        score += 20;
        factors.push("quick_win");
    }

    // Tailored / internal tooling is still a strong opportunity — no penalty.
    if (hasStructuralBuild(signals.services)) {
        score += 8;
        factors.push("structural_build");
    }

    if (signals.ambitionAligned) {
        score += 10;
        factors.push("ambition");
    }

    if (isFoundation(signals.areaId) && !growthPainDominant) {
        score += 14;
        factors.push("foundation");
    }

    if (isGrowth(signals.areaId) && (growthPainDominant || signals.bestTier === "observed")) {
        score += 12;
        factors.push("growth_pain");
    }

    return { score, factors };
}

function growthPainIsDominant(cards: Array<{ signals: PrioritySignals }>): boolean {
    let growthObserved = 0;
    let foundationObserved = 0;
    for (const card of cards) {
        if (card.signals.bestTier !== "observed" && card.signals.confirmedCount === 0) continue;
        if (isGrowth(card.signals.areaId)) growthObserved += 1 + card.signals.confirmedCount;
        if (isFoundation(card.signals.areaId)) foundationObserved += 1 + card.signals.confirmedCount;
    }
    return growthObserved > foundationObserved && growthObserved >= 2;
}

function whyFromFactors(
    factors: PriorityFactor[],
    band: PriorityBand,
    locale: string,
    signals: PrioritySignals,
): string {
    const en = locale === "en";
    const unique = [...new Set(factors)];

    // Pick the two strongest explanations for this band.
    const preferred =
        band === "start_here"
            ? (["confirmed_need", "observed_signal", "structural_build", "quick_win", "foundation", "growth_pain", "ambition"] as PriorityFactor[])
            : band === "next"
              ? (["confirmed_need", "structural_build", "quick_win", "ambition", "foundation", "growth_pain", "observed_signal"] as PriorityFactor[])
              : (["structural_build", "softer_signal", "ambition", "foundation"] as PriorityFactor[]);

    const ordered = preferred.filter((f) => unique.includes(f)).slice(0, 2);
    if (ordered.length === 0) {
        return en
            ? "Ranked from the strength of your answers and how actionable the opportunity looks."
            : "Classée selon la force de vos réponses et le caractère actionnable de la piste.";
    }

    const parts = ordered.map((factor) => explainFactor(factor, en, signals));
    return parts.join(" ");
}

function explainFactor(factor: PriorityFactor, en: boolean, signals: PrioritySignals): string {
    switch (factor) {
        case "confirmed_need":
            return en
                ? signals.confirmedCount > 1
                    ? "You confirmed several points in this area, so the need is concrete rather than hypothetical."
                    : "You confirmed this as something worth exploring, so it reflects a real need—not a generic suggestion."
                : signals.confirmedCount > 1
                  ? "Vous avez confirmé plusieurs points dans cette zone : le besoin est concret, pas hypothétique."
                  : "Vous avez confirmé que c’était pertinent à explorer : ça reflète un besoin réel, pas une suggestion générique.";
        case "observed_signal":
            return en
                ? "Your answers show this friction already showing up in day-to-day work."
                : "Vos réponses montrent que cette friction apparaît déjà dans le travail au quotidien.";
        case "quick_win":
            return en
                ? "It can move quickly with meaningful impact (automation or operations simplification)."
                : "Ça peut avancer rapidement avec un impact concret (automatisation ou simplification des opérations).";
        case "foundation":
            return en
                ? "It strengthens a business foundation (operations, tools, information, or financial visibility) that other improvements usually depend on."
                : "Ça renforce une fondation d’entreprise (opérations, outils, information ou visibilité financière) dont le reste dépend souvent.";
        case "ambition":
            return en
                ? "It lines up with the ambitions you said matter right now."
                : "Ça s’aligne avec les ambitions que vous avez dites prioritaires en ce moment.";
        case "growth_pain":
            return en
                ? "Client or sales friction came through strongly, so addressing it early protects revenue and delivery."
                : "La friction clients ou ventes ressort fortement : la traiter tôt protège le chiffre d’affaires et la livraison.";
        case "structural_build":
            return en
                ? "It points to a tailored or internal tool—often a lasting lever that fits how your business actually works."
                : "Ça pointe vers un outil sur mesure ou interne — souvent un levier durable, adapté à la façon dont votre entreprise fonctionne vraiment.";
        case "softer_signal":
            return en
                ? "The signal is softer here—useful to keep in view, but less proven than the top priorities."
                : "Le signal est plus soft ici — utile à garder en vue, mais moins établi que les priorités du haut.";
    }
}

/**
 * Re-rank result cards with business logic, assign Start / Next / Later bands,
 * and attach a concrete priorityWhy built from the ranking factors.
 */
export function assignPriorityBands(
    cards: ServiceSectionCard[],
    locale: string = "fr",
    signalByArea?: Partial<Record<AreaId, PrioritySignals>>,
): ServiceSectionCard[] {
    if (cards.length === 0) return cards;

    const withSignals: RankedCard[] = cards.map((card) => {
        const signals: PrioritySignals = signalByArea?.[card.areaId] || {
            areaId: card.areaId,
            confirmedCount: 0,
            bestTier: null,
            services: card.services.map((s) => s.id),
            ambitionAligned: false,
            evidenceScore: card.score,
        };
        return {
            ...card,
            signals,
            priorityScore: 0,
            factors: [] as PriorityFactor[],
        };
    });

    const growthPainDominant = growthPainIsDominant(withSignals);

    for (const card of withSignals) {
        const ranked = scoreCard(card.signals, growthPainDominant);
        card.priorityScore = ranked.score;
        card.factors = ranked.factors;
    }

    withSignals.sort((a, b) => b.priorityScore - a.priorityScore || b.score - a.score);

    const top = withSignals[0]!.priorityScore;
    const sharpDrop = withSignals.length > 1 && top > 0 && withSignals[1]!.priorityScore <= top * 0.55;

    return withSignals.map((card, index) => {
        let priorityBand: PriorityBand;
        if (index === 0) {
            priorityBand = "start_here";
        } else if (sharpDrop) {
            priorityBand = "later";
        } else if (index === 1 || (index === 2 && withSignals.length > 3)) {
            priorityBand = "next";
        } else {
            priorityBand = "later";
        }

        const { signals, priorityScore, factors, ...rest } = card;
        return {
            ...rest,
            score: priorityScore,
            priorityBand,
            priorityWhy: whyFromFactors(factors, priorityBand, locale, signals),
        };
    });
}
