import { createClient } from "@supabase/supabase-js";
import { getSupabaseSecretKey, getSupabaseUrl } from "@/lib/supabase/env";

export function createServiceClient() {
    return createClient(getSupabaseUrl(), getSupabaseSecretKey(), {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
