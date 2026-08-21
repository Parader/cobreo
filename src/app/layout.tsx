import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "@/styles/globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://cobreo.ca"),
    title: {
        default: "Cobreo",
        template: "%s · Cobreo",
    },
    applicationName: "Cobreo",
    manifest: "/site.webmanifest",
    icons: {
        icon: [
            { url: "/favicon.ico" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
};

export const viewport: Viewport = {
    themeColor: "#4d6b97",
    colorScheme: "light",
};

/** Locale layout owns `<html>` / `<body>` so `lang` matches the active locale. */
export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
