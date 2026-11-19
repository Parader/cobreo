"use client";

import type { ComponentProps, ReactNode } from "react";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { demoCta } from "@/lib/marketing";

type Props = {
    children: ReactNode;
    variant?: ComponentProps<typeof CobreoButton>["variant"];
    size?: ComponentProps<typeof CobreoButton>["size"];
    className?: string;
    ctaId: string;
    surface: string;
    iconLeading?: ReactNode;
    iconTrailing?: ReactNode;
};

/** Demo request. Retarget every instance by editing `demoCta.href`. */
export function DemoButton({
    children,
    variant = "primary",
    size = "xl",
    className,
    ctaId,
    surface,
    iconLeading,
    iconTrailing,
}: Props) {
    return (
        <CobreoButton
            href={demoCta.href}
            variant={variant}
            size={size}
            className={className}
            iconLeading={iconLeading}
            iconTrailing={iconTrailing}
            analytics={{ ctaId, destination: "contact", surface }}
        >
            {children}
        </CobreoButton>
    );
}
