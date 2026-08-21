import posthog from "posthog-js";
import type { AnalyticsEventName, AnalyticsEventPropsMap } from "@/lib/analytics/events";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const IS_DEV = process.env.NODE_ENV === "development";

let initialized = false;

/** PostHog is production-only — no init, capture, or session replay in local dev. */
export function isPostHogConfigured(): boolean {
    return Boolean(KEY) && !IS_DEV;
}

export function initPostHog(): typeof posthog | null {
    if (typeof window === "undefined") return null;
    if (IS_DEV || !KEY) return null;
    if (initialized) return posthog;

    posthog.init(KEY, {
        api_host: HOST,
        person_profiles: "identified_only",
        persistence: "localStorage+cookie",
        capture_pageview: false,
        capture_pageleave: true,
        autocapture: true,
        opt_out_capturing_by_default: true,
        disable_session_recording: false,
        session_recording: {
            maskAllInputs: true,
            maskTextSelector: "input, textarea, [data-ph-mask]",
            blockSelector: "[data-ph-block]",
        },
    });

    initialized = true;
    return posthog;
}

export function getPostHog(): typeof posthog | null {
    if (!initialized || !KEY) return null;
    return posthog;
}

export function optInAnalytics(): void {
    const client = initPostHog();
    if (!client) return;
    client.opt_in_capturing();
    try {
        client.startSessionRecording?.();
    } catch {
        // Session recording may already be running
    }
}

export function optOutAnalytics(): void {
    const client = getPostHog() ?? initPostHog();
    if (!client) return;
    try {
        client.stopSessionRecording?.();
    } catch {
        // ignore
    }
    client.opt_out_capturing();
}

export function capturePageview(path: string, locale: string): void {
    const client = getPostHog();
    if (!client || client.has_opted_out_capturing()) return;
    client.capture("$pageview", {
        $current_url: window.location.href,
        path,
        locale,
    });
}

export function trackEvent<E extends AnalyticsEventName>(
    event: E,
    properties: AnalyticsEventPropsMap[E],
): void {
    const client = getPostHog();
    if (!client || client.has_opted_out_capturing()) return;
    client.capture(event, properties as Record<string, unknown>);
}
