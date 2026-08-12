import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://cobreo.ca"),
    title: {
        default: "Cobreo",
        template: "%s · Cobreo",
    },
    applicationName: "Cobreo",
};

export const viewport: Viewport = {
    themeColor: "#4d6b97",
    colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className="bg-primary antialiased">{children}</body>
        </html>
    );
}
