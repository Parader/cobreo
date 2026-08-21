"use client";

import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { getDiagnosticStatus, type DiagnosticStatus } from "@/lib/diagnostic/v7/persistence";

type ButtonProps = Omit<ComponentProps<typeof CobreoButton>, "href" | "children" | "analytics">;

/** Home / marketing CTA that adapts once a diagnostic exists locally */
export function DiagnosticEntryButton({
    iconTrailing,
    idleLabel,
    surface = "unknown",
    ctaId = "diagnostic_entry",
    ...props
}: ButtonProps & {
    iconTrailing?: ComponentProps<typeof CobreoButton>["iconTrailing"];
    /** Label when no draft exists (defaults to home.diagnosticCta) */
    idleLabel?: ReactNode;
    surface?: string;
    ctaId?: string;
}) {
    const t = useTranslations("home");
    const td = useTranslations("diagnostic");
    const [status, setStatus] = useState<DiagnosticStatus | null>(null);

    useEffect(() => {
        setStatus(getDiagnosticStatus());
    }, []);

    // Keep SSR/client first paint identical — only swap label after mount
    const label =
        status === "completed"
            ? td("viewResultsCta")
            : status === "in_progress"
              ? td("resumeCta")
              : (idleLabel ?? t("diagnosticCta"));

    return (
        <CobreoButton
            href="/diagnostic"
            glaze
            iconTrailing={iconTrailing}
            analytics={{
                ctaId,
                destination: "diagnostic",
                surface,
            }}
            {...props}
        >
            {label}
        </CobreoButton>
    );
}
