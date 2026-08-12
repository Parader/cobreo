"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/base/buttons/button";
import { Link, usePathname } from "@/i18n/navigation";
import { getAdminSlug } from "@/lib/admin-path";

export function SiteFooter() {
    const t = useTranslations("footer");
    const pathname = usePathname();
    const year = new Date().getFullYear();

    if (pathname?.includes(getAdminSlug())) {
        return null;
    }

    return (
        <footer className="bg-cobreo-ink text-[#efedea]">
            <div className="mx-auto flex max-w-container flex-col gap-8 px-4 py-12 md:px-8">
                <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                    <div className="relative h-7 w-[76px]">
                        <Image src="/images/logo-footer.svg" alt="Cobreo" fill className="object-contain object-left" />
                    </div>
                    <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold" aria-label="Footer">
                        <Link href="/services" className="hover:opacity-80">
                            {t("services")}
                        </Link>
                        <Link href="/contact" className="hover:opacity-80">
                            {t("contact")}
                        </Link>
                        <Link href="/a-propos" className="hover:opacity-80">
                            {t("about")}
                        </Link>
                    </nav>
                    <Button href="/contact" color="primary" size="md">
                        {t("cta")}
                    </Button>
                </div>
                <hr className="border-white/10" />
                <div className="flex flex-col justify-between gap-4 text-sm text-white/60 md:flex-row">
                    <p>{t("rights", { year })}</p>
                    <div className="flex gap-4">
                        <span>{t("terms")}</span>
                        <span>{t("privacy")}</span>
                        <span>{t("cookies")}</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
