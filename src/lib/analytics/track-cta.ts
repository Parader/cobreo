import { AnalyticsEvents, type CtaDestination } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/posthog";

export function trackCtaClick(input: {
    ctaId: string;
    destination: CtaDestination;
    surface: string;
    locale: string;
}) {
    trackEvent(AnalyticsEvents.ctaClicked, {
        cta_id: input.ctaId,
        destination: input.destination,
        surface: input.surface,
        locale: input.locale,
    });
}
