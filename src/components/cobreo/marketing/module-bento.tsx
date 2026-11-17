"use client";

import { useEffect, useLayoutEffect, useRef, useState, type FC } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
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
    /** Soft wash behind the visual panel icon */
    wash: string;
    /** Icon tile */
    tile: string;
    iconClass: string;
    /** Chip background */
    chip: string;
};

/** Brand palette only: steel blue, navy, sage, soft slate — no red. */
const accents: Record<string, Accent> = {
    crm: {
        icon: Users01,
        wash: "from-[#4d6b97]/18 via-[#efedea] to-[#efedea]",
        tile: "bg-[#4d6b97]/12 text-[#253353]",
        iconClass: "text-[#4d6b97]",
        chip: "bg-[#4d6b97]/[0.08] text-[#404040]",
    },
    events: {
        icon: Ticket01,
        wash: "from-[#253353]/14 via-[#efedea] to-[#efedea]",
        tile: "bg-[#253353]/10 text-[#253353]",
        iconClass: "text-[#253353]",
        chip: "bg-[#253353]/[0.06] text-[#404040]",
    },
    satisfaction: {
        icon: Heart,
        wash: "from-[#b1b6a6]/45 via-[#efedea] to-[#efedea]",
        tile: "bg-[#b1b6a6]/35 text-[#253353]",
        iconClass: "text-[#5a6254]",
        chip: "bg-[#b1b6a6]/25 text-[#404040]",
    },
    booking: {
        icon: Calendar,
        wash: "from-[#5f7aa1]/20 via-[#efedea] to-[#efedea]",
        tile: "bg-[#5f7aa1]/14 text-[#253353]",
        iconClass: "text-[#4d6b97]",
        chip: "bg-[#5f7aa1]/[0.1] text-[#404040]",
    },
    automation: {
        icon: Zap,
        wash: "from-[#4d6b97]/16 via-[#efedea] to-[#efedea]",
        tile: "bg-[#4d6b97]/12 text-[#253353]",
        iconClass: "text-[#4d6b97]",
        chip: "bg-[#4d6b97]/[0.08] text-[#404040]",
    },
    sites: {
        icon: Globe01,
        wash: "from-[#b1b6a6]/40 via-[#efedea] to-[#efedea]",
        tile: "bg-[#b1b6a6]/30 text-[#253353]",
        iconClass: "text-[#5a6254]",
        chip: "bg-[#b1b6a6]/22 text-[#404040]",
    },
    portals: {
        icon: Passcode,
        wash: "from-[#253353]/12 via-[#efedea] to-[#efedea]",
        tile: "bg-[#253353]/10 text-[#253353]",
        iconClass: "text-[#253353]",
        chip: "bg-[#253353]/[0.06] text-[#404040]",
    },
    hr: {
        icon: UserCircle,
        wash: "from-[#5f7aa1]/18 via-[#efedea] to-[#efedea]",
        tile: "bg-[#5f7aa1]/12 text-[#253353]",
        iconClass: "text-[#4d6b97]",
        chip: "bg-[#5f7aa1]/[0.1] text-[#404040]",
    },
    finance: {
        icon: CurrencyDollarCircle,
        wash: "from-[#4d6b97]/14 via-[#efedea] to-[#efedea]",
        tile: "bg-[#4d6b97]/12 text-[#253353]",
        iconClass: "text-[#4d6b97]",
        chip: "bg-[#4d6b97]/[0.08] text-[#404040]",
    },
};

const fallbackAccent: Accent = accents.crm;

function ModuleVisual({ item }: { item: BentoItem }) {
    const locale = useLocale();
    const accent = accents[item.id] ?? fallbackAccent;
    const Icon = accent.icon;
    const file = illustrationFiles[item.id];
    const alt =
        locale === "en" ? `Illustration of the ${item.name} module` : `Illustration du module ${item.name}`;

    return (
        <div
            className={cx(
                "relative overflow-hidden rounded-2xl border border-[#171717]/8 bg-white",
                "shadow-[0_24px_60px_-36px_rgba(37,51,83,0.35)]",
            )}
        >
            <div className="relative flex flex-col p-5 sm:p-6 lg:p-7">
                <div
                    data-module-illustration
                    className="relative mb-5 aspect-[4/3] w-full overflow-hidden rounded-xl bg-white"
                >
                    {file ? (
                        <Image
                            src={`/images/modules/${file}.webp`}
                            alt={alt}
                            width={1024}
                            height={768}
                            className="h-full w-full object-contain object-center"
                            sizes="(max-width: 1024px) 100vw, 36rem"
                            priority={false}
                        />
                    ) : (
                        <div className={cx("absolute inset-0 m-auto flex size-14 items-center justify-center rounded-2xl", accent.tile)}>
                            <Icon className={cx("size-7", accent.iconClass)} aria-hidden />
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="font-display text-[clamp(1.5rem,2.4vw,2rem)] font-normal tracking-[-0.03em] text-[#090a24]">
                        {item.name}
                    </h3>
                    <p className="mt-2 max-w-[28ch] text-[15px] leading-relaxed text-[#525252] sm:text-[16px] sm:leading-7">
                        {item.tagline}
                    </p>
                    <ul className="mt-5 flex flex-wrap gap-1.5">
                        {item.points.map((point) => (
                            <li
                                key={point}
                                className={cx(
                                    "rounded-md px-2 py-1 text-[11px] leading-4 font-medium tracking-[-0.01em]",
                                    accent.chip,
                                )}
                            >
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>
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
            <div className="relative min-w-0 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] xl:gap-12">
                <div ref={listRef} className="relative" role="listbox" aria-label="Modules">
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

                        return (
                            <motion.button
                                key={item.id}
                                ref={(el) => {
                                    itemRefs.current[index] = el;
                                }}
                                type="button"
                                role="option"
                                aria-selected={isActive}
                                aria-pressed={isActive}
                                onClick={() => setActive(index)}
                                className={cx(
                                    "group relative w-full cursor-pointer rounded-r-xl py-4 pr-4 pl-8 text-left transition-colors duration-200 sm:py-5 sm:pr-5",
                                    "hover:bg-[#4d6b97]/[0.04]",
                                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                                    isActive && "bg-[#4d6b97]/[0.03]",
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <span
                                        className={cx(
                                            "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                                            isActive ? accent.tile : "bg-[#171717]/[0.04] text-[#737373] group-hover:bg-[#4d6b97]/10 group-hover:text-[#4d6b97]",
                                        )}
                                    >
                                        <Icon className={cx("size-4", isActive ? accent.iconClass : undefined)} aria-hidden />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h3
                                            className={cx(
                                                "text-[17px] font-semibold leading-snug tracking-[-0.01em] transition-colors duration-200 sm:text-[19px] sm:leading-[1.35]",
                                                isActive ? "text-[#090a24]" : "text-[#090a24]/75 group-hover:text-[#090a24]",
                                            )}
                                        >
                                            {item.name}
                                        </h3>

                                        <AnimatePresence initial={false}>
                                            {isActive ? (
                                                <motion.div
                                                    key="details"
                                                    initial={reduce ? false : { opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={reduce ? undefined : { opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.35, ease: easeLuxury }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="mt-1.5 text-[15px] leading-relaxed text-[#525252] sm:text-[16px] sm:leading-7">
                                                        {item.tagline}
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <p className="mt-1 line-clamp-1 text-[14px] leading-relaxed text-[#525252]/70 transition-colors group-hover:text-[#525252] sm:text-[15px]">
                                                    {item.tagline}
                                                </p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                <div className="mt-8 lg:mt-0">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={current.id}
                            initial={reduce ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? undefined : { opacity: 0, y: -6 }}
                            transition={{ duration: 0.45, ease: easeLuxury }}
                            className="hidden lg:block"
                        >
                            <ModuleVisual item={current} />
                        </motion.div>
                    </AnimatePresence>

                    {/* Compact visual on small screens — mirrors main’s mobile mockup slot */}
                    <div className="lg:hidden">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={`mobile-${current.id}`}
                                initial={reduce ? false : { opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={reduce ? undefined : { opacity: 0, y: -8 }}
                                transition={{ duration: 0.4, ease: easeLuxury }}
                            >
                                <ModuleVisual item={current} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
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
