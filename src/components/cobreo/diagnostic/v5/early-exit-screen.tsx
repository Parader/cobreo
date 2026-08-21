"use client";

import { getEarlyExitSpec } from "@/content/diagnostic/v5/catalog";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";

export function EarlyExitScreen({
    onContinue,
    onResults,
}: {
    onContinue: () => void;
    onResults: () => void;
}) {
    const spec = getEarlyExitSpec();
    const continueAction = spec.actions.find((a) => a.id === "continue");
    const resultsAction = spec.actions.find((a) => a.id === "results");

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader title={spec.message_fr} />
            <div className="flex flex-col gap-3">
                <CobreoButton size="xl" onClick={onContinue}>
                    {continueAction?.label_fr ?? "Continuer"}
                </CobreoButton>
                <CobreoButton variant="ghost" size="lg" onClick={onResults}>
                    {resultsAction?.label_fr ?? "Voir mes résultats"}
                </CobreoButton>
            </div>
        </div>
    );
}
