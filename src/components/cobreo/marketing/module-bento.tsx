"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FC } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
    Calendar,
    CurrencyDollarCircle,
    Globe01,
    Heart,
    Passcode,
    Ticket01,
    UserCircle,
    Users01,
    Zap,
} from "@untitledui/icons";
import { Link } from "@/i18n/navigation";
import { easeLuxury } from "@/components/cobreo/motion";
import { cx } from "@/utils/cx";

/** Filename stem under /public/images/modules/ */
const illustrationFiles: Record<string, string> = {
    crm: "crm",
    events: "events",
    satisfaction: "satisfaction",
    booking: "bookings",
    automation: "automation",
    sites: "sites",
    portals: "portals",
    hr: "hr",
    finance: "finances",
};

export type BentoItem = {
    id: string;
    name: string;
    tagline: string;
    points: string[];
    lead?: boolean;
};

type Accent = {
    icon: FC<{ className?: string }>;
    tile: string;
    iconClass: string;
};

/** Brand palette only: steel blue, navy, sage — no red. */
const accents: Record<string, Accent> = {
    crm: { icon: Users01, tile: "bg-[#4d6b97]/12 text-[#253353]", iconClass: "text-[#4d6b97]" },
    events: { icon: Ticket01, tile: "bg-[#253353]/10 text-[#253353]", iconClass: "text-[#253353]" },
    satisfaction: { icon: Heart, tile: "bg-[#b1b6a6]/35 text-[#253353]", iconClass: "text-[#5a6254]" },
    booking: { icon: Calendar, tile: "bg-[#5f7aa1]/14 text-[#253353]", iconClass: "text-[#4d6b97]" },
    automation: { icon: Zap, tile: "bg-[#4d6b97]/12 text-[#253353]", iconClass: "text-[#4d6b97]" },
    sites: { icon: Globe01, tile: "bg-[#b1b6a6]/30 text-[#253353]", iconClass: "text-[#5a6254]" },
    portals: { icon: Passcode, tile: "bg-[#253353]/10 text-[#253353]", iconClass: "text-[#253353]" },
    hr: { icon: UserCircle, tile: "bg-[#5f7aa1]/12 text-[#253353]", iconClass: "text-[#4d6b97]" },
    finance: { icon: CurrencyDollarCircle, tile: "bg-[#4d6b97]/12 text-[#253353]", iconClass: "text-[#4d6b97]" },
};

const fallbackAccent: Accent = accents.crm;

/**
 * Full-bleed page art — anchored to the right viewport edge, outside the content
 * grid. Soft mask only on the text-facing side; overall opacity stays strong.
 */
function ModuleBleedArt({ item, variant }: { item: BentoItem; variant: "desktop" | "mobile" }) {
    const file = illustrationFiles[item.id];
    if (!file) return null;

    const isDesktop = variant === "desktop";

    return (
        <div
            aria-hidden
            data-module-illustration
            className={cx(
                "pointer-events-none absolute",
                isDesktop
                    ? cx(
                          "top-1/2 right-0 z-0 hidden -translate-y-[42%] lg:block",
                          /* Large art living in the right margin and beyond the viewport */
                          "w-[min(58vw,760px)] xl:w-[min(54vw,820px)]",
                          "translate-x-[12%] xl:translate-x-[16%]",
                          "opacity-[0.68]",
                          /* Fade only toward the copy (left), keep the outer edge solid */
                          "[mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.35)_18%,#000_42%,#000_100%)]",
                          "[-webkit-mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.35)_18%,#000_42%,#000_100%)]",
                      )
                    : cx(
                          "relative right-0 z-0 mt-5 w-[min(92vw,420px)] translate-x-[8%] sm:w-[min(88vw,460px)] sm:translate-x-[12%]",
                          "opacity-[0.6]",
                          "[mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.45)_22%,#000_48%,#000_100%)]",
                          "[-webkit-mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.45)_22%,#000_48%,#000_100%)]",
                      ),
            )}
        >
            <Image
                src={`/images/modules/${file}.webp`}
                alt=""
                width={1024}
                height={768}
                className="h-auto w-full object-contain object-right"
                sizes={isDesktop ? "min(58vw, 820px)" : "min(92vw, 460px)"}
                priority={false}
            />
        </div>
    );
}

function ModuleDetailCopy({ item }: { item: BentoItem }) {
    const accent = accents[item.id] ?? fallbackAccent;
    const Icon = accent.icon;

    return (
        <div className="relative z-10 max-w-[32rem]">
            <div className="flex items-start gap-3">
                <span className={cx("mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg", accent.tile)}>
                    <Icon className={cx("size-4", accent.iconClass)} aria-hidden />
                </span>
                <div className="min-w-0">
                    <h3 className="font-display text-[clamp(1.55rem,2.6vw,2.15rem)] font-normal tracking-[-0.03em] text-[#090a24]">
                        {item.name}
                    </h3>
                    {item.tagline ? (
                        <p className="mt-2 max-w-[36ch] text-[15px] leading-relaxed text-[#525252] sm:text-[16px] sm:leading-7">
                            {item.tagline}
                        </p>
                    ) : null}
                </div>
            </div>

            <ul className="mt-6 space-y-2.5 sm:mt-7 sm:space-y-3">
                {item.points.map((point) => (
                    <li
                        key={point}
                        className="flex gap-2.5 text-[15px] leading-snug text-[#404040] sm:text-[16px] sm:leading-6"
                    >
                        <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-[#5f7aa1]" aria-hidden />
                        <span>{point}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function ModuleBento({ items, linkLabel, linkHref }: { items: BentoItem[]; linkLabel?: string; linkHref?: string }) {
    const reduce = useReducedMotion();
    const [active, setActive] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [indicator, setIndicator] = useState({ top: 0, height: 0 });

    const syncIndicator = () => {
        const list = listRef.current;
        const item = itemRefs.current[active];
        if (!list || !item) return;
        const listRect = list.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        setIndicator({
            top: itemRect.top - listRect.top,
            height: itemRect.height,
        });
    };

    useLayoutEffect(() => {
        syncIndicator();
    }, [active, items]);

    useEffect(() => {
        const item = itemRefs.current[active];
        if (!item) return;
        const ro = new ResizeObserver(() => syncIndicator());
        ro.observe(item);
        window.addEventListener("resize", syncIndicator);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", syncIndicator);
        };
    }, [active]);

    const current = items[active] ?? items[0];
    if (!current) return null;

    return (
        <div className="relative overflow-x-hidden">
            {/* Desktop bleed art — full section width, outside the content grid */}
            <div className="pointer-events-none absolute inset-y-0 right-0 left-0 z-0 hidden lg:block">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={`art-${current.id}`}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduce ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.45, ease: easeLuxury }}
                        className="absolute inset-0"
                    >
                        <ModuleBleedArt item={current} variant="desktop" />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
                <div className="relative min-w-0 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,24rem)_minmax(0,36rem)] xl:gap-14">
                    {/* Left: compact module selector */}
                    <div ref={listRef} className="relative z-20 min-w-0" role="listbox" aria-label="Modules">
                        <motion.span
                            aria-hidden
                            className="pointer-events-none absolute left-0 w-1 rounded-full bg-[#5f7aa1]"
                            initial={false}
                            animate={{
                                top: indicator.top,
                                height: Math.max(indicator.height, 8),
                            }}
                            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 38, mass: 0.7 }}
                        />

                        {items.map((item, index) => {
                            const isActive = index === active;
                            const accent = accents[item.id] ?? fallbackAccent;
                            const Icon = accent.icon;
                            const preview = item.tagline || item.points[0] || "";

                            return (
                                <div key={item.id} className="relative">
                                    <motion.button
                                        ref={(el) => {
                                            itemRefs.current[index] = el;
                                        }}
                                        type="button"
                                        role="option"
                                        aria-selected={isActive}
                                        aria-pressed={isActive}
                                        onClick={() => setActive(index)}
                                        className={cx(
                                            "group relative w-full cursor-pointer rounded-r-xl py-3.5 pr-4 pl-8 text-left transition-colors duration-200 sm:py-4 sm:pr-5",
                                            "hover:bg-[#4d6b97]/[0.04]",
                                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                                            isActive && "bg-[#4d6b97]/[0.03]",
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className={cx(
                                                    "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                                                    isActive
                                                        ? accent.tile
                                                        : "bg-[#4d6b97]/[0.06] text-[#737373] group-hover:bg-[#4d6b97]/10 group-hover:text-[#4d6b97]",
                                                )}
                                            >
                                                <Icon className={cx("size-4", isActive ? accent.iconClass : undefined)} aria-hidden />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h3
                                                    className={cx(
                                                        "text-[16px] font-semibold leading-snug tracking-[-0.01em] transition-colors duration-200 sm:text-[17px] sm:leading-[1.35]",
                                                        isActive ? "text-[#090a24]" : "text-[#090a24]/75 group-hover:text-[#090a24]",
                                                    )}
                                                >
                                                    {item.name}
                                                </h3>
                                                <p
                                                    className={cx(
                                                        "mt-1 line-clamp-1 text-[13px] leading-relaxed transition-colors sm:text-[14px]",
                                                        isActive
                                                            ? "text-[#525252]"
                                                            : "text-[#525252]/70 group-hover:text-[#525252]",
                                                    )}
                                                >
                                                    {preview}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>

                                    {/* Mobile: detail under selected item; art sibling so edge bleed is not clipped */}
                                    <AnimatePresence initial={false}>
                                        {isActive ? (
                                            <motion.div
                                                key={`mobile-detail-${item.id}`}
                                                initial={reduce ? false : { opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={reduce ? undefined : { opacity: 0, height: 0 }}
                                                transition={{ duration: 0.4, ease: easeLuxury }}
                                                className="overflow-hidden lg:hidden"
                                            >
                                                <div className="px-2 pt-3 pb-1 sm:px-3">
                                                    <ModuleDetailCopy item={item} />
                                                </div>
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                    <AnimatePresence initial={false}>
                                        {isActive ? (
                                            <motion.div
                                                key={`mobile-art-${item.id}`}
                                                initial={reduce ? false : { opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={reduce ? undefined : { opacity: 0, y: -4 }}
                                                transition={{ duration: 0.4, ease: easeLuxury }}
                                                className="relative overflow-visible pb-4 lg:hidden"
                                            >
                                                <ModuleBleedArt item={item} variant="mobile" />
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    {/* Desktop: text-only detail — art lives outside this column */}
                    <div className="relative z-10 mt-2 hidden min-w-0 lg:mt-1 lg:block">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={current.id}
                                initial={reduce ? false : { opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                                transition={{ duration: 0.45, ease: easeLuxury }}
                            >
                                <ModuleDetailCopy item={current} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {linkHref && linkLabel ? (
                    <Link href={linkHref} className="mt-8 inline-flex text-sm font-semibold text-[#253353]">
                        {linkLabel}
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
