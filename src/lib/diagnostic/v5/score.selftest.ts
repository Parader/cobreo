import { generateDiagnosticResult } from "@/lib/diagnostic/v5/scoring";

function assert(condition: boolean, message: string) {
    if (!condition) throw new Error(`[diagnostic-v5.4 selftest] ${message}`);
}

export function runDiagnosticV5Selftests() {
    // 1. starting / no problem
    const early = generateDiagnosticResult({
        context: { business_situation: "starting", business_type: "services", work_model: "projects" },
        selectedDimensions: ["requests", "admin"],
        radarResponses: {
            requests: { selected: ["none"] },
            admin: { selected: ["none"] },
        },
        qualification: {},
        deepDive: {},
    });
    assert(early.kind === "early_stage" || early.kind === "healthy", "expected healthy/early for starting+none");
    assert(early.opportunities.length === 0, "no opportunities for none answers");

    // 2. manual transfer high impact
    const transfer = generateDiagnosticResult({
        context: { business_situation: "small_team", business_type: "services", work_model: "projects" },
        selectedDimensions: ["information_tools"],
        radarResponses: {
            information_tools: { selected: ["manual_transfer"] },
        },
        qualification: {
            priorityAnswerKey: "information_tools:manual_transfer",
            importance: "high",
            consequences: ["time", "errors"],
        },
        deepDive: { manual_transfer: "tools_not_connected" },
    });
    assert(transfer.kind === "opportunities", "manual transfer should yield opportunities");
    assert(transfer.signals.includes("integration"), "expected integration signal");
    assert(
        transfer.opportunities.some((o) => o.id === "integrate_systems" || o.id === "reduce_duplicate_entry"),
        "expected integrate or reduce_duplicate opportunity",
    );

    // 3. multiple tools no friction
    const toolsNone = generateDiagnosticResult({
        context: { business_situation: "established_team", business_type: "both", work_model: "mixed" },
        selectedDimensions: ["information_tools"],
        radarResponses: { information_tools: { selected: ["none"] } },
        qualification: {},
        deepDive: {},
    });
    assert(
        !toolsNone.opportunities.some((o) => o.id === "review_tool_fit" || o.id === "reduce_tool_cost"),
        "none should not invent tool consolidation",
    );

    // 4. team absence dependency
    const absence = generateDiagnosticResult({
        context: { business_situation: "small_team", business_type: "services", work_model: "projects" },
        selectedDimensions: ["management_continuity"],
        radarResponses: {
            management_continuity: { selected: ["absence"] },
        },
        qualification: {
            priorityAnswerKey: "management_continuity:absence",
            importance: "significant",
            consequences: ["delay"],
        },
        deepDive: {},
    });
    assert(absence.signals.includes("dependency_on_people"), "expected dependency_on_people");
    assert(
        absence.opportunities.some((o) => o.id === "improve_continuity"),
        "expected improve_continuity opportunity",
    );

    // 5. free text never required / no penalty
    const withNote = generateDiagnosticResult({
        context: { business_situation: "solo", business_type: "services", work_model: "projects" },
        selectedDimensions: ["admin"],
        radarResponses: { admin: { selected: ["none"] } },
        qualification: {},
        deepDive: {},
    });
    assert(withNote.opportunities.length === 0, "empty optional notes must not invent opportunities");

    return true;
}

if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    try {
        runDiagnosticV5Selftests();
    } catch (error) {
        console.error(error);
    }
}
