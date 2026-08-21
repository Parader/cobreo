"use client";

import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { ChoiceButton, ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { getDimension, getDimensionSelectionSpec } from "@/content/diagnostic/v5/catalog";
import { DIMENSION_IDS, type DimensionId } from "@/content/diagnostic/v5/types";

export function DimensionSelectScreen({
    selected,
    onChange,
    onContinue,
}: {
    selected: DimensionId[];
    onChange: (next: DimensionId[]) => void;
    onContinue: () => void;
}) {
    const spec = getDimensionSelectionSpec();

    function toggle(id: DimensionId) {
        if (selected.includes(id)) {
            onChange(selected.filter((x) => x !== id));
            return;
        }
        onChange([...selected, id]);
    }

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader
                title={spec.question.fr ?? ""}
                body={[spec.instruction_fr, spec.recommendation_fr].filter(Boolean).join(" ")}
            />
            <div className="flex flex-col gap-2.5">
                {DIMENSION_IDS.map((id) => {
                    const dimension = getDimension(id);
                    if (!dimension) return null;
                    return (
                        <ChoiceButton
                            key={id}
                            multi
                            selected={selected.includes(id)}
                            onClick={() => toggle(id)}
                        >
                            <span className="flex flex-col gap-1">
                                <span className="font-medium text-[#171717]">{dimension.label_fr}</span>
                                <span className="text-sm text-[#737373]">{dimension.hint_fr}</span>
                            </span>
                        </ChoiceButton>
                    );
                })}
            </div>
            <CobreoButton size="xl" disabled={!selected.length} onClick={onContinue}>
                {spec.cta_fr}
            </CobreoButton>
        </div>
    );
}
