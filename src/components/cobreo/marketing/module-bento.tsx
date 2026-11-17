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
 * Large, frameless illustration used as a set-back background — offset, bleeding,
 * low opacity + soft mask so foreground copy stays dominant.
 */
function ModuleBackdrop({ item }: { item: BentoItem }) {
    const file = illustrationFiles[item.id];
    if (!file) return null;

    return (
        <div
            aria-hidden
            data-module-illustration
            className={cx(
                "pointer-events-none absolute inset-0 overflow-visible",
                "opacity-[0.18] sm:opacity-[0.2] lg:opacity-[0.22]",
            )}
        >
            <div
                className={cx(
                    "absolute",
                    /* Offset toward the bottom-right / edge and bleed past the panel */
                    "-right-[18%] -bottom-[22%] w-[118%] max-w-none sm:-right-[14%] sm:-bottom-[18%] sm:w-[108%]",
                    "lg:-right-[22%] lg:-bottom-[28%] lg:w-[125%] xl:-right-[26%] xl:w-[132%]",
                    /* Soft fade so art dissolves under the copy */
                    "[mask-image:radial-gradient(ellipse_72%_68%_at_72%_78%,#000_28%,transparent_78%)]",
                    "[-webkit-mask-image:radial-gradient(ellipse_72%_68%_at_72%_78%,#000_28%,transparent_78%)]",
                )}
            >
                <Image
                    src={`/images/modules/${file}.webp`}
                    alt=""
                    width={1024}
                    height={768}
                    className="h-auto w-full object-contain object-right-bottom"
                    sizes="(max-width: 1023px) 90vw, min(52vw, 640px)"
                    priority={false}
                />
            </div>
        </div>
    );
}

function ModuleDetailPanel({ item }: { item: BentoItem }) {
    const accent = accents[item.id] ?? fallbackAccent;
    const Icon = accent.icon;

    return (
        <div className="relative min-h-[16rem] overflow-hidden sm:min-h-[18rem] lg:min-h-[22rem]">
            <ModuleBackdrop item={item} />

            <div className="relative z-10 max-w-[34rem] pr-2 sm:pr-4">
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
        <div>
            <div className="relative min-w-0 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:gap-12">
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

                                {/* Mobile: detail panel under the selected item */}
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
                                            <div className="px-2 pb-5 pt-2 sm:px-3">
                                                <ModuleDetailPanel item={item} />
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop: right detail panel with background illustration */}
                <div className="relative z-10 mt-2 hidden min-w-0 overflow-x-clip lg:mt-0 lg:block">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={current.id}
                            initial={reduce ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? undefined : { opacity: 0, y: -6 }}
                            transition={{ duration: 0.45, ease: easeLuxury }}
                        >
                            <ModuleDetailPanel item={current} />
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
    );
}
