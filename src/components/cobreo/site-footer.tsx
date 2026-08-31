"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageChatSquare } from "@untitledui/icons";
import { Link, usePathname } from "@/i18n/navigation";
import { getAdminSlug } from "@/lib/admin-path";
import { LINKEDIN_URL } from "@/lib/seo";
import { LinkedIn } from "@/components/foundations/social-icons";
import { CobreoButton } from "@/components/cobreo/cobreo-button";

export function SiteFooter() {
    const t = useTranslations("footer");
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const year = 2026;

    useEffect(() => {
        setMounted(true);
    }, []);

    // Avoid SSR/client pathname mismatches on admin routes
    if (mounted && pathname?.includes(getAdminSlug())) {
        return null;
    }

    return (
        <footer className="relative overflow-hidden bg-[#171718] text-[#efedea]" style={{ fontFamily: '"SN Pro Variable", ui-sans-serif, sans-serif' }}>
            <div className="relative z-10 mx-auto flex max-w-container flex-col gap-12 px-4 pb-24 pt-20 md:px-8 md:pt-24">
                <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-start">
                    <div className="flex flex-col gap-8">
                        <div className="relative h-5 w-[76px]">
                            <Image src="/images/logo-footer.svg" alt="Cobreo" fill className="object-contain object-left" />
                        </div>
                        <nav className="flex flex-wrap items-center gap-x-9 gap-y-4 text-sm font-semibold text-[#efedea]" aria-label="Footer">
                            <Link
                                href="/services"
                                className="opacity-90 transition duration-100 ease-linear hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a6b5cb]"
                            >
                                {t("services")}
                            </Link>
                            <Link
                                href="/a-propos"
                                className="opacity-90 transition duration-100 ease-linear hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a6b5cb]"
                            >
                                {t("about")}
                            </Link>
                            <Link
                                href="/contact"
                                className="opacity-90 transition duration-100 ease-linear hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a6b5cb]"
                            >
                                {t("contact")}
                            </Link>
                            <Link
                                href="/confidentialite"
                                className="opacity-90 transition duration-100 ease-linear hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a6b5cb]"
                            >
                                {t("privacy")}
                            </Link>
                        </nav>
                        <div className="flex items-center gap-4">
                            <span className="text-xs font-semibold tracking-wide text-white/45 uppercase">
                                {t("followUs")}
                            </span>
                            <a
                                href={LINKEDIN_URL}
                                target="_blank"
                                rel="noopener"
                                aria-label={t("linkedin")}
                                className="inline-flex size-9 items-center justify-center rounded-full bg-white/8 text-[#efedea]/80 transition duration-100 ease-linear hover:bg-white/15 hover:text-[#efedea] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a6b5cb]"
                            >
                                <LinkedIn size={16} aria-hidden />
                            </a>
                        </div>
                    </div>
                    <CobreoButton
                        href="/contact"
                        variant="primary"
                        size="xl"
                        iconLeading={<MessageChatSquare className="size-5" />}
                        analytics={{ ctaId: "footer_contact", destination: "contact", surface: "footer" }}
                    >
                        {t("cta")}
                    </CobreoButton>
                </div>
                <hr className="border-white/10" />
                <div className="flex flex-col justify-between gap-4 text-sm text-white/50 md:flex-row">
                    <p suppressHydrationWarning>{t("rights", { year })}</p>
                    <div className="flex gap-6">
                        <Link
                            href="/conditions"
                            className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a6b5cb]"
                        >
                            {t("terms")}
                        </Link>
                        <Link
                            href="/confidentialite"
                            className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a6b5cb]"
                        >
                            {t("privacy")}
                        </Link>
                        <Link
                            href="/cookies"
                            className="hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a6b5cb]"
                        >
                            {t("cookies")}
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
