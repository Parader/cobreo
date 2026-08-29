import type { AmbitionId, AreaId, CompanyContext } from "@/content/diagnostic/v7/types";
import { hardApplicableAreas } from "./coverage";

/**
 * Ambition → business areas.
 *
 * Since spec 8.2 the ambitions screen also carries the exploration territory that
 * the removed `area_applicability` screen used to collect, so this map is the single
 * source of truth for which areas a respondent opened up.
 */
export const AMBITION_AREAS: Partial<Record<AmbitionId, AreaId[]>> = {
    find_clients: ["sales_growth", "clients_service", "tools_systems"],
    convert_requests: ["sales_growth", "clients_service", "work_operations"],
    grow_existing_customers: ["clients_service", "sales_growth", "information_ways"],
    improve_client_experience: ["clients_service", "sales_growth", "information_ways"],
    save_time: ["work_operations", "information_ways", "tools_systems"],
    organize_work: ["work_operations", "information_ways", "tools_systems"],
    improve_team: ["team_people", "work_operations", "information_ways"],
    better_decisions: ["leadership_performance", "finance_profitability", "information_ways"],
    improve_profitability: ["finance_profitability", "leadership_performance", "work_operations", "team_people"],
    improve_offer: ["offer_development", "clients_service", "leadership_performance"],
    prepare_growth: ["work_operations", "team_people", "information_ways", "tools_systems"],
    use_information_better: ["information_ways", "tools_systems", "leadership_performance"],
    improve_tools: ["tools_systems", "information_ways", "work_operations"],
    // Legacy id kept so drafts saved before 8.2 still resolve.
    grow_sales: ["sales_growth", "clients_service", "tools_systems"],
};

/** Ambitions that signal interest in the client relationship. */
export const CLIENT_AMBITIONS: AmbitionId[] = [
    "improve_client_experience",
    "grow_existing_customers",
    "find_clients",
    "convert_requests",
    "grow_sales",
];

/**
 * Exploration territory opened by the declared ambitions, limited to areas that
 * actually apply to the company (e.g. no team area for a solo business).
 */
export function areasFromAmbitions(
    declared: AmbitionId[] | undefined,
    companyContext: CompanyContext,
): AreaId[] {
    const hard = hardApplicableAreas(companyContext);
    const areas: AreaId[] = [];

    for (const ambition of declared || []) {
        for (const area of AMBITION_AREAS[ambition] || []) {
            if (hard.includes(area) && !areas.includes(area)) areas.push(area);
        }
    }

    return areas;
}
