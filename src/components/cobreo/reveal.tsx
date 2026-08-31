"use client";

import { type ReactNode, type Ref, useEffect, useRef, useState } from "react";
import { motion, useInView, type Variants } from "motion/react";

type RevealTag = "div" | "ul" | "ol";

const tags = {
    div: motion.div,
    ul: motion.ul,
    ol: motion.ol,
} as const;

/**
 * Staggered scroll reveal with a watchdog.
 *
 * Reveal children fade from opacity 0, so a missed IntersectionObserver would strand
 * them invisible — the failure mode we hit on iOS. A scroll-position fallback runs
 * alongside the observer: it checks the element's own rect on mount and on every scroll,
 * so anything the user has actually scrolled to shows even if the observer never fires.
 * The fallback is deliberately position-based rather than a blind timer, which would
 * reveal the whole page before the visitor got there.
 */
export function Reveal({
    as = "div",
    variants,
    amount = 0.15,
    className,
    children,
    elementRef,
    ...rest
}: {
    as?: RevealTag;
    variants: Variants;
    /** Fraction of the element that must be visible for the observer to fire. */
    amount?: number;
    className?: string;
    children: ReactNode;
    /** Forwarded to the rendered element when a caller needs to measure it. */
    elementRef?: Ref<HTMLElement>;
    "aria-label"?: string;
}) {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, amount, margin: "0px" });
    const [shown, setShown] = useState(false);
    const Tag = tags[as];

    useEffect(() => {
        if (inView) setShown(true);
    }, [inView]);

    useEffect(() => {
        if (shown) return;

        // Measuring straight from the scroll handler forces a synchronous layout on
        // every event, once per Reveal still waiting. Coalescing into one frame keeps
        // the read out of the scroll critical path.
        let frame = 0;

        const measure = () => {
            frame = 0;
            const el = ref.current;
            if (!el) return;
            if (el.getBoundingClientRect().top < window.innerHeight * 0.95) setShown(true);
        };

        const schedule = () => {
            if (frame) return;
            frame = requestAnimationFrame(measure);
        };

        schedule();
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule, { passive: true });
        return () => {
            if (frame) cancelAnimationFrame(frame);
            window.removeEventListener("scroll", schedule);
            window.removeEventListener("resize", schedule);
        };
    }, [shown]);

    return (
        <Tag
            ref={(node: HTMLElement | null) => {
                ref.current = node;
                if (typeof elementRef === "function") elementRef(node);
                else if (elementRef) (elementRef as { current: HTMLElement | null }).current = node;
            }}
            className={className}
            variants={variants}
            initial="hidden"
            animate={shown ? "show" : "hidden"}
            {...rest}
        >
            {children}
        </Tag>
    );
}
