"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

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
 * Latches after the first client decision so we never flip simple → complex
 * mid-scroll (that remounted opacity:0 reveals and skipped already-passed sections).
 */
export function usePreferSimpleMotion(): boolean {
    const reduce = useReducedMotion();
    const [simple, setSimple] = useState(true);
    const [latched, setLatched] = useState(false);

    useEffect(() => {
        if (latched) return;
        setSimple(isSafariLikeUa());
        setLatched(true);
    }, [latched]);

    // Until latched: stay simple (content visible). After: Safari stays simple; others allow complex.
    return Boolean(reduce || simple || !latched);
}
