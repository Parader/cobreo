"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cx } from "@/utils/cx";

type ProcessIllustrationKind = "identify" | "validate" | "develop" | "evolve";

const SRC: Record<ProcessIllustrationKind, string> = {
    identify: "/images/process-identify.svg",
    validate: "/images/process-validate.svg",
    develop: "/images/process-develop.svg",
    evolve: "/images/process-evolve.svg",
};

/** Small decorative path ids — soft color pulses only (main figure stays still) */
const ACCENT_IDS: Record<ProcessIllustrationKind, string[]> = {
    identify: [
        "Vector_6",
        "Vector_7",
        "Vector_8",
        "Vector_9",
        "Vector_10",
        "Vector_11",
        "Vector_12",
        "Vector_13",
        "Vector_14",
        "Vector_15",
        "Vector_16",
        "Vector_23",
        "Vector_25",
        "Vector_27",
    ],
    validate: ["Vector_4", "Vector_5", "Vector_6", "Vector_7", "Vector_17", "Vector_18", "Vector_19"],
    develop: ["Vector_8", "Vector_9", "Vector_10", "Vector_22"],
    evolve: ["Vector_3", "Vector_5", "Vector_6", "Vector_8", "Vector_9"],
};

/** Soft brand-tinted highlights for solid fills */
const TINTS = ["#4d6b97", "#5f7aa1", "#a6b5cb", "#df9882"] as const;

type ProcessIllustrationProps = {
    kind: ProcessIllustrationKind;
    className?: string;
};

/**
 * Inlines the process SVG and intermittently tints a few small decorative paths.
 * Main artwork stays still.
 */
export function ProcessIllustration({ kind, className }: ProcessIllustrationProps) {
    const reduce = useReducedMotion();
    const uid = useId().replace(/:/g, "");
    const hostRef = useRef<HTMLDivElement>(null);
    const [markup, setMarkup] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch(SRC[kind])
            .then((r) => r.text())
            .then((raw) => {
                if (cancelled) return;
                const scoped = raw
                    .replace(/id="([^"]+)"/g, `id="${uid}-$1"`)
                    .replace(/url\(#([^)]+)\)/g, `url(#${uid}-$1)`)
                    .replace(/href="#([^"]+)"/g, `href="#${uid}-$1"`)
                    .replace(/<svg([^>]*)>/, (_match, attrs: string) => {
                        const cleaned = attrs
                            .replace(/\s(width|height)="[^"]*"/g, "")
                            .replace(/\spreserveAspectRatio="[^"]*"/g, "");
                        return `<svg${cleaned} preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;display:block;max-width:100%;max-height:100%">`;
                    });
                setMarkup(scoped);
            })
            .catch(() => {
                if (!cancelled) setMarkup(null);
            });
        return () => {
            cancelled = true;
        };
    }, [kind, uid]);

    useEffect(() => {
        if (reduce || !markup || !hostRef.current) return;

        const root = hostRef.current;
        const svg = root.querySelector("svg");
        if (!svg) return;

        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        svg.style.width = "100%";
        svg.style.height = "100%";
        svg.style.display = "block";
        svg.style.overflow = "hidden";
        svg.style.maxWidth = "100%";
        svg.style.maxHeight = "100%";

        const targets = ACCENT_IDS[kind]
            .map((id) => root.querySelector(`#${CSS.escape(`${uid}-${id}`)}`) as SVGGraphicsElement | null)
            .filter((el): el is SVGGraphicsElement => Boolean(el));

        targets.forEach((el) => {
            el.style.willChange = "fill, opacity, filter";
        });

        const timers: number[] = [];
        let alive = true;

        const pulse = (el: SVGGraphicsElement, index: number) => {
            const wait = 2600 + Math.random() * 8000 + index * 320;
            const timer = window.setTimeout(() => {
                if (!alive) return;

                const fill = el.getAttribute("fill") ?? "";
                const isGradient = fill.startsWith("url(");
                const duration = 900 + Math.random() * 700;
                const easing = "cubic-bezier(0.33, 1, 0.68, 1)";

                if (!isGradient && fill && fill !== "none") {
                    const tint = TINTS[Math.floor(Math.random() * TINTS.length)];
                    el.animate([{ fill }, { fill: tint }, { fill }], {
                        duration,
                        easing,
                    });
                } else {
                    // Gradients / complex fills: soft brightness + opacity lift
                    el.animate(
                        [
                            { filter: "brightness(1)", opacity: 1 },
                            { filter: "brightness(1.35)", opacity: 0.92 },
                            { filter: "brightness(1)", opacity: 1 },
                        ],
                        { duration, easing },
                    );
                }

                pulse(el, index);
            }, wait);
            timers.push(timer);
        };

        targets.forEach((el, i) => pulse(el, i));

        return () => {
            alive = false;
            timers.forEach((t) => window.clearTimeout(t));
        };
    }, [kind, markup, reduce, uid]);

    return (
        <div
            ref={hostRef}
            className={cx("absolute inset-0 [&>svg]:h-full [&>svg]:w-full", className)}
            aria-hidden
            dangerouslySetInnerHTML={markup ? { __html: markup } : undefined}
        />
    );
}
