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

/** Modest, frameless art — supports the copy, does not dominate. */
function ModuleIllustration({ item, className }: { item: BentoItem; className?: string }) {
    const locale = useLocale();
    const file = illustrationFiles[item.id];
    const accent = accents[item.id] ?? fallbackAccent;
    const Icon = accent.icon;
    const alt =
        locale === "en" ? `Illustration of the ${item.name} module` : `Illustration du module ${item.name}`;

    if (!file) {
        return (
            <div className={cx("flex size-14 items-center justify-center rounded-2xl", accent.tile, className)}>
                <Icon className={cx("size-7", accent.iconClass)} aria-hidden />
            </div>
        );
    }

    return (
        <div
            data-module-illustration
            className={cx(
                "relative w-full max-w-[16.5rem] sm:max-w-[18rem] lg:max-w-[19rem] xl:max-w-[21rem]",
                /* Slight editorial break past the content edge — still secondary */
                "lg:-mr-2 xl:-mr-5",
                className,
            )}
        >
            <Image
                src={`/images/modules/${file}.webp`}
                alt={alt}
                width={640}
                height={480}
                className="h-auto w-full object-contain object-center"
                sizes="(max-width: 1023px) 18rem, 21rem"
                priority={false}
            />
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
            <div className="relative min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] lg:items-start lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,21rem)] xl:gap-10">
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
                                                    {item.tagline ? (
                                                        <p className="mt-2 max-w-[40ch] text-[15px] leading-relaxed text-[#525252] sm:text-[16px] sm:leading-7">
                                                            {item.tagline}
                                                        </p>
                                                    ) : null}
                                                    <ul className="mt-3 space-y-2 sm:mt-3.5 sm:space-y-2.5">
                                                        {item.points.map((point) => (
                                                            <li
                                                                key={point}
                                                                className="flex gap-2.5 text-[15px] leading-snug text-[#404040] sm:text-[16px] sm:leading-6"
                                                            >
                                                                <span
                                                                    className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-[#5f7aa1]"
                                                                    aria-hidden
                                                                />
                                                                <span>{point}</span>
                                                            </li>
                                                        ))}
                                                    </ul>

                                                    {/* Mobile: modest illustration under the examples */}
                                                    <div className="mt-5 lg:hidden">
                                                        <ModuleIllustration item={item} />
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <p className="mt-1 line-clamp-1 text-[14px] leading-relaxed text-[#525252]/70 transition-colors group-hover:text-[#525252] sm:text-[15px]">
                                                    {preview}
                                                </p>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Desktop: secondary illustration column — crossfades with selection */}
                <div className="relative z-10 mt-2 hidden lg:mt-1 lg:block">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={current.id}
                            initial={reduce ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduce ? undefined : { opacity: 0, y: -6 }}
                            transition={{ duration: 0.4, ease: easeLuxury }}
                            className="lg:sticky lg:top-28"
                        >
                            <ModuleIllustration item={current} />
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
