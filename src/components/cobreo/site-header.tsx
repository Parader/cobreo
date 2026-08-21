"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FileCheck02, Menu01, XClose } from "@untitledui/icons";
import { Link, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getAdminSlug } from "@/lib/admin-path";
import { DiagnosticEntryButton } from "@/components/cobreo/diagnostic/diagnostic-entry-button";
import { getDiagnosticStatus, type DiagnosticStatus } from "@/lib/diagnostic/v7/persistence";
import { AnalyticsEvents } from "@/lib/analytics/events";
import { trackEvent } from "@/lib/analytics/posthog";
import { trackCtaClick } from "@/lib/analytics/track-cta";
import { cx } from "@/utils/cx";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]";

function isNavActive(pathname: string | null, href: string) {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
}

function navLinkClassName(active: boolean) {
    return cx(
        "rounded-md px-2 py-1.5 text-base font-semibold transition-colors duration-100 ease-linear",
        focusRing,
        active ? "bg-[#4d6b97]/10 text-[#253353]" : "text-[#404040] hover:text-[#171717]",
    );
}

function mobileNavLinkClassName(active: boolean) {
    return cx(
        "rounded-lg px-3 py-3 text-base font-semibold transition-colors duration-100 ease-linear",
        focusRing,
        active ? "bg-[#4d6b97]/12 text-[#253353]" : "text-[#171717] hover:bg-[#171717]/5",
    );
}

function MobileDiagnosticLabel({ idleLabel }: { idleLabel: string }) {
    const td = useTranslations("diagnostic");
    const [status, setStatus] = useState<DiagnosticStatus | null>(null);

    useEffect(() => {
        setStatus(getDiagnosticStatus());
    }, []);

    if (status === "completed") return <>{td("viewResultsCta")}</>;
    if (status === "in_progress") return <>{td("resumeCta")}</>;
    return <>{idleLabel}</>;
}

export function SiteHeader() {
    const t = useTranslations("nav");
    const locale = useLocale() as Locale;
    const pathname = usePathname();
    const otherLocale = locale === "fr" ? "en" : "fr";
    const adminSlug = getAdminSlug();
    const [hidden, setHidden] = useState(false);
    const [atTop, setAtTop] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [headerFocused, setHeaderFocused] = useState(false);
    const lastY = useRef(0);
    const menuId = useId();
    const headerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        setMounted(true);
        lastY.current = window.scrollY;
        setAtTop(window.scrollY < 12);
        const onScroll = () => {
            const y = window.scrollY;
            const delta = y - lastY.current;
            setAtTop(y < 12);
            if (y < 48) {
                setHidden(false);
            } else if (delta > 8) {
                setHidden(true);
            } else if (delta < -8) {
                setHidden(false);
            }
            lastY.current = y;
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [menuOpen]);

    if (mounted && pathname?.includes(adminSlug)) {
        return null;
    }

    const effectivelyHidden = hidden && !headerFocused && !menuOpen;

    const links = [
        { href: "/services" as const, label: t("services") },
        { href: "/a-propos" as const, label: t("about") },
        { href: "/contact" as const, label: t("contact") },
    ];

    return (
        <header
            ref={headerRef}
            onFocusCapture={() => setHeaderFocused(true)}
            onBlurCapture={(e) => {
                const next = e.relatedTarget;
                if (next instanceof Node && headerRef.current?.contains(next)) return;
                setHeaderFocused(false);
            }}
            className={cx(
                "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,backdrop-filter,border-color,transform,box-shadow] duration-300 ease-out",
                atTop && !menuOpen
                    ? "border-transparent bg-transparent shadow-none backdrop-blur-none"
                    : "border-[#171717]/10 bg-[#efedea]/90 shadow-[0_1px_0_rgba(23,23,23,0.06)] backdrop-blur-xl",
                effectivelyHidden ? "-translate-y-full" : "translate-y-0",
            )}
        >
            <div className="mx-auto flex h-20 max-w-container items-center justify-between px-4 md:h-24 md:px-8">
                <div className="flex items-center gap-8">
                    <Link
                        href="/"
                        aria-label="Cobreo"
                        className={cx("relative block h-7 w-[76px] shrink-0 -translate-y-1 rounded-sm", focusRing)}
                        onClick={(e) => {
                            if (pathname !== "/") return;
                            e.preventDefault();
                            setMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                    >
                        <Image src="/images/cobreologo.svg" alt="Cobreo" fill className="object-contain object-left" priority />
                    </Link>
                    <nav className="hidden items-center gap-3 lg:gap-4 md:flex" aria-label={t("primaryNav")}>
                        {links.map((link) => {
                            const active = isNavActive(pathname, link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={navLinkClassName(active)}
                                    aria-current={active ? "page" : undefined}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <Link
                        href={pathname || "/"}
                        locale={otherLocale}
                        className={cx(
                            "rounded-lg px-3 py-2 text-sm font-semibold text-[#525252] transition-colors duration-100 ease-linear hover:text-[#404040]",
                            focusRing,
                        )}
                        aria-label={otherLocale === "en" ? "Switch to English" : "Passer en français"}
                        onClick={() => {
                            trackEvent(AnalyticsEvents.localeSwitched, {
                                from: locale,
                                to: otherLocale,
                            });
                        }}
                    >
                        {t("lang")}
                    </Link>
                    <div className="hidden sm:block">
                        <DiagnosticEntryButton
                            variant="ghost"
                            size="md"
                            surface="header"
                            ctaId="header_diagnostic"
                            idleLabel={t("diagnostic")}
                            iconLeading={<FileCheck02 className="size-5" />}
                            className={isNavActive(pathname, "/diagnostic") ? "bg-[#4d6b97]/10" : undefined}
                        />
                    </div>
                    <button
                        type="button"
                        className={cx(
                            "inline-flex size-10 items-center justify-center rounded-lg text-[#404040] transition-colors duration-100 ease-linear hover:bg-[#171717]/5 md:hidden",
                            focusRing,
                        )}
                        aria-expanded={menuOpen}
                        aria-controls={menuId}
                        aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
                        onClick={() => setMenuOpen((o) => !o)}
                    >
                        {menuOpen ? <XClose className="size-6" aria-hidden /> : <Menu01 className="size-6" aria-hidden />}
                    </button>
                </div>
            </div>

            {menuOpen ? (
                <div
                    id={menuId}
                    className="border-t border-[#171717]/10 bg-[#efedea] px-4 py-4 md:hidden"
                >
                    <nav className="flex flex-col gap-1.5" aria-label={t("primaryNav")}>
                        {links.map((link) => {
                            const active = isNavActive(pathname, link.href);
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={mobileNavLinkClassName(active)}
                                    aria-current={active ? "page" : undefined}
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                        <Link
                            href="/diagnostic"
                            className={cx(
                                "mt-2 inline-flex items-center gap-2 rounded-lg px-3 py-3 text-base font-semibold transition-colors duration-100 ease-linear",
                                focusRing,
                                isNavActive(pathname, "/diagnostic")
                                    ? "bg-[#4d6b97]/12 text-[#253353]"
                                    : "text-[#4d6b97] hover:bg-[#4d6b97]/10",
                            )}
                            aria-current={isNavActive(pathname, "/diagnostic") ? "page" : undefined}
                            onClick={() => {
                                trackCtaClick({
                                    ctaId: "header_diagnostic_mobile",
                                    destination: "diagnostic",
                                    surface: "header_mobile",
                                    locale,
                                });
                                setMenuOpen(false);
                            }}
                        >
                            <FileCheck02 className="size-5" aria-hidden />
                            <MobileDiagnosticLabel idleLabel={t("diagnostic")} />
                        </Link>
                    </nav>
                </div>
            ) : null}
        </header>
    );
}
