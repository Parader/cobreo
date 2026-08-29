"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/** Layout effect on the client, plain effect during SSR (where it would warn and never run). */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function isSafariLikeUa() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent;
    const isIOS =
        /iPhone|iPad|iPod/i.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafariDesktop =
        /AppleWebKit/i.test(ua) &&
        /Safari/i.test(ua) &&
        !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua);
    return Boolean(isIOS || isSafariDesktop);
}

/**
 * Prefer simple (visible) motion on WebKit/Safari.
 *
 * Starts optimistic (complex) so mount-time entrances render their `hidden` state on
 * the very first paint — starting simple meant only components that happened to
 * remount on the flip ever animated. Downgrading to simple is safe because every
 * reveal variant keeps opacity at 1 and resets its transform, so the flip snaps
 * content to its neutral position instead of stranding it offset or invisible.
 *
 * The downgrade runs in a layout effect so Safari never paints the offset state,
 * and latches after the first client decision so the mode never oscillates mid-scroll.
 */
export function usePreferSimpleMotion(): boolean {
    const reduce = useReducedMotion();
    const [simple, setSimple] = useState(false);
    const [latched, setLatched] = useState(false);

    useIsomorphicLayoutEffect(() => {
        if (latched) return;
        setSimple(isSafariLikeUa());
        setLatched(true);
    }, [latched]);

    return Boolean(reduce || simple);
}
