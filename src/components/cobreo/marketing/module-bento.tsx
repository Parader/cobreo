"use client";

import { useRef, useState, type FC } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
    Calendar,
    ChevronDown,
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
 * Desktop full-bleed art — reserved right lane only. Soft mask, no frame.
 */
function ModuleBleedArt({ item }: { item: BentoItem }) {
    const file = illustrationFiles[item.id];
    if (!file) return null;

    return (
        <div aria-hidden data-module-illustration className="pointer-events-none absolute inset-0 z-0">
            <div
                className="absolute inset-0 opacity-[0.22]"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(77,107,151,0.5) 0.55px, transparent 0.65px)",
                    backgroundSize: "13px 13px",
                    maskImage: "linear-gradient(90deg, transparent 0%, #000 28%, #000 100%)",
                    WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 28%, #000 100%)",
                }}
            />
            <div
                className={cx(
                    "relative h-full w-full translate-x-[4%] xl:translate-x-[6%]",
                    "[mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.25)_20%,#000_48%,#000_100%)]",
                    "[-webkit-mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,0.25)_20%,#000_48%,#000_100%)]",
                )}
            >
                <MarkMotif
                    variant="outline"
                    opacity={0.32}
                    className="absolute top-[14%] left-[8%] z-0 h-[52%] w-[52%]"
                />
                <Image
                    src={`/images/modules/${file}.webp`}
                    alt=""
                    width={1024}
                    height={768}
                    className="relative z-10 -mr-[8%] h-full w-[115%] max-w-none object-contain object-right"
                    sizes="min(42vw, 600px)"
                    priority={false}
                />
            </div>
        </div>
    );
}

/** Moderate centered art for mobile accordion + tablet detail (no bleed, no frame). */
function ModuleInlineArt({ item }: { item: BentoItem }) {
    const file = illustrationFiles[item.id];
    if (!file) return null;

    return (
        <div
            aria-hidden
            data-module-illustration
            className="relative mx-auto w-full max-w-[20rem] opacity-90"
        >
            <Image
                src={`/images/modules/${file}.webp`}
                alt=""
                width={1024}
                height={768}
                className="mx-auto h-auto max-h-[240px] w-full object-contain object-center"
                sizes="(max-width: 767px) 90vw, 320px"
                priority={false}
            />
        </div>
    );
}

function ModulePoints({
    item,
    columns,
}: {
    item: BentoItem;
    columns: "one" | "two";
}) {
    const pointCount = item.points.length;
    return (
        <ul
            className={cx(
                "grid gap-y-5",
                columns === "two" ? "grid-cols-1 gap-x-7 sm:grid-cols-2 sm:gap-y-7" : "grid-cols-1",
            )}
        >
            {item.points.map((point, pointIndex) => {
                const style = pointStyles[pointIndex % pointStyles.length]!;
                const wideLast = columns === "two" && pointCount % 2 === 1 && pointIndex === pointCount - 1;
                return (
                    <li
                        key={`${point.title}-${pointIndex}`}
                        className={cx("min-w-0", wideLast && "sm:col-span-2 sm:max-w-[22rem]")}
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
                    </li>
                );
            })}
        </ul>
    );
}

/** Desktop / tablet detail panel (name + tagline + points). */
function ModuleDetailCopy({
    item,
    index,
    total,
    reduce,
    showInlineArt,
}: {
    item: BentoItem;
    index: number;
    total: number;
    reduce: boolean | null;
    /** Tablet: art under the points inside this column */
    showInlineArt?: boolean;
}) {
    const accent = accents[item.id] ?? fallbackAccent;
    const Icon = accent.icon;
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
            className="relative z-10 w-full max-w-[32rem]"
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
                    className="mt-3 max-w-[36ch] text-[18px] leading-7 tracking-[-0.01em] text-[#5f7aa1] md:text-[18px] lg:text-[20px] lg:leading-8"
                >
                    {item.tagline}
                </motion.p>
            ) : null}

            <motion.div variants={rise} className="mt-8 sm:mt-10">
                <ModulePoints item={item} columns="two" />
            </motion.div>

            {showInlineArt ? (
                <motion.div variants={rise} className="mt-8 lg:hidden">
                    <ModuleInlineArt item={item} />
                </motion.div>
            ) : null}
        </motion.div>
    );
}

export function ModuleBento({ items, linkLabel, linkHref }: { items: BentoItem[]; linkLabel?: string; linkHref?: string }) {
    const reduce = useReducedMotion();
    const [active, setActive] = useState(0);
    const headerRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const current = items[active] ?? items[0];
    if (!current) return null;

    const selectModule = (index: number) => {
        setActive(index);
        // Mobile accordion: keep the opened row header visible below the sticky nav
        requestAnimationFrame(() => {
            const el = headerRefs.current[index];
            if (!el || typeof window === "undefined") return;
            if (window.matchMedia("(min-width: 768px)").matches) return;
            const rect = el.getBoundingClientRect();
            const navClearance = 88;
            if (rect.top < navClearance || rect.bottom > window.innerHeight - 24) {
                el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
            }
        });
    };

    return (
        <div className="relative overflow-x-clip">
            {/* Desktop art lane (lg+ only) — never under text */}
            <div
                className={cx(
                    "pointer-events-none absolute inset-y-0 right-0 z-0 hidden overflow-hidden lg:block",
                    "w-[min(32vw,420px)] translate-x-[10%] opacity-50",
                    "xl:w-[min(40vw,560px)] xl:translate-x-[3%] xl:opacity-[0.72]",
                    "2xl:w-[min(42vw,600px)] 2xl:translate-x-[1%]",
                )}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={`art-${current.id}`}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduce ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.35, ease: easeLuxury }}
                        className="absolute inset-0"
                    >
                        <ModuleBleedArt item={current} />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div
                className={cx(
                    "relative z-10 mx-auto max-w-[1200px] px-4 md:px-8",
                    "lg:pr-[max(3rem,calc(min(32vw,420px)+3.5rem))]",
                    "xl:pr-[max(3rem,calc(min(40vw,560px)+4rem))]",
                    "2xl:pr-[max(3rem,calc(min(42vw,600px)+4rem))]",
                )}
            >
                {/* ——— Mobile accordion (<768) ——— */}
                <div className="md:hidden" role="list" aria-label="Modules">
                    {items.map((item, index) => {
                        const isOpen = index === active;
                        const accent = accents[item.id] ?? fallbackAccent;
                        const Icon = accent.icon;
                        const panelId = `module-panel-${item.id}`;
                        const headerId = `module-header-${item.id}`;

                        return (
                            <div
                                key={item.id}
                                className="border-b border-[#4d6b97]/20 first:border-t"
                            >
                                <button
                                    ref={(el) => {
                                        headerRefs.current[index] = el;
                                    }}
                                    type="button"
                                    id={headerId}
                                    aria-expanded={isOpen}
                                    aria-controls={panelId}
                                    onClick={() => selectModule(index)}
                                    className={cx(
                                        "flex min-h-14 w-full scroll-mt-28 cursor-pointer items-center gap-3 px-5 py-3.5 text-left transition-colors duration-100 ease-linear",
                                        "hover:bg-[#eef3f9]/50",
                                        "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#4d6b97]",
                                        isOpen && "bg-[#eef3f9]/60",
                                    )}
                                >
                                    <span
                                        className={cx(
                                            "inline-flex size-7 shrink-0 items-center justify-center rounded-[2px]",
                                            isOpen ? accent.tile : "text-[#737373]",
                                        )}
                                    >
                                        <Icon className={cx("size-4", isOpen ? accent.iconClass : undefined)} aria-hidden />
                                    </span>
                                    <span
                                        className={cx(
                                            "font-mono text-[11px] font-medium tracking-[0.1em] tabular-nums",
                                            isOpen ? "text-[#4d6b97]" : "text-[#4d6b97]/45",
                                        )}
                                    >
                                        {padIndex(index + 1)}
                                    </span>
                                    <span
                                        className={cx(
                                            "min-w-0 flex-1 text-[15px] font-semibold tracking-[-0.02em]",
                                            isOpen ? "text-[#090a24]" : "text-[#090a24]/75",
                                        )}
                                    >
                                        {item.name}
                                    </span>
                                    <ChevronDown
                                        aria-hidden
                                        className={cx(
                                            "size-5 shrink-0 text-[#5f7aa1] transition-transform duration-200 ease-linear",
                                            isOpen && "rotate-180",
                                        )}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen ? (
                                        <motion.div
                                            id={panelId}
                                            role="region"
                                            aria-labelledby={headerId}
                                            key={`panel-${item.id}`}
                                            initial={reduce ? false : { height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={reduce ? undefined : { height: 0, opacity: 0 }}
                                            transition={{ duration: 0.32, ease: easeLuxury }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pt-2 pb-6">
                                                {item.tagline ? (
                                                    <p className="text-[17px] leading-7 tracking-[-0.01em] text-[#5f7aa1]">
                                                        {item.tagline}
                                                    </p>
                                                ) : null}
                                                <div className="mt-5">
                                                    <ModuleInlineArt item={item} />
                                                </div>
                                                <div className="mt-6">
                                                    <ModulePoints item={item} columns="one" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : null}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* ——— Tablet (768–1023) + Desktop (lg+) ——— */}
                <div className="relative hidden min-w-0 md:grid md:grid-cols-[minmax(0,15.5rem)_minmax(0,1fr)] md:items-start md:gap-8 lg:min-h-[680px] lg:items-center lg:gap-8 xl:min-h-[720px] xl:grid-cols-[minmax(0,16.5rem)_minmax(0,1fr)] xl:gap-10">
                    <div className="relative z-20 min-w-0" role="listbox" aria-label="Modules">
                        {items.map((item, index) => {
                            const isActive = index === active;
                            const accent = accents[item.id] ?? fallbackAccent;
                            const Icon = accent.icon;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    role="option"
                                    aria-selected={isActive}
                                    aria-pressed={isActive}
                                    onClick={() => setActive(index)}
                                    className={cx(
                                        "group relative w-full cursor-pointer py-3.5 pr-3 pl-3 text-left transition-colors duration-100 ease-linear sm:py-4 sm:pl-4",
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
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative z-10 min-w-0">
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
                                    showInlineArt
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
