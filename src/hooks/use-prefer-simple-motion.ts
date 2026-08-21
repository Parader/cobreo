"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * Prefer simple (visible) motion on WebKit/Safari.
 * Motion v12 WAAPI + filter/opacity entrances can leave content stuck at opacity 0,
 * or throw and blank the page on Safari / iOS.
 */
export function usePreferSimpleMotion(): boolean {
    const reduce = useReducedMotion();
    const [safariLike, setSafariLike] = useState(false);

    useEffect(() => {
        if (typeof navigator === "undefined") return;
        const ua = navigator.userAgent;
        const isIOS =
            /iPhone|iPad|iPod/i.test(ua) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
        const isSafariDesktop =
            /AppleWebKit/i.test(ua) &&
            /Safari/i.test(ua) &&
            !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/i.test(ua);
        setSafariLike(Boolean(isIOS || isSafariDesktop));
    }, []);

    return Boolean(reduce || safariLike);
}
