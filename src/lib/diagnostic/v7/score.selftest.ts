import { resolveCapabilities } from "@/lib/diagnostic/v7/coverage";
import { buildPossibilityCandidates } from "@/lib/diagnostic/v7/possibilities";
import { generateDiagnosticResult } from "@/lib/diagnostic/v7/scoring";
import { buildServiceSections } from "@/lib/diagnostic/v7/services";
import { buildFlowSteps, orderAreasForAmbition } from "@/lib/diagnostic/v7/sequence";
import {
    buildTopicCandidates,
    expandAnswersToAreas,
    getTopicClusteringSpec,
    resolvePossibilitiesFromTopics,
} from "@/lib/diagnostic/v7/topics";
import { getCompanyQuestions, getBookingSpec, getFreeTextSpec, getResultsSpec } from "@/content/diagnostic/v7/catalog";
import type { AreaId } from "@/content/diagnostic/v7/types";

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(`[diagnostic-v8.1 selftest] ${message}`);
}

export function runDiagnosticV7Selftests() {
    {
        const questions = getCompanyQuestions();
        assert(questions[0]?.id === "company_stage", "first company question is company_stage");
        assert(!questions.some((q) => q.id === "sector_family"), "no sector_family question");
    }

    {
        const booking = getBookingSpec();
        assert(booking.duration_minutes === 15, "booking is 15 minutes");
        assert(booking.primary_close === true, "booking is primary close");
        const page = getResultsSpec().page;
        assert(Boolean(page?.title_fr), "results page title present");
    }

    {
        const freeText = getFreeTextSpec();
        assert(freeText.id === "missing_improvement_idea", "free text id is missing_improvement_idea");
        assert(Boolean(freeText.question_fr), "free text question present");
        assert((freeText.max_chars ?? 0) === 600, "free text max_chars is 600");
    }

    {
        const clustering = getTopicClusteringSpec();
        assert((clustering.maximum_visible_topics ?? 0) === 6, "max 6 visible topics");
        assert((clustering.maximum_selected_topics ?? 0) === 3, "max 3 selected topics");
        assert(clustering.topics.length >= 5, "topic catalog present");
    }

    {
        const areas = expandAnswersToAreas(["find_clients", "work_operations", "nothing_else"]);
        assert(areas.includes("sales_growth"), "find_clients maps to sales_growth");
        assert(areas.includes("work_operations"), "work_operations maps");
        assert(!areas.includes("nothing_else" as AreaId), "nothing_else adds no area");
    }

    {
        const sections = buildServiceSections({
            areaAnswers: {
                finance_profitability: ["invoices_payments", "financial_reporting"],
                work_operations: ["manual_steps", "status_visibility"],
            },
            automationInterest: { tasks: ["reports", "copy_transfer"] },
            fitChecks: { tools_fit: { state: "fit_gap" } },
            prioritySections: ["finance_profitability"],
        });
        assert(sections.length >= 1, "service sections generated from evidence");
        assert(sections.length <= 3, "max 3 section cards");
        const finance = sections.find((s) => s.areaId === "finance_profitability");
        assert(finance, "finance section present");
        assert(
            finance!.services.some((s) => s.id === "automation" || s.id === "information_decision"),
            "finance maps to automation/information services",
        );
        assert(
            finance!.services.every((s) => !/^[a-z_]+$/.test(s.label) || s.label.includes(" ")),
            "service labels are human-readable",
        );
    }

    {
        const sections = buildServiceSections({
            areaAnswers: { sales_growth: [] },
            automationInterest: {},
            fitChecks: {},
            prioritySections: [],
        });
        assert(
            !sections.some((s) => s.services.some((svc) => svc.id === "online_presence")),
            "sales ambition alone must not create online_presence — empty sales answers",
        );
    }

    {
        const sections = buildServiceSections({
            areaAnswers: { sales_growth: ["offer_info", "inquiry_path"] },
            automationInterest: {},
            fitChecks: {},
            prioritySections: ["sales_growth"],
        });
        const sales = sections.find((s) => s.areaId === "sales_growth");
        assert(sales, "sales section with online signals");
        assert(
            sales!.services.some((s) => s.id === "online_presence"),
            "offer/inquiry signals support online_presence",
        );
    }

    {
        const result = generateDiagnosticResult({
            companyContext: { company_size: "6_20", company_stage: "regular" },
            ambitions: { declared: ["nothing_specific"] },
            applicableAreas: ["tools_systems"],
            areaAnswers: {
                tools_systems: ["spreadsheets", "email_messages", "calendar", "crm_sales", "work_management"],
            },
            confirmationAnswers: {},
            fitChecks: {},
            automationInterest: {},
            prioritySections: ["none_priority"],
        });
        assert(Array.isArray(result.serviceSections), "result includes serviceSections");
        assert(
            !result.serviceSections.some((s) => s.services.some((svc) => svc.id === "custom_tool")),
            "healthy tools + no fit gap must not promote custom_tool",
        );
    }

    {
        const caps = resolveCapabilities({
            areaAnswers: { leadership_performance: ["revenue"] },
            confirmationAnswers: {},
            fitChecks: {},
        });
        assert(caps.revenue_visibility === "covered", "revenue covered");
        assert(
            caps.profitability_visibility === "potentially_uncovered",
            "unselected profitability is only potentially uncovered",
        );
    }

    {
        const result = generateDiagnosticResult({
            companyContext: { company_size: "21_50" },
            ambitions: { declared: ["improve_profitability"] },
            applicableAreas: ["team_people", "finance_profitability"],
            areaAnswers: {
                team_people: ["hours"],
                finance_profitability: ["invoices_payments", "expenses", "financial_reporting"],
            },
            confirmationAnswers: {},
            fitChecks: {},
            automationInterest: {},
            prioritySections: ["finance_profitability"],
        });
        assert(result.serviceSections.length > 0, "should surface service sections");
        assert(result.hasCredibleOpportunity, "should have credible opportunity");
        assert(result.serviceSections.length <= 3, "max 3 result section cards");
        assert(
            result.serviceSections.every((s) => s.services.length >= 1 && s.services.length <= 3),
            "1–3 services per section",
        );
    }

    {
        const ordered = orderAreasForAmbition(["grow_sales"], [
            "tools_systems",
            "sales_growth",
            "clients_service",
            "work_operations",
        ] as AreaId[]);
        assert(ordered[0] === "sales_growth", "grow_sales should start with sales_growth");
    }

    {
        const steps = buildFlowSteps({
            companyContext: { company_size: "2_5" },
            declared: ["save_time"],
            applicableAreas: ["work_operations", "information_ways", "tools_systems"],
            areaAnswers: { work_operations: ["manual_steps"] },
            automationInterest: {},
            selectedPossibilities: ["work_operations:work_tracking"],
        });
        assert(
            (steps.find((s) => s.type === "company") as { questionId: string }).questionId === "company_stage",
            "first company question is company_stage",
        );
        assert(
            !steps.some((s) => s.type === "company" && (s as { questionId: string }).questionId === "sector_family"),
            "no sector_family question",
        );
        assert(steps.some((s) => s.type === "declared_ambitions"), "includes declared ambitions");
        assert(steps.some((s) => s.type === "simplification"), "save_time should ask simplification checklist");
        assert(steps.some((s) => s.type === "choose_topics"), "includes v8.1 topic choice");
        assert(!steps.some((s) => s.type === "review_possibilities"), "no micro-possibility review screen");
        assert(!steps.some((s) => s.type === "possibility_followup"), "no default possibility follow-up");
        assert(steps.some((s) => s.type === "optional_notes"), "includes free-text notes");
    }

    {
        const cards = buildPossibilityCandidates({
            companyContext: { company_size: "2_5" },
            declared: ["save_time"],
            areaAnswers: {
                work_operations: ["status_visibility", "manual_steps"],
                information_ways: ["copy_reenter", "documentation_gap"],
            },
            automationInterest: { tasks: ["documents"] },
        });
        assert(cards.length >= 4, "v8 possibility floor of 4");
        assert(cards.length <= 9, "v8 max 9 cards");

        const topics = buildTopicCandidates({
            companyContext: { company_size: "2_5" },
            candidates: cards,
        });
        assert(topics.length >= 1, "at least one topic from candidates");
        assert(topics.length <= 6, "max 6 topic cards");
        assert(
            topics.every((t) => Boolean(t.label) && Boolean(t.summary)),
            "topics expose label + summary only",
        );

        const resolved = resolvePossibilitiesFromTopics(["work", "information"], cards);
        assert(resolved.length > 0, "selected topics resolve to micro possibilities");
        assert(!resolved.includes("none_selected"), "real topics are not none_selected");
        assert(
            resolvePossibilitiesFromTopics(["none_selected"], cards).includes("none_selected"),
            "none_selected maps through",
        );
    }
}

runDiagnosticV7Selftests();
console.log("diagnostic-v8.1 selftests passed");
