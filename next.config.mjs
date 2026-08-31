import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        optimizePackageImports: ["@untitledui/icons"],
    },
    images: {
        formats: ["image/avif", "image/webp"],
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                ],
            },
            {
                // Brand assets would otherwise be revalidated on every view. On Netlify
                // the CDN serves /public without consulting this, so netlify.toml carries
                // the same rule — keep the two in sync.
                source: "/:dir(images|og|fonts)/:path*",
                headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
