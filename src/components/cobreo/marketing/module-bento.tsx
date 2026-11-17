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
import { MarkMotif } from "@/components/cobreo/marketing/mark-motif";
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

export type BentoPoint = {
    title: string;
    body?: string;
};

export type BentoItem = {
    id: string;
    name: string;
    tagline: string;
    points: BentoPoint[];
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

/** Distinct brand accents for use-case points — cycle by index. */
const pointStyles = [
    { num: "text-[#4d6b97]", rule: "bg-[#4d6b97]", pill: "bg-[#4d6b97]/15 text-[#4d6b97]" },
    { num: "text-[#5f7aa1]", rule: "bg-[#5f7aa1]", pill: "bg-[#eef3f9] text-[#253353]" },
    { num: "text-[#5a6254]", rule: "bg-[#b1b6a6]", pill: "bg-[#b1b6a6]/40 text-[#5a6254]" },
    { num: "text-[#253353]", rule: "bg-[#253353]", pill: "bg-[#253353]/10 text-[#253353]" },
    { num: "text-[#4d6b97]", rule: "bg-[#5f7aa1]", pill: "bg-[#eef3f9] text-[#4d6b97]" },
] as const;

function padIndex(n: number) {
    return String(n).padStart(2, "0");
}

/**
 * Full-bleed page art — anchored to the right viewport edge, outside the content
 * grid. Soft mask only on the text-facing side; overall opacity stays strong.
 * Outline mark sits behind/with the illustration as one composed graphic.
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
                          "w-[min(58vw,760px)] xl:w-[min(54vw,820px)]",
                          "translate-x-[12%] xl:translate-x-[16%]",
                          "opacity-[0.68]",
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
            <div className="relative">
                <MarkMotif
                    variant="outline"
                    opacity={0.55}
                    className={cx(
                        "absolute z-0",
                        isDesktop
                            ? "-left-[18%] top-[6%] h-[78%] w-[78%] -rotate-6"
                            : "-left-[14%] top-[4%] h-[72%] w-[72%] -rotate-6",
                    )}
                />
                <Image
                    src={`/images/modules/${file}.webp`}
                    alt=""
                    width={1024}
                    height={768}
                    className="relative z-10 h-auto w-full object-contain object-right"
                    sizes={isDesktop ? "min(58vw, 820px)" : "min(92vw, 460px)"}
                    priority={false}
                />
            </div>
        </div>
    );
}

function ModuleDetailCopy({
    item,
    index,
    total,
    reduce,
}: {
    item: BentoItem;
    index: number;
    total: number;
    reduce: boolean | null;
}) {
    const accent = accents[item.id] ?? fallbackAccent;
    const Icon = accent.icon;
    const pointCount = item.points.length;
    const stagger = reduce
        ? undefined
        : {
              hidden: {},
              show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
          };
    const rise = reduce
        ? undefined
        : {
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeLuxury } },
          };

    return (
        <motion.div
            className="relative z-10 max-w-[38rem]"
            variants={stagger}
            initial={reduce ? false : "hidden"}
            animate="show"
        >
            <motion.div variants={rise} className="relative flex items-center gap-3">
                <span className="font-display text-[13px] font-medium tracking-[0.14em] text-[#4d6b97] tabular-nums">
                    {padIndex(index + 1)}
                    <span className="mx-1.5 text-[#b1b6a6]">/</span>
                    {padIndex(total)}
                </span>
                <span className="h-px w-8 bg-[#4d6b97]/35 sm:w-10" aria-hidden />
                <span className={cx("inline-flex size-7 items-center justify-center rounded-md", accent.tile)}>
                    <Icon className={cx("size-3.5", accent.iconClass)} aria-hidden />
                </span>
            </motion.div>

            <motion.h3
                variants={rise}
                className="relative mt-4 font-display text-[clamp(1.85rem,3.2vw,2.65rem)] font-normal leading-[1.05] tracking-[-0.035em] text-[#090a24]"
            >
                {item.name}
            </motion.h3>

            {item.tagline ? (
                <motion.p
                    variants={rise}
                    className="relative mt-3 max-w-[28ch] font-display text-[clamp(1.05rem,1.7vw,1.25rem)] font-light leading-[1.4] tracking-[-0.015em] text-[#5f7aa1]"
                >
                    {item.tagline}
                </motion.p>
            ) : null}

            <motion.ul
                variants={stagger}
                className="relative mt-8 grid grid-cols-1 gap-x-6 gap-y-5 sm:mt-9 sm:grid-cols-2 sm:gap-y-6"
            >
                {item.points.map((point, pointIndex) => {
                    const style = pointStyles[pointIndex % pointStyles.length]!;
                    const wideLast = pointCount % 2 === 1 && pointIndex === pointCount - 1;
                    return (
                        <motion.li
                            key={`${point.title}-${pointIndex}`}
                            variants={rise}
                            className={cx("relative min-w-0 pt-3", wideLast && "sm:col-span-2 sm:max-w-[22rem]")}
                        >
                            <span className={cx("absolute inset-x-0 top-0 h-[2px] rounded-full", style.rule)} aria-hidden />
                            <span
                                className={cx(
                                    "mb-2.5 inline-flex size-6 items-center justify-center rounded-full font-display text-[10px] font-semibold tracking-[0.08em] tabular-nums",
                                    style.pill,
                                )}
                            >
                                {padIndex(pointIndex + 1)}
                            </span>
                            <p className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-[#090a24] sm:text-[16px] sm:leading-6">
                                {point.title}
                            </p>
                            {point.body ? (
                                <p className="mt-1.5 text-[13px] leading-snug text-[#525252] sm:text-[14px] sm:leading-5">{point.body}</p>
                            ) : null}
                        </motion.li>
                    );
                })}
            </motion.ul>
        </motion.div>
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
                <div className="relative min-w-0 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,24rem)_minmax(0,38rem)] xl:gap-14">
                    {/* Left: crafted module selector */}
                    <div ref={listRef} className="relative z-20 min-w-0" role="listbox" aria-label="Modules">
                        <motion.span
                            aria-hidden
                            className="pointer-events-none absolute left-0 w-[3px] rounded-full bg-[#4d6b97]"
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
                            const preview = item.tagline || item.points[0]?.title || "";

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
                                            "hover:bg-[#eef3f9]/70",
                                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                                            isActive && "bg-[#eef3f9]",
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span
                                                className={cx(
                                                    "mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                                                    isActive
                                                        ? accent.tile
                                                        : "bg-[#eef3f9] text-[#737373] group-hover:bg-[#4d6b97]/12 group-hover:text-[#4d6b97]",
                                                )}
                                            >
                                                <Icon className={cx("size-4", isActive ? accent.iconClass : undefined)} aria-hidden />
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span
                                                        className={cx(
                                                            "font-display text-[11px] font-medium tracking-[0.12em] tabular-nums transition-colors",
                                                            isActive ? "text-[#4d6b97]" : "text-[#b1b6a6] group-hover:text-[#5f7aa1]",
                                                        )}
                                                    >
                                                        {padIndex(index + 1)}
                                                    </span>
                                                    <h3
                                                        className={cx(
                                                            "text-[16px] font-semibold leading-snug tracking-[-0.01em] transition-colors duration-200 sm:text-[17px] sm:leading-[1.35]",
                                                            isActive ? "text-[#090a24]" : "text-[#090a24]/70 group-hover:text-[#090a24]",
                                                        )}
                                                    >
                                                        {item.name}
                                                    </h3>
                                                </div>
                                                <p
                                                    className={cx(
                                                        "mt-1 line-clamp-1 text-[13px] leading-relaxed transition-colors sm:text-[14px]",
                                                        isActive
                                                            ? "text-[#5f7aa1]"
                                                            : "text-[#525252]/65 group-hover:text-[#525252]",
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
                                                <div className="px-2 pt-4 pb-1 sm:px-3">
                                                    <ModuleDetailCopy
                                                        item={item}
                                                        index={index}
                                                        total={items.length}
                                                        reduce={reduce}
                                                    />
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

                    {/* Desktop: designed detail — art lives outside this column */}
                    <div className="relative z-10 mt-2 hidden min-w-0 lg:mt-1 lg:block">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={current.id}
                                initial={reduce ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={reduce ? undefined : { opacity: 0 }}
                                transition={{ duration: 0.25, ease: easeLuxury }}
                            >
                                <ModuleDetailCopy
                                    item={current}
                                    index={active}
                                    total={items.length}
                                    reduce={reduce}
                                />
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
