import type { Transition, Variants } from "motion/react";

/** Soft decelerate — luxury product sites */
export const easeLuxury = [0.16, 1, 0.3, 1] as const;

export const easeSoft = [0.33, 1, 0.68, 1] as const;

export const duration = {
    entrance: 1.05,
    entranceSlow: 1.25,
    crossfade: 0.8,
    expand: 0.45,
} as const;

export function entranceTransition(delay = 0, durationOverride: number = duration.entrance): Transition {
    return {
        duration: durationOverride,
        delay,
        ease: easeLuxury,
    };
}

/**
 * Reveals fade in from opacity 0. Scroll-triggered groups must therefore go through
 * `Reveal` (components/cobreo/reveal.tsx), whose scroll-position fallback guarantees
 * content shows even when the IntersectionObserver misses — the cause of the stuck
 * invisible text we hit on iOS. Mount-time entrances need no fallback.
 *
 * Simple mode (reduced-motion preference, Safari/WebKit) keeps a short crossfade and
 * drops every transform: it is movement, not opacity, that reduced-motion asks us to
 * avoid, and returning no animation at all read as broken. Transforms are pinned to 0
 * so switching into simple mode mid-flight can never strand content offset.
 */
const simpleFade: Variants = {
    hidden: { opacity: 0, x: 0, y: 0, scale: 1 },
    show: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0.45, ease: easeSoft } },
};
export function revealVariants(
    reduce: boolean | null,
    direction: "up" | "left" | "right" = "up",
    delay = 0,
    durationOverride: number = duration.entrance,
): Variants {
    if (reduce) return simpleFade;

    const offset =
        direction === "up" ? { y: 28 } : direction === "left" ? { x: -32 } : { x: 32 };

    return {
        hidden: {
            opacity: 0,
            ...offset,
        },
        show: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: entranceTransition(delay, durationOverride),
        },
    };
}

/** Lighter child motion — for text lines, CTAs inside a staggered group.
 *  Do not set `delay` here: parent `staggerChildren` owns sequencing.
 *  Avoid CSS `filter`: it blurs text on Safari. */
export function childReveal(reduce: boolean | null, direction: "up" | "left" | "right" = "up"): Variants {
    if (reduce) return simpleFade;

    const offset =
        direction === "up" ? { y: 18 } : direction === "left" ? { x: -20 } : { x: 20 };

    return {
        hidden: {
            opacity: 0,
            ...offset,
        },
        show: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration: 0.85,
                ease: easeLuxury,
            },
        },
    };
}

/** Media / illustration — soft scale and fade */
export function mediaReveal(reduce: boolean | null): Variants {
    if (reduce) return simpleFade;

    return {
        hidden: {
            opacity: 0,
            scale: 0.96,
            y: 12,
        },
        show: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: entranceTransition(0, 1.1),
        },
    };
}

export function staggerContainer(reduce: boolean | null, stagger = 0.14, delayChildren = 0.1): Variants {
    if (reduce) {
        return {
            hidden: {},
            show: {},
        };
    }

    return {
        hidden: {},
        show: {
            transition: {
                staggerChildren: stagger,
                delayChildren,
            },
        },
    };
}

/** Slightly slower cascade for page heroes / dense lists */
export function staggerContainerSlow(reduce: boolean | null): Variants {
    return staggerContainer(reduce, 0.16, 0.12);
}

/** Safari-friendly in-view: low threshold, no negative rootMargin (breaks IO on WebKit). */
export function viewportOnce(amount = 0.15) {
    return { once: true, amount, margin: "0px" } as const;
}
