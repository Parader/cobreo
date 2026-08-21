"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CobreoButton } from "@/components/cobreo/cobreo-button";

/** Always-enabled continue: shows an inline error when the step is incomplete. */
export function StepContinue({
    canContinue,
    onContinue,
    label,
    multi,
}: {
    canContinue: boolean;
    onContinue: () => void;
    label: string;
    /** Multi-select wording vs single answer */
    multi?: boolean;
}) {
    const t = useTranslations("diagnostic");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (canContinue) setError(null);
    }, [canContinue]);

    function handleClick() {
        if (!canContinue) {
            setError(multi ? t("radarNeedAnswer") : t("needAnswer"));
            return;
        }
        setError(null);
        onContinue();
    }

    return (
        <div className="flex flex-col gap-2">
            {error ? (
                <p role="alert" className="text-sm font-medium text-error-primary">
                    {error}
                </p>
            ) : null}
            <CobreoButton size="xl" onClick={handleClick}>
                {label}
            </CobreoButton>
        </div>
    );
}
