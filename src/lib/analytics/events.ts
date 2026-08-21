export const AnalyticsEvents = {
    ctaClicked: "cta_clicked",
    diagnosticStarted: "diagnostic_started",
    diagnosticStepViewed: "diagnostic_step_viewed",
    diagnosticCompleted: "diagnostic_completed",
    diagnosticRestarted: "diagnostic_restarted",
    diagnosticLeadSubmitted: "diagnostic_lead_submitted",
    contactLeadSubmitted: "contact_lead_submitted",
    localeSwitched: "locale_switched",
    cookieConsentUpdated: "cookie_consent_updated",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvents)[keyof typeof AnalyticsEvents];

export type CtaDestination = "contact" | "diagnostic";

export type CtaClickedProps = {
    cta_id: string;
    destination: CtaDestination;
    surface: string;
    locale: string;
};

export type DiagnosticStartedProps = {
    locale: string;
    is_resume: boolean;
};

export type DiagnosticStepViewedProps = {
    locale: string;
    step_type: string;
    step_index: number;
    question_id?: string;
};

export type DiagnosticCompletedProps = {
    locale: string;
    has_opportunity: boolean;
    opportunity_count: number;
};

export type DiagnosticRestartedProps = {
    locale: string;
};

export type DiagnosticLeadSubmittedProps = {
    locale: string;
    has_opportunity: boolean;
};

export type ContactLeadSubmittedProps = {
    locale: string;
};

export type LocaleSwitchedProps = {
    from: string;
    to: string;
};

export type CookieConsentUpdatedProps = {
    analytics: boolean;
    marketing: boolean;
};

export type AnalyticsEventPropsMap = {
    [AnalyticsEvents.ctaClicked]: CtaClickedProps;
    [AnalyticsEvents.diagnosticStarted]: DiagnosticStartedProps;
    [AnalyticsEvents.diagnosticStepViewed]: DiagnosticStepViewedProps;
    [AnalyticsEvents.diagnosticCompleted]: DiagnosticCompletedProps;
    [AnalyticsEvents.diagnosticRestarted]: DiagnosticRestartedProps;
    [AnalyticsEvents.diagnosticLeadSubmitted]: DiagnosticLeadSubmittedProps;
    [AnalyticsEvents.contactLeadSubmitted]: ContactLeadSubmittedProps;
    [AnalyticsEvents.localeSwitched]: LocaleSwitchedProps;
    [AnalyticsEvents.cookieConsentUpdated]: CookieConsentUpdatedProps;
};
