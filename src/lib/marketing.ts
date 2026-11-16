/**
 * Primary marketing call to action.
 *
 * There is no public signup yet. Every "Demander une démo" button reads `href`
 * from here, so a later signup URL replaces the contact form in one place.
 * Absolute http(s) URLs are rendered as plain links; app paths stay locale-aware.
 */
export const demoCta = {
    href: "/contact",
} as const;

export const APP_URL = "https://app.cobreo.ca";
