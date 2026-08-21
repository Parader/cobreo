import assert from "node:assert/strict";
import { GENERIC_QUESTIONS } from "@/content/diagnostic/packs/generic";
import { scoreDiagnostic } from "@/content/diagnostic/scoring/rules";
import { getQuestionSequence } from "@/lib/diagnostic/engine";
import type { DiagnosticResponses } from "@/content/diagnostic/types";

function run() {
    const stages = ["delivery", "tools"] as const;

    const low: DiagnosticResponses = {
        delivery_manual_01: "rarely",
        delivery_admin_01: "never",
        delivery_info_01: "rarely",
        tools_switch_01: "rarely",
        tools_transfer_01: "never",
        tools_overlap_01: "no",
    };

    const seq = getQuestionSequence([...stages], low);
    assert.ok(seq.every((q) => stages.includes(q.stage as "delivery" | "tools")));
    assert.ok(!seq.some((q) => q.stage === "acquisition"));

    const highDelivery: DiagnosticResponses = {
        ...low,
        delivery_manual_01: "very_often",
        delivery_admin_01: "often",
        delivery_info_01: "often",
    };
    const highResult = scoreDiagnostic(highDelivery, GENERIC_QUESTIONS, [...stages]);
    assert.equal(highResult.zones.length, 2);
    const delivery = highResult.zones.find((z) => z.stage === "delivery");
    assert.ok(delivery && (delivery.band === "high" || delivery.band === "moderate"));

    const seqFu = getQuestionSequence(["delivery"], { delivery_manual_01: "often" });
    assert.ok(seqFu.some((q) => q.id === "delivery_manual_fu"));

    console.log("diagnostic score tests: ok");
}

run();
