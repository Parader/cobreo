import type { MetadataRoute } from "next";
import { getAdminSlug } from "@/lib/admin-path";

/** AI search / recommendation crawlers and major indexers we explicitly welcome. */
const AI_AND_SEARCH_BOTS = [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-Web",
    "PerplexityBot",
    "Google-Extended",
    "Applebot-Extended",
    "Bingbot",
    "CCBot",
] as const;

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cobreo.ca";
    const admin = getAdminSlug();
    const disallow = [`/fr/${admin}`, `/en/${admin}`, `/fr/${admin}/`, `/en/${admin}/`];

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow,
            },
            {
                userAgent: [...AI_AND_SEARCH_BOTS],
                allow: "/",
                disallow,
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
