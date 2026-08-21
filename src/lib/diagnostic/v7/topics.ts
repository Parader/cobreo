import { diagnosticSpecV7 } from "@/content/diagnostic/v7/types";
import type {
    AreaId,
    CompanyContext,
    PossibilityCandidate,
    TopicCandidate,
    TopicId,
} from "@/content/diagnostic/v7/types";
import { isSoloCompany } from "@/lib/diagnostic/v7/coverage";

export type TopicDef = {
    id: TopicId;
    label_fr: string;
    summary_fr: string;
    source_sections: AreaId[];
    show_if?: string;
};

type ClusteringSpec = {
    maximum_visible_topics?: number;
    maximum_selected_topics?: number;
    topics: TopicDef[];
};

export function getTopicClusteringSpec(): ClusteringSpec {
    return (diagnosticSpecV7 as { v8_topic_clustering?: ClusteringSpec }).v8_topic_clustering || {
        maximum_visible_topics: 6,
        maximum_selected_topics: 3,
        topics: [],
    };
}

/** Expand-screen answer id → business area(s). */
export const EXPAND_ANSWER_TO_AREAS: Record<string, AreaId[]> = {
    find_clients: ["sales_growth"],
    sales_requests: ["sales_growth"],
    client_service: ["clients_service"],
    work_operations: ["work_operations"],
    team_people: ["team_people"],
    finance_profitability: ["finance_profitability"],
    information_docs: ["information_ways"],
    offer_development: ["offer_development"],
    tools_systems: ["tools_systems"],
    performance_decisions: ["leadership_performance"],
    nothing_else: [],
};

export function expandAnswersToAreas(answerIds: string[]): AreaId[] {
    const areas: AreaId[] = [];
    for (const id of answerIds) {
        if (id === "nothing_else") continue;
        for (const area of EXPAND_ANSWER_TO_AREAS[id] || []) {
            if (!areas.includes(area)) areas.push(area);
        }
    }
    return areas;
}

function topicAllowed(topic: TopicDef, companyContext: CompanyContext): boolean {
    if (topic.show_if === "company_size != '1'" && isSoloCompany(companyContext.company_size)) {
        return false;
    }
    return true;
}

const TIER_WEIGHT: Record<PossibilityCandidate["sourceTier"], number> = {
    observed: 3,
    emerging: 2,
    suggested: 1,
};

/**
 * Cluster micro-possibilities into ≤6 broad topics for the prospect.
 * Micro candidates stay internal; cards only expose label + summary.
 */
export function buildTopicCandidates(input: {
    companyContext: CompanyContext;
    candidates: PossibilityCandidate[];
}): TopicCandidate[] {
    const spec = getTopicClusteringSpec();
    const maxVisible = spec.maximum_visible_topics ?? 6;
    const scored: Array<TopicCandidate & { score: number }> = [];

    for (const topic of spec.topics) {
        if (!topicAllowed(topic, input.companyContext)) continue;
        const members = input.candidates.filter((c) => topic.source_sections.includes(c.areaId));
        if (members.length === 0) continue;

        const score = members.reduce(
            (sum, c) => sum + c.score * 10 + TIER_WEIGHT[c.sourceTier] * 5,
            0,
        );
        scored.push({
            id: topic.id,
            label: topic.label_fr,
            summary: topic.summary_fr,
            sourceSections: topic.source_sections,
            memberPossibilityIds: members.map((m) => m.id),
            score,
        });
    }

    scored.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, "fr"));
    return scored.slice(0, maxVisible).map(({ score: _score, ...rest }) => rest);
}

/** Map selected topic ids → micro possibility ids for service/results engines. */
export function resolvePossibilitiesFromTopics(
    selectedTopics: Array<TopicId | "none_selected">,
    candidates: PossibilityCandidate[],
): Array<string | "none_selected"> {
    if (selectedTopics.includes("none_selected") || selectedTopics.length === 0) {
        return selectedTopics.includes("none_selected") ? ["none_selected"] : [];
    }

    const spec = getTopicClusteringSpec();
    const areas = new Set<AreaId>();
    for (const topic of spec.topics) {
        if (selectedTopics.includes(topic.id)) {
            for (const area of topic.source_sections) areas.add(area);
        }
    }

    const matched = candidates
        .filter((c) => areas.has(c.areaId))
        .sort((a, b) => b.score - a.score)
        .map((c) => c.id);

    // Cap underlying micros so results stay focused (≈ top per selected topic)
    const maxMicros = Math.max(3, selectedTopics.length * 3);
    return matched.slice(0, maxMicros);
}
