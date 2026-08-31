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
                // Netlify serves everything under /public with `max-age=0, must-revalidate`,
                // so brand assets are revalidated on every view. These names are not
                // content-hashed: bump a `?v=` query when replacing one.
                source: "/:dir(images|og|fonts)/:path*",
                headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
