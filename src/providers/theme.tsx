"use client";

import { ThemeProvider } from "next-themes";

export function Theme({ children }: { children: React.ReactNode }) {
    // Force light: Untitled UI tokens + Cobreo brand break under system dark mode
    return (
        <ThemeProvider attribute="class" value={{ light: "light-mode", dark: "light-mode" }} forcedTheme="light" enableSystem={false}>
            {children}
        </ThemeProvider>
    );
}
