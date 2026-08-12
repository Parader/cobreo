"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { FileCheck02 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getAdminSlug } from "@/lib/admin-path";

export function SiteHeader() {
    const t = useTranslations("nav");
    const locale = useLocale() as Locale;
    const pathname = usePathname();
    const otherLocale = locale === "fr" ? "en" : "fr";
    const adminSlug = getAdminSlug();

    if (pathname?.includes(adminSlug)) {
        return null;
    }

    return (
        <header className="sticky top-0 z-40 border-b border-transparent bg-primary/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-container items-center justify-between px-4 py-6 md:px-8">
                <div className="flex items-center gap-8">
                    <Link href="/" aria-label="Cobreo" className="relative h-7 w-[76px] shrink-0">
                        <Image src="/images/logo.svg" alt="Cobreo" fill className="object-contain object-left" priority />
                    </Link>
                    <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
                        <Link href="/services" className="rounded-md px-2 py-1.5 text-sm font-semibold text-secondary hover:text-primary">
                            {t("services")}
                        </Link>
                        <Link href="/a-propos" className="rounded-md px-2 py-1.5 text-sm font-semibold text-secondary hover:text-primary">
                            {t("about")}
                        </Link>
                        <Link href="/contact" className="rounded-md px-2 py-1.5 text-sm font-semibold text-secondary hover:text-primary">
                            {t("contact")}
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={pathname || "/"}
                        locale={otherLocale}
                        className="rounded-lg px-3 py-2 text-sm font-semibold text-tertiary hover:text-secondary"
                        aria-label={otherLocale === "en" ? "Switch to English" : "Passer en français"}
                    >
                        {t("lang")}
                    </Link>
                    <Button href="/diagnostic" color="secondary" size="md" iconLeading={FileCheck02} className="hidden sm:inline-flex">
                        {t("diagnostic")}
                    </Button>
                </div>
            </div>
        </header>
    );
}
