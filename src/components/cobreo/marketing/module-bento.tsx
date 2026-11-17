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
 * Full-bleed art as in a00ac25: large plane on the right page edge, outline mark,
 * subtle dots. Calmed to one hairline. Opacity ~0.7. Height is a % of the
 * section min-height — not a scrollport.
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
                    ? "top-[4%] right-0 z-0 hidden h-[92%] w-[min(50vw,700px)] opacity-[0.75] lg:block xl:w-[min(48vw,740px)]"
                    : "relative right-0 z-0 mt-6 w-[min(94vw,440px)] translate-x-[2%] opacity-[0.7] sm:w-[min(90vw,480px)] sm:translate-x-[6%]",
            )}
        >
            <div
                className="absolute inset-0 opacity-[0.28]"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(77,107,151,0.5) 0.55px, transparent 0.65px)",
                    backgroundSize: "13px 13px",
                    maskImage: "linear-gradient(90deg, transparent 0%, #000 22%, #000 100%)",
                    WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 22%, #000 100%)",
                }}
            />

            {/* One calm left hairline — no full art frame grid */}
            <div
                className={cx(
                    "absolute top-[4%] bottom-[4%] left-[2%] border-l border-[#4d6b97]/28",
                    isDesktop ? "right-[-8%]" : "right-[-4%]",
                )}
            />

            <div
                className={cx(
                    "relative h-full w-full",
                    /* slight bleed past the page edge — keep most of the figure on-screen */
                    isDesktop && "translate-x-[2%] xl:translate-x-[4%]",
                    "[mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.45)_12%,#000_32%,#000_100%)]",
                    "[-webkit-mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.45)_12%,#000_32%,#000_100%)]",
                )}
            >
                <MarkMotif
                    variant="outline"
                    opacity={0.42}
                    className={cx(
                        "absolute z-0",
                        isDesktop ? "-left-[12%] top-[10%] h-[68%] w-[68%]" : "-left-[8%] top-[6%] h-[66%] w-[66%]",
                    )}
                />
                <Image
                    src={`/images/modules/${file}.webp`}
                    alt=""
                    width={1024}
                    height={768}
                    className="relative z-10 h-full w-full object-contain object-right"
                    sizes={isDesktop ? "min(50vw, 740px)" : "min(94vw, 480px)"}
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
              show: { transition: { staggerChildren: 0.05, delayChildren: 0.03 } },
          };
    const rise = reduce
        ? undefined
        : {
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.32, ease: easeLuxury } },
          };

    return (
        <motion.div
            className="relative z-10 max-w-[40rem]"
            variants={stagger}
            initial={reduce ? false : "hidden"}
            animate="show"
        >
            <motion.div variants={rise} className="flex items-center gap-3">
                <span className="font-mono text-[12px] font-medium tracking-[0.08em] text-[#4d6b97] tabular-nums">
                    {padIndex(index + 1)}
                    <span className="mx-1 text-[#4d6b97]/40">/</span>
                    {padIndex(total)}
                </span>
                <span className={cx("inline-flex size-7 items-center justify-center rounded-[2px]", accent.tile)}>
                    <Icon className={cx("size-4", accent.iconClass)} aria-hidden />
                </span>
            </motion.div>

            <motion.h3
                variants={rise}
                className="mt-4 font-display text-[clamp(2rem,3.4vw,2.75rem)] font-normal leading-[1.05] tracking-[-0.04em] text-[#090a24]"
            >
                {item.name}
            </motion.h3>

            {item.tagline ? (
                <motion.p
                    variants={rise}
                    className="mt-3 max-w-[38ch] text-[18px] leading-7 tracking-[-0.01em] text-[#5f7aa1] sm:text-[20px] sm:leading-8"
                >
                    {item.tagline}
                </motion.p>
            ) : null}

            <motion.ul
                variants={stagger}
                className="mt-8 grid grid-cols-1 gap-x-10 gap-y-6 sm:mt-10 sm:grid-cols-2 sm:gap-y-7"
            >
                {item.points.map((point, pointIndex) => {
                    const style = pointStyles[pointIndex % pointStyles.length]!;
                    const wideLast = pointCount % 2 === 1 && pointIndex === pointCount - 1;
                    return (
                        <motion.li
                            key={`${point.title}-${pointIndex}`}
                            variants={rise}
                            className={cx("min-w-0", wideLast && "sm:col-span-2 sm:max-w-[24rem]")}
                        >
                            <div className="mb-2 flex items-center gap-2.5">
                                <span className={cx("h-px w-5", style.rule)} aria-hidden />
                                <span className={cx("font-mono text-[11px] font-medium tracking-[0.1em] tabular-nums", style.num)}>
                                    {padIndex(pointIndex + 1)}
                                </span>
                            </div>
                            <p className="text-[16px] font-semibold leading-snug tracking-[-0.02em] text-[#090a24]">
                                {point.title}
                            </p>
                            {point.body ? (
                                <p className="mt-1.5 text-[15px] leading-6 text-[#525252]">{point.body}</p>
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
        /* overflow-x: clip keeps overflow-y visible (unlike hidden) */
        <div className="relative overflow-x-clip">
            <div className="pointer-events-none absolute inset-x-0 inset-y-0 z-0 hidden lg:block">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={`art-${current.id}`}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduce ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.35, ease: easeLuxury }}
                        className="absolute inset-0"
                    >
                        <ModuleBleedArt item={current} variant="desktop" />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
                <div className="relative min-w-0 lg:grid lg:min-h-[680px] lg:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] lg:items-center lg:gap-12 xl:min-h-[720px] xl:grid-cols-[minmax(0,18.5rem)_minmax(0,38rem)] xl:gap-16">
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
                                            "group relative w-full cursor-pointer py-3.5 pr-3 pl-4 text-left transition-colors duration-100 ease-linear sm:py-4 sm:pl-5",
                                            "hover:bg-[#eef3f9]/50",
                                            "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4d6b97]",
                                            isActive && "bg-[#eef3f9]/70",
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span
                                                className={cx(
                                                    "inline-flex size-6 shrink-0 items-center justify-center rounded-[2px] transition-colors duration-100",
                                                    isActive ? accent.tile : "text-[#737373] group-hover:text-[#4d6b97]",
                                                )}
                                            >
                                                <Icon className={cx("size-3.5", isActive ? accent.iconClass : undefined)} aria-hidden />
                                            </span>
                                            <span
                                                className={cx(
                                                    "font-mono text-[11px] font-medium tracking-[0.1em] tabular-nums transition-colors",
                                                    isActive ? "text-[#4d6b97]" : "text-[#4d6b97]/45 group-hover:text-[#5f7aa1]",
                                                )}
                                            >
                                                {padIndex(index + 1)}
                                            </span>
                                            <h3
                                                className={cx(
                                                    "text-[15px] font-semibold tracking-[-0.02em] transition-colors duration-100",
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
                                                transition={{ duration: 0.3, ease: easeLuxury }}
                                                className="lg:hidden"
                                            >
                                                <div className="px-1 pt-5 pb-3 sm:px-2">
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
                                                transition={{ duration: 0.3, ease: easeLuxury }}
                                                className="relative overflow-x-clip pb-5 lg:hidden"
                                            >
                                                <ModuleBleedArt item={item} variant="mobile" />
                                            </motion.div>
                                        ) : null}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative z-10 mt-2 hidden min-w-0 lg:mt-0 lg:block">
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
                    <Link href={linkHref} className="mt-10 inline-flex text-sm font-semibold text-[#253353]">
                        {linkLabel}
                    </Link>
                ) : null}
            </div>
        </div>
    );
}
