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
    crm: { icon: Users01, tile: "bg-[#eef3f9] text-[#4d6b97]", iconClass: "text-[#4d6b97]" },
    events: { icon: Ticket01, tile: "bg-[#090a24]/[0.06] text-[#253353]", iconClass: "text-[#253353]" },
    satisfaction: { icon: Heart, tile: "bg-[#b1b6a6]/30 text-[#5a6254]", iconClass: "text-[#5a6254]" },
    booking: { icon: Calendar, tile: "bg-[#eef3f9] text-[#5f7aa1]", iconClass: "text-[#5f7aa1]" },
    automation: { icon: Zap, tile: "bg-[#eef3f9] text-[#4d6b97]", iconClass: "text-[#4d6b97]" },
    sites: { icon: Globe01, tile: "bg-[#b1b6a6]/30 text-[#5a6254]", iconClass: "text-[#5a6254]" },
    portals: { icon: Passcode, tile: "bg-[#090a24]/[0.06] text-[#253353]", iconClass: "text-[#253353]" },
    hr: { icon: UserCircle, tile: "bg-[#eef3f9] text-[#5f7aa1]", iconClass: "text-[#5f7aa1]" },
    finance: { icon: CurrencyDollarCircle, tile: "bg-[#eef3f9] text-[#4d6b97]", iconClass: "text-[#4d6b97]" },
};

const fallbackAccent: Accent = accents.crm;

const pointStyles = [
    { num: "text-[#4d6b97]", rule: "bg-[#4d6b97]" },
    { num: "text-[#5f7aa1]", rule: "bg-[#5f7aa1]" },
    { num: "text-[#5a6254]", rule: "bg-[#b1b6a6]" },
    { num: "text-[#253353]", rule: "bg-[#253353]" },
    { num: "text-[#4d6b97]", rule: "bg-[#5f7aa1]" },
] as const;

function padIndex(n: number) {
    return String(n).padStart(2, "0");
}

/**
 * Full-bleed art on the page edge — calm frame (one hairline), subtle dots,
 * outline mark under the illustration. No fixed height; sizes to the image.
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
                "pointer-events-none",
                isDesktop
                    ? "absolute top-0 right-0 z-0 hidden w-[min(48vw,640px)] translate-x-[10%] lg:block xl:w-[min(44vw,680px)] xl:translate-x-[14%]"
                    : "relative right-0 z-0 mt-5 w-[min(92vw,400px)] translate-x-[6%] sm:w-[min(88vw,440px)] sm:translate-x-[10%]",
            )}
        >
            <div
                className="absolute inset-0 opacity-[0.18]"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(77,107,151,0.5) 0.55px, transparent 0.65px)",
                    backgroundSize: "14px 14px",
                    maskImage: "linear-gradient(90deg, transparent 0%, #000 40%, #000 100%)",
                    WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 40%, #000 100%)",
                }}
            />

            {/* Single hairline — left edge of the art plane, extending right off-page */}
            <div
                className={cx(
                    "absolute top-[8%] bottom-[8%] left-0 border-l border-[#4d6b97]/30",
                    isDesktop ? "right-[-10%]" : "right-[-6%]",
                )}
            />

            <div
                className={cx(
                    "relative",
                    "[mask-image:linear-gradient(90deg,transparent_0%,#000_18%,#000_100%)]",
                    "[-webkit-mask-image:linear-gradient(90deg,transparent_0%,#000_18%,#000_100%)]",
                )}
            >
                <MarkMotif
                    variant="outline"
                    opacity={0.32}
                    className={cx(
                        "absolute z-0",
                        isDesktop ? "-left-[8%] top-[10%] h-[62%] w-[62%]" : "-left-[6%] top-[8%] h-[58%] w-[58%]",
                    )}
                />
                <Image
                    src={`/images/modules/${file}.webp`}
                    alt=""
                    width={1024}
                    height={768}
                    className="relative z-10 h-auto w-full object-contain object-right"
                    sizes={isDesktop ? "min(48vw, 680px)" : "min(92vw, 440px)"}
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
              show: { transition: { staggerChildren: 0.045, delayChildren: 0.02 } },
          };
    const rise = reduce
        ? undefined
        : {
              hidden: { opacity: 0, y: 6 },
              show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easeLuxury } },
          };

    return (
        <motion.div
            className="relative z-10 max-w-[36rem]"
            variants={stagger}
            initial={reduce ? false : "hidden"}
            animate="show"
        >
            <motion.div variants={rise} className="flex items-center gap-2.5">
                <span className="font-mono text-[11px] font-medium tracking-[0.08em] text-[#4d6b97] tabular-nums">
                    {padIndex(index + 1)}
                    <span className="mx-1 text-[#4d6b97]/35">/</span>
                    {padIndex(total)}
                </span>
                <span className={cx("inline-flex size-5 items-center justify-center rounded-[2px]", accent.tile)}>
                    <Icon className={cx("size-3", accent.iconClass)} aria-hidden />
                </span>
            </motion.div>

            <motion.h3
                variants={rise}
                className="mt-2.5 font-display text-[clamp(1.55rem,2.5vw,2.1rem)] font-normal leading-[1.1] tracking-[-0.04em] text-[#090a24]"
            >
                {item.name}
            </motion.h3>

            {item.tagline ? (
                <motion.p
                    variants={rise}
                    className="mt-1.5 max-w-[36ch] text-[13px] leading-5 tracking-[-0.01em] text-[#5f7aa1] sm:text-[14px] sm:leading-5"
                >
                    {item.tagline}
                </motion.p>
            ) : null}

            <motion.ul
                variants={stagger}
                className="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 sm:mt-6 sm:grid-cols-2 sm:gap-y-5"
            >
                {item.points.map((point, pointIndex) => {
                    const style = pointStyles[pointIndex % pointStyles.length]!;
                    const wideLast = pointCount % 2 === 1 && pointIndex === pointCount - 1;
                    return (
                        <motion.li
                            key={`${point.title}-${pointIndex}`}
                            variants={rise}
                            className={cx("min-w-0", wideLast && "sm:col-span-2 sm:max-w-[20rem]")}
                        >
                            <div className="mb-1.5 flex items-center gap-2">
                                <span className={cx("h-px w-4", style.rule)} aria-hidden />
                                <span className={cx("font-mono text-[10px] font-medium tracking-[0.1em] tabular-nums", style.num)}>
                                    {padIndex(pointIndex + 1)}
                                </span>
                            </div>
                            <p className="text-[13px] font-semibold leading-snug tracking-[-0.02em] text-[#090a24] sm:text-[14px]">
                                {point.title}
                            </p>
                            {point.body ? (
                                <p className="mt-1 text-[12px] leading-4.5 text-[#525252] sm:text-[12.5px] sm:leading-5">
                                    {point.body}
                                </p>
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
        /* overflow-x only — never create a vertical scrollport inside the section */
        <div className="relative overflow-x-hidden overflow-y-visible">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden overflow-x-hidden lg:block">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={`art-${current.id}`}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduce ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.3, ease: easeLuxury }}
                    >
                        <ModuleBleedArt item={current} variant="desktop" />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
                <div className="relative min-w-0 lg:grid lg:grid-cols-[minmax(0,16.5rem)_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,17.5rem)_minmax(0,34rem)] xl:gap-14">
                    <div ref={listRef} className="relative z-20 min-w-0" role="listbox" aria-label="Modules">
                        <motion.span
                            aria-hidden
                            className="pointer-events-none absolute top-0 left-0 w-px bg-[#4d6b97]"
                            initial={false}
                            animate={{
                                top: indicator.top,
                                height: Math.max(indicator.height, 8),
                            }}
                            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 480, damping: 40, mass: 0.6 }}
                        />

                        {items.map((item, index) => {
                            const isActive = index === active;
                            const accent = accents[item.id] ?? fallbackAccent;
                            const Icon = accent.icon;

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
                                            "group relative w-full cursor-pointer py-2 pr-2 pl-3.5 text-left transition-colors duration-100 ease-linear sm:py-2.5 sm:pl-4",
                                            "hover:bg-[#eef3f9]/45",
                                            "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4d6b97]",
                                            isActive && "bg-[#eef3f9]/55",
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cx(
                                                    "inline-flex size-5 shrink-0 items-center justify-center rounded-[2px] transition-colors duration-100",
                                                    isActive ? accent.tile : "text-[#737373] group-hover:text-[#4d6b97]",
                                                )}
                                            >
                                                <Icon className={cx("size-3", isActive ? accent.iconClass : undefined)} aria-hidden />
                                            </span>
                                            <span
                                                className={cx(
                                                    "font-mono text-[10px] font-medium tracking-[0.08em] tabular-nums transition-colors",
                                                    isActive ? "text-[#4d6b97]" : "text-[#4d6b97]/40 group-hover:text-[#5f7aa1]",
                                                )}
                                            >
                                                {padIndex(index + 1)}
                                            </span>
                                            <h3
                                                className={cx(
                                                    "text-[13px] font-semibold tracking-[-0.02em] transition-colors duration-100",
                                                    isActive ? "text-[#090a24]" : "text-[#090a24]/65 group-hover:text-[#090a24]",
                                                )}
                                            >
                                                {item.name}
                                            </h3>
                                        </div>
                                    </motion.button>

                                    <AnimatePresence initial={false}>
                                        {isActive ? (
                                            <motion.div
                                                key={`mobile-detail-${item.id}`}
                                                initial={reduce ? false : { opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={reduce ? undefined : { opacity: 0 }}
                                                transition={{ duration: 0.25, ease: easeLuxury }}
                                                className="lg:hidden"
                                            >
                                                <div className="px-1 pt-4 pb-2 sm:px-2">
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
                                                initial={reduce ? false : { opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={reduce ? undefined : { opacity: 0 }}
                                                transition={{ duration: 0.25, ease: easeLuxury }}
                                                className="relative overflow-x-hidden pb-4 lg:hidden"
                                            >
                                                <ModuleBleedArt item={item} variant="mobile" />
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative z-10 mt-1 hidden min-w-0 overflow-visible lg:mt-0 lg:block">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={current.id}
                                initial={reduce ? false : { opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={reduce ? undefined : { opacity: 0 }}
                                transition={{ duration: 0.2, ease: easeLuxury }}
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
