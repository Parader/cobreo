import {
    getMeasurementActivityLabels,
    renderMeasurementQuestion,
} from "@/content/diagnostic/v6/catalog";
import { buildFlowSteps } from "@/lib/diagnostic/v6/sequence";
import { generateDiagnosticResult } from "@/lib/diagnostic/v6/scoring";

function assert(condition: boolean, message: string) {
    if (!condition) throw new Error(`[diagnostic-v6.6 selftest] ${message}`);
}

export function runDiagnosticV6Selftests() {
    const cube = generateDiagnosticResult({
        context: {
            stage: "testing",
            business_type: "products",
            work_model: ["orders"],
        },
        currentPriority: ["test_offer"],
        topicStates: {
            offer_testing: {
                answers: {
                    reality_offer_testing: [
                        "different_versions",
                        "people_test",
                        "collect_reactions",
                        "change_from_learning",
                    ],
                    testing_trace_method: "several_places",
                    testing_trace_fit: "sometimes_hard",
                },
            },
            sales_orders: {
                answers: {
                    reality_sales_path: ["not_taking_orders"],
                    sales_near_term_need: "yes",
                },
            },
            product_information: {
                answers: {
                    reality_product_information: ["not_planned"],
                    product_information_near_term_need: "yes",
                },
            },
        },
        measurements: {
            offer_testing: { frequency: "weekly", effort: "quite_a_bit", desire: "quite" },
        },
    });
    assert(cube.hasCredibleOpportunity, "cube case should have credible opportunities");
    assert(
        cube.opportunities.some((o) => o.id === "structure_testing_feedback"),
        "expected testing/feedback opportunity",
    );
    assert(
        cube.opportunities.some((o) => o.id === "prepare_order_intake" && o.type === "emerging"),
        "expected emerging order-intake",
    );
    assert(
        cube.opportunities.some(
            (o) => o.id === "make_offer_information_accessible" && o.type === "emerging",
        ),
        "expected emerging product-information accessibility",
    );

    const notReady = generateDiagnosticResult({
        context: { stage: "testing", business_type: "products", work_model: ["orders"] },
        currentPriority: ["test_offer"],
        topicStates: {
            sales_orders: {
                answers: {
                    reality_sales_path: ["not_taking_orders"],
                    sales_near_term_need: "no",
                },
            },
        },
    });
    assert(
        !notReady.opportunities.some((o) => o.id === "prepare_order_intake"),
        "sales branch should close without order opportunity",
    );

    const healthy = generateDiagnosticResult({
        context: { stage: "regular", business_type: "services", work_model: ["projects"] },
        currentPriority: ["test_offer"],
        topicStates: {
            offer_testing: {
                answers: {
                    reality_offer_testing: ["collect_reactions"],
                    testing_trace_method: "several_places",
                    testing_trace_fit: "easy",
                },
            },
        },
    });
    assert(
        !healthy.opportunities.some((o) => o.id === "structure_testing_feedback"),
        "fit=easy must not invent fragmentation opportunity from situation",
    );

    const multiSales = generateDiagnosticResult({
        context: {
            stage: "regular",
            business_type: "services",
            work_model: ["appointments", "projects"],
        },
        currentPriority: ["sell_more"],
        topicStates: {
            sales_orders: {
                answers: {
                    reality_sales_path: ["contact_me", "ask_how", "existing_order_method"],
                },
            },
        },
    });
    assert(
        !multiSales.opportunities.some((o) => o.topic === "sales_orders"),
        "descriptive multi sales path must not invent friction",
    );

    const poorFit = generateDiagnosticResult({
        context: { stage: "regular", business_type: "services", work_model: ["projects"] },
        currentPriority: ["sell_more"],
        topicStates: {
            product_information: {
                answers: {
                    reality_product_information: ["website"],
                    product_information_fit: "not_really",
                    website_fit_followup: ["more_contacts", "explain_offer"],
                },
            },
        },
    });
    assert(
        poorFit.opportunities.some(
            (o) =>
                o.topic === "product_information" &&
                o.type === "improvement" &&
                o.priorityAlignment === "direct",
        ),
        "website + poor fit must keep product-information improvement with direct alignment",
    );
    assert(
        poorFit.opportunities.some((o) => o.why.toLowerCase().includes("améliorer")),
        "poor fit should keep improvement framing for the current solution",
    );
    assert(
        !poorFit.opportunities.some((o) => /remplac/i.test(o.why)),
        "must not generate automatic replacement recommendation",
    );

    const fitCheckSteps = buildFlowSteps({
        currentPriority: ["sell_more"],
        topicStates: {
            product_information: {
                answers: {
                    reality_product_information: ["website"],
                },
            },
        },
        scanAnswers: {},
        measurements: {},
    });
    assert(
        fitCheckSteps.some(
            (s) => s.type === "reality" && s.questionId === "product_information_fit",
        ),
        "existing website must trigger contextual solution-fit question",
    );

    const goodFit = generateDiagnosticResult({
        context: { stage: "regular", business_type: "services", work_model: ["projects"] },
        currentPriority: ["sell_more"],
        topicStates: {
            product_information: {
                answers: {
                    reality_product_information: ["website", "page_profile"],
                    product_information_fit: "fully",
                },
            },
        },
    });
    assert(
        !goodFit.opportunities.some((o) => o.topic === "product_information"),
        "good fit must close presentation branch without inventing redesign",
    );

    const poorFitSteps = buildFlowSteps({
        currentPriority: ["sell_more"],
        topicStates: {
            product_information: {
                answers: {
                    reality_product_information: ["website"],
                    product_information_fit: "no",
                },
            },
        },
        scanAnswers: {},
        measurements: {},
    });
    assert(
        poorFitSteps.some((s) => s.type === "solution_followup" && s.solutionId === "website"),
        "poor website fit must ask what the current solution should do better",
    );

    const multiInfo = generateDiagnosticResult({
        context: { stage: "regular", business_type: "products", work_model: ["orders"] },
        currentPriority: ["sell_more"],
        topicStates: {
            product_information: {
                answers: {
                    reality_product_information: ["direct_explanation", "send_info", "website"],
                },
            },
        },
    });
    assert(
        !multiInfo.opportunities.some((o) => o.topic === "product_information"),
        "multi channels without fit answer must not invent opportunity",
    );

    const lowManual = generateDiagnosticResult({
        context: { stage: "regular", business_type: "services", work_model: ["projects"] },
        currentPriority: ["save_time"],
        topicStates: {},
        scanAnswers: {
            scan_manual_repetitive: "one_two",
            scan_manual_types: ["prepare_docs"],
        },
        measurements: {
            scan_manual: { frequency: "rare", effort: "very_little", desire: "not_really" },
        },
    });
    assert(
        !lowManual.opportunities.some((o) => o.id === "simplify_process"),
        "low value manual task must not recommend automation/simplify",
    );

    const repeated = generateDiagnosticResult({
        context: { stage: "regular", business_type: "services", work_model: ["projects"] },
        currentPriority: ["save_time"],
        topicStates: {},
        scanAnswers: {
            scan_manual_repetitive: "several",
            scan_manual_types: ["prepare_docs"],
        },
        measurements: {
            scan_manual: { frequency: "weekly", effort: "quite_a_bit", desire: "quite" },
        },
    });
    assert(
        repeated.opportunities.some((o) => o.id === "simplify_process" && o.type === "improvement"),
        "repeated manual task with desire should yield improvement",
    );

    const tools = generateDiagnosticResult({
        context: { stage: "established", business_type: "services", work_model: ["projects"] },
        currentPriority: ["organize_work"],
        topicStates: {},
        scanAnswers: {
            scan_tools_context: ["spreadsheets", "email", "paper_notes"],
            scan_tool_handoffs: ["none"],
        },
    });
    assert(
        !tools.opportunities.some((o) => o.id === "integrate_systems" || o.id === "review_tool_fit"),
        "tools alone must not invent integration opportunity",
    );

    const optimized = generateDiagnosticResult({
        context: { stage: "regular", business_type: "services", work_model: ["projects"] },
        currentPriority: ["sell_more"],
        topicStates: {
            product_information: {
                answers: {
                    reality_product_information: ["website"],
                    product_information_fit: "fully",
                    optimization_probe: "yes",
                    optimization_areas: ["explain_offer", "generate_interest"],
                },
            },
        },
    });
    assert(
        optimized.opportunities.some(
            (o) => o.id === "optimize_product_information" && o.type === "optimization",
        ),
        "good fit + optimization interest with areas should yield optimization",
    );
    assert(
        !optimized.opportunities.some((o) => o.type === "improvement"),
        "good fit must not invent friction improvement",
    );

    const noOpt = generateDiagnosticResult({
        context: { stage: "regular", business_type: "services", work_model: ["projects"] },
        currentPriority: ["sell_more"],
        topicStates: {
            product_information: {
                answers: {
                    reality_product_information: ["website"],
                    product_information_fit: "fully",
                    optimization_probe: "no",
                },
            },
        },
    });
    assert(
        !noOpt.opportunities.some((o) => o.topic === "product_information"),
        "explicit no on optimization must close without recommendation",
    );

    const labels = getMeasurementActivityLabels("scan_manual", {
        manualTypes: ["prepare_docs"],
    });
    const effortQ = renderMeasurementQuestion("effort", labels);
    assert(
        effortQ.includes("Préparer ces documents"),
        "effort question must name the activity referent",
    );
    assert(
        !effortQ.toLowerCase().includes("elle se présente"),
        "must not use ambiguous pronoun measurement wording",
    );
    const followupFreq = renderMeasurementQuestion(
        "frequency",
        getMeasurementActivityLabels("scan_followup"),
    );
    assert(
        followupFreq === "À quelle fréquence suivez-vous les prochaines étapes de mémoire?",
        "followup frequency must use conjugated clause",
    );
    assert(
        !followupFreq.toLowerCase().includes("fréquence suivre"),
        "must not render infinitive after À quelle fréquence",
    );

    assert(Boolean(healthy.message), "healthy result should carry a message");
    assert(
        !String(healthy.message || "").includes("Peu de friction prioritaire"),
        "must not use prohibited global copy",
    );

    return true;
}

if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    try {
        runDiagnosticV6Selftests();
    } catch (error) {
        console.error(error);
    }
}
