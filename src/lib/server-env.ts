import fs from "node:fs";
import path from "node:path";

let loaded = false;

/**
 * Next only injects `.env*` into `process.env` at process boot.
 * If the key was added after `npm run dev` started (or boot skipped it),
 * server actions still see an empty value. Reload once from disk as fallback.
 */
export function ensureServerEnv(keys: string[] = [
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "CONTACT_NOTIFY_EMAIL",
    "BOOKING_ORGANIZER_EMAIL",
    "BOOKING_MEET_LINK",
]) {
    const missing = keys.some((key) => !process.env[key]?.trim());
    if (loaded && !missing) return;
    loaded = true;

    for (const file of [".env.local", ".env"]) {
        const full = path.join(/* turbopackIgnore: true */ process.cwd(), file);
        if (!fs.existsSync(full)) continue;
        for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const eq = trimmed.indexOf("=");
            if (eq < 0) continue;
            const key = trimmed.slice(0, eq).trim();
            if (!keys.includes(key)) continue;
            if (process.env[key]?.trim()) continue;
            let value = trimmed.slice(eq + 1).trim();
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }
            if (value) process.env[key] = value;
        }
    }
}
