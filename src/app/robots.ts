import type { MetadataRoute } from "next";
import { getAdminSlug } from "@/lib/admin-path";

export default function robots(): MetadataRoute.Robots {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cobreo.ca";
    const admin = getAdminSlug();

    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [`/fr/${admin}`, `/en/${admin}`, `/fr/${admin}/`, `/en/${admin}/`],
            },
        ],
        sitemap: `${siteUrl}/sitemap.xml`,
    };
}
