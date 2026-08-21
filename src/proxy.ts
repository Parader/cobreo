import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * Edge-safe admin slug lookup. Never throw here — a missing env must not take
 * down every request (Netlify runs this as an Edge Function).
 */
function getAdminSlugSafe() {
    return (process.env.NEXT_PUBLIC_ADMIN_PATH_SECRET || process.env.ADMIN_PATH_SECRET || "").trim();
}

export function proxy(request: NextRequest) {
    const response = intlMiddleware(request);
    const adminSlug = getAdminSlugSafe();
    if (!adminSlug) {
        return response;
    }

    const { pathname } = request.nextUrl;
    const adminSegment = `/${adminSlug}`;
    const isAdminRoute = routing.locales.some(
        (locale) => pathname === `/${locale}${adminSegment}` || pathname.startsWith(`/${locale}${adminSegment}/`),
    );

    if (isAdminRoute) {
        // Auth is enforced in admin layouts/pages (Node runtime), not at the edge.
        response.headers.set("x-robots-tag", "noindex, nofollow");
        response.headers.set("Cache-Control", "private, no-store");
    }

    return response;
}

export const config = {
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
