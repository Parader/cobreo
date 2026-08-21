"use client";

import { useTranslations } from "next-intl";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { ScreenHeader } from "@/components/cobreo/diagnostic/v5/choice-ui";
import { getOptionalFreeTextSpec } from "@/content/diagnostic/v5/catalog";

export function OptionalContextScreen({
    value,
    onChange,
    onContinue,
}: {
    value?: string;
    onChange: (text: string) => void;
    onContinue: () => void;
}) {
    const t = useTranslations("diagnostic");
    const spec = getOptionalFreeTextSpec().final_note;

    return (
        <div className="flex flex-col gap-8">
            <ScreenHeader title={spec.label_fr} body={spec.hint_fr} />
            <label className="flex flex-col gap-2">
                <textarea
                    value={value ?? ""}
                    maxLength={spec.max_chars}
                    rows={5}
                    onChange={(e) => onChange(e.target.value.slice(0, spec.max_chars))}
                    className="rounded-xl border border-[#171717]/15 bg-white px-4 py-3 text-base text-[#171717] outline-none focus:border-[#4d6b97]"
                    placeholder={t("optionalNotePlaceholder")}
                />
            </label>
            <CobreoButton size="xl" onClick={onContinue}>
                {t("optionalNoteContinue")}
            </CobreoButton>
        </div>
    );
}
