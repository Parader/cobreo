/**
 * Supabase env helpers.
 * Supports both legacy JWT keys (anon / service_role) and new keys
 * (sb_publishable_… / sb_secret_…).
 */
export function getSupabaseUrl() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    }
    return url;
}

/** Browser / SSR key — publishable or legacy anon */
export function getSupabasePublishableKey() {
    const key =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!key) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
        );
    }
    return key;
}

/** Server-only key — secret or legacy service_role. Never expose to the client. */
export function getSupabaseSecretKey() {
    const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!key) {
        throw new Error("Missing SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)");
    }
    return key;
}

export function getSupabasePublishableKeyOptional() {
    return (
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        null
    );
}
