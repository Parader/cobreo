"use client";

import type { ComponentProps, ReactNode } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cx } from "@/utils/cx";
import type { CtaDestination } from "@/lib/analytics/events";
import { trackCtaClick } from "@/lib/analytics/track-cta";

type Variant = "primary" | "secondary" | "ghost" | "onDark" | "inverse";

type Props = {
    children: ReactNode;
    href?: string;
    variant?: Variant;
    size?: "md" | "lg" | "xl";
    /** Soft periodic shine — for key CTAs (e.g. diagnostic), not every primary */
    glaze?: boolean;
    iconLeading?: ReactNode;
    iconTrailing?: ReactNode;
    className?: string;
    type?: "button" | "submit";
    onClick?: ComponentProps<"button">["onClick"];
    disabled?: boolean;
    /** Optional funnel tracking for marketing CTAs */
    analytics?: {
        ctaId: string;
        destination: CtaDestination;
        surface: string;
    };
};

const sizes = {
    md: "max-w-full gap-1.5 rounded-lg px-3.5 py-2.5 text-sm font-semibold",
    lg: "max-w-full gap-1.5 rounded-lg px-[18px] py-3 text-md font-semibold",
    xl: "max-w-full gap-1.5 rounded-lg px-4 py-3.5 text-base font-semibold sm:px-6 sm:py-4 sm:text-lg",
};

/** Fill color that sweeps L→R on hover */
const fillBg: Record<Variant, string> = {
    primary: "bg-[#253353]",
    secondary: "bg-[#4d6b97]",
    ghost: "bg-[#4d6b97]",
    onDark: "bg-transparent",
    inverse: "bg-[#4d6b97]",
};

const base: Record<Variant, string> = {
    primary: "bg-[#4d6b97] text-white",
    secondary: "bg-[#efedea] text-[#253353] hover:text-white",
    ghost: "border border-[#4d6b97] bg-transparent text-[#404040] hover:text-white",
    onDark: "bg-transparent text-[#a6b5cb] hover:text-white",
    /** White chip on navy / brand panels — hover keeps contrast */
    inverse: "bg-white text-[#253353] hover:text-white",
};

/**
 * Cobreo CTA — background fill animates left → right on hover.
 */
export function CobreoButton({
    children,
    href,
    variant = "primary",
    size = "xl",
    glaze = false,
    iconLeading,
    iconTrailing,
    className,
    type = "button",
    onClick,
    disabled,
    analytics,
}: Props) {
    const locale = useLocale();
    const classes = cx(
        "group relative inline-flex max-w-full items-center justify-center overflow-hidden",
        "whitespace-normal text-center text-balance sm:whitespace-nowrap",
        "transition-colors duration-300 ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:brightness-[0.97]",
        sizes[size],
        base[variant],
        className,
    );

    const showGlaze = glaze && !disabled;
    const glazeVia =
        variant === "primary" || variant === "onDark"
            ? "via-white/35"
            : "via-[#4d6b97]/28";

    function handleAnalytics() {
        if (!analytics) return;
        trackCtaClick({
            ctaId: analytics.ctaId,
            destination: analytics.destination,
            surface: analytics.surface,
            locale,
        });
    }

    const inner = (
        <>
            {variant !== "onDark" ? (
                <span
                    aria-hidden
                    className={cx(
                        "pointer-events-none absolute inset-0 origin-left scale-x-0 transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 motion-reduce:transition-none",
                        fillBg[variant],
                    )}
                />
            ) : null}
            {showGlaze ? (
                <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[inherit] motion-reduce:hidden"
                >
                    <span
                        className={cx(
                            "absolute inset-y-0 left-0 w-1/3",
                            "bg-gradient-to-r from-transparent to-transparent",
                            glazeVia,
                            "animate-cobreo-glaze",
                            "group-hover:[animation-play-state:paused] group-focus-visible:[animation-play-state:paused]",
                        )}
                    />
                </span>
            ) : null}
            <span className="relative z-10 inline-flex items-center gap-1.5">
                {iconLeading ? (
                    <span className="inline-flex transition-transform duration-300 ease-out group-hover:-translate-x-px">
                        {iconLeading}
                    </span>
                ) : null}
                <span data-text>{children}</span>
                {iconTrailing ? (
                    <span className="inline-flex transition-transform duration-300 ease-out group-hover:translate-x-1">
                        {iconTrailing}
                    </span>
                ) : null}
            </span>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={classes}
                onClick={() => {
                    handleAnalytics();
                }}
            >
                {inner}
            </Link>
        );
    }

    return (
        <button
            type={type}
            disabled={disabled}
            onClick={(e) => {
                handleAnalytics();
                onClick?.(e);
            }}
            className={classes}
        >
            {inner}
        </button>
    );
}
