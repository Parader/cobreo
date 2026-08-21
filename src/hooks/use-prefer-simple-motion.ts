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
 * Motion v12 WAAPI + filter/opacity entrances can leave content stuck at opacity 0,
 * or throw and blank the page on Safari / iOS.
 *
 * Important: stay on the simple path until the client confirms a capable browser.
 * Starting complex then flipping to simple mid-flight left Process texts
 * translateX-stuck on iPhone SE ("textes décalés").
 */
export function usePreferSimpleMotion(): boolean {
    const reduce = useReducedMotion();
    // SSR + first client paint: simple. Only enable complex after we know it's safe.
    const [allowComplex, setAllowComplex] = useState(false);

    useEffect(() => {
        setAllowComplex(!isSafariLikeUa());
    }, []);

    return Boolean(reduce || !allowComplex);
}
