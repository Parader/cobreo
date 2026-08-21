import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { routing } from "./i18n/routing";
import { getAdminSlug } from "./lib/admin-path";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const adminSlug = getAdminSlug();
    const adminSegment = `/${adminSlug}`;

    const isAdminRoute = routing.locales.some(
        (locale) => pathname === `/${locale}${adminSegment}` || pathname.startsWith(`/${locale}${adminSegment}/`),
    );

    const response = intlMiddleware(request);

    if (!isAdminRoute) {
        return response;
    }

    const isLogin = routing.locales.some((locale) => pathname.startsWith(`/${locale}${adminSegment}/login`));

    response.headers.set("x-robots-tag", "noindex, nofollow");
    response.headers.set("Cache-Control", "private, no-store");

    if (isLogin) {
        return response;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        const locale = pathname.split("/")[1] || "fr";
        return NextResponse.redirect(new URL(`/${locale}${adminSegment}/login`, request.url));
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    response.cookies.set(name, value, options);
                });
            },
        },
    });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        const locale = pathname.split("/")[1] || "fr";
        return NextResponse.redirect(new URL(`/${locale}${adminSegment}/login`, request.url));
    }

    return response;
}

export const config = {
    matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
