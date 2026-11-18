"use client";

import { useId, useRef, useState, type FC, type KeyboardEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
    ArrowRight,
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
    rule: string;
};

/** One tile style for every module: the icon drawing tells them apart, not the colour. */
const tile = { tile: "bg-[#eef3f9]", iconClass: "text-[#4d6b97]", rule: "bg-[#4d6b97]" } as const;

const accents: Record<string, Accent> = {
    crm: { icon: Users01, ...tile },
    events: { icon: Ticket01, ...tile },
    satisfaction: { icon: Heart, ...tile },
    booking: { icon: Calendar, ...tile },
    automation: { icon: Zap, ...tile },
    sites: { icon: Globe01, ...tile },
    portals: { icon: Passcode, ...tile },
    hr: { icon: UserCircle, ...tile },
    finance: { icon: CurrencyDollarCircle, ...tile },
};

const fallbackAccent: Accent = accents.crm;

/** Module accent (icon + tint classes), shared with other marketing sections. */
export function moduleAccent(id: string) {
    return accents[id] ?? fallbackAccent;
}

/** Module illustration path, or null when the module has none. */
export function moduleIllustration(id: string) {
    const file = illustrationFiles[id];
    return file ? `/images/modules/${file}.webp` : null;
}

/** Module icon, shared with other marketing sections. */
export function moduleIcon(id: string) {
    return (accents[id] ?? fallbackAccent).icon;
}

/** Strong ease-out: fast response, soft landing. */
const easeOutStrong = "ease-[cubic-bezier(0.23,1,0.32,1)]";

/** Desktop art (lg+): illustration on a soft dotted field, larger than its column and set off to the right. */
function ModuleSideArt({ item }: { item: BentoItem }) {
    const file = illustrationFiles[item.id];
    if (!file) return null;

    return (
        <div aria-hidden data-module-illustration className="pointer-events-none absolute inset-0">
            <div
                className="absolute inset-0 opacity-[0.22]"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(77,107,151,0.5) 0.55px, transparent 0.65px)",
                    backgroundSize: "13px 13px",
                    maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 75%)",
                    WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 30%, transparent 75%)",
                }}
            />
            <Image
                src={`/images/modules/${file}.webp`}
                alt=""
                width={1024}
                height={768}
                className="relative z-10 h-full w-full object-contain opacity-75 mix-blend-multiply"
                sizes="(min-width: 1280px) 640px, 460px"
                priority={false}
            />
        </div>
    );
}

/** Compact centered art for the mobile panel and the tablet detail column. */
function ModuleInlineArt({ item, className }: { item: BentoItem; className?: string }) {
    const file = illustrationFiles[item.id];
    if (!file) return null;

    return (
        <div aria-hidden data-module-illustration className={cx("relative w-full", className)}>
            <Image
                src={`/images/modules/${file}.webp`}
                alt=""
                width={1024}
                height={768}
                loading="lazy"
                className="mx-auto h-auto max-h-[180px] w-auto max-w-full object-contain object-center mix-blend-multiply md:max-h-[240px]"
                sizes="(max-width: 767px) 80vw, 320px"
            />
        </div>
    );
}

function ModulePoints({ item, columns }: { item: BentoItem; columns: "one" | "two" }) {
    const accent = accents[item.id] ?? fallbackAccent;
    const pointCount = item.points.length;

    return (
        <ul
            className={cx(
                "grid",
                columns === "two" ? "grid-cols-1 gap-y-6 @[28rem]:grid-cols-2 @[28rem]:gap-x-8 @[28rem]:gap-y-7" : "grid-cols-1 gap-y-5",
            )}
        >
            {item.points.map((point, pointIndex) => {
                const wideLast = columns === "two" && pointCount % 2 === 1 && pointIndex === pointCount - 1;
                return (
                    <li key={`${point.title}-${pointIndex}`} className={cx("min-w-0", wideLast && "@[28rem]:col-span-2 @[28rem]:max-w-[24rem]")}>
                        <span className={cx("mb-2.5 block h-[2px] w-5 rounded-full", accent.rule)} aria-hidden />
                        <h4 className="text-[16px] leading-snug font-semibold tracking-[-0.015em] text-balance text-[#090a24]">
                            {point.title}
                        </h4>
                        {point.body ? (
                            <p className="mt-1 text-[15px] leading-6 text-pretty text-[#525252]">{point.body}</p>
                        ) : null}
                    </li>
                );
            })}
        </ul>
    );
}

function IconTile({ item, size = "md" }: { item: BentoItem; size?: "sm" | "md" }) {
    const accent = accents[item.id] ?? fallbackAccent;
    const Icon = accent.icon;
    return (
        <span
            className={cx(
                "inline-flex shrink-0 items-center justify-center rounded-[6px]",
                size === "sm" ? "size-7" : "size-10",
                accent.tile,
            )}
        >
            <Icon className={cx(size === "sm" ? "size-4" : "size-5", accent.iconClass)} aria-hidden />
        </span>
    );
}

/* ———————————————————————— Mobile (<768): scannable list ———————————————————————— */

/**
 * Every row shows the module name and its one-line promise, so the whole catalogue
 * reads in about a screen and a half. Details open in place; several rows can stay
 * open, so opening one never shifts the rows above it. All panels are server-rendered
 * (collapsed with grid rows + `inert`), so crawlers and AI readers see every module.
 */
function MobileModuleList({ items, demoLabel }: { items: BentoItem[]; demoLabel?: string }) {
    const [open, setOpen] = useState<Set<string>>(() => new Set());
    const baseId = useId();

    const toggle = (id: string) =>
        setOpen((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    return (
        <ul className="-mx-4 border-t border-[#4d6b97]/15 md:hidden">
            {items.map((item) => {
                const isOpen = open.has(item.id);
                const panelId = `${baseId}-panel-${item.id}`;
                const headerId = `${baseId}-header-${item.id}`;

                return (
                    <li key={item.id} className="border-b border-[#4d6b97]/15">
                        <h3 className="m-0">
                            <button
                                type="button"
                                id={headerId}
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => toggle(item.id)}
                                className={cx(
                                    "flex w-full cursor-pointer items-start gap-3.5 px-4 py-4 text-left [-webkit-tap-highlight-color:transparent]",
                                    "transition-colors duration-150 ease-out active:bg-[#eef3f9]/70",
                                    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4d6b97]",
                                )}
                            >
                                <IconTile item={item} />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[17px] leading-6 font-semibold tracking-[-0.02em] text-[#090a24]">
                                        {item.name}
                                    </span>
                                    {item.tagline ? (
                                        <span className="mt-0.5 block text-[15px] leading-[1.45] text-pretty text-[#525252]">
                                            {item.tagline}
                                        </span>
                                    ) : null}
                                </span>
                                <ChevronDown
                                    aria-hidden
                                    className={cx(
                                        "mt-2.5 size-5 shrink-0 text-[#5f7aa1] transition-transform duration-300 motion-reduce:transition-none",
                                        easeOutStrong,
                                        isOpen && "rotate-180",
                                    )}
                                />
                            </button>
                        </h3>

                        <div
                            id={panelId}
                            role="region"
                            aria-labelledby={headerId}
                            inert={!isOpen}
                            className={cx(
                                "grid transition-[grid-template-rows,opacity] duration-300 motion-reduce:transition-none",
                                easeOutStrong,
                                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                            )}
                        >
                            <div className="min-h-0 overflow-hidden">
                                <div className="pr-4 pb-7 pl-[4.375rem]">
                                    <ModuleInlineArt
                                        item={item}
                                        className="mb-6 rounded-[10px] bg-[#eef3f9]/55 px-3 py-4"
                                    />
                                    <ModulePoints item={item} columns="one" />
                                    {demoLabel ? (
                                        <div className="mt-6">
                                            <DemoLink label={demoLabel} />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

/* ———————————————————————— Tablet + desktop (≥768): tabs ———————————————————————— */

function DemoLink({ label }: { label: string }) {
    return (
        <Link
            href="/contact"
            className="group inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#4d6b97] underline decoration-[#4d6b97]/30 underline-offset-4 transition-colors duration-150 hover:decoration-[#4d6b97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]"
        >
            {label}
            <ArrowRight className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" aria-hidden />
        </Link>
    );
}

function ModuleDetailCopy({
    item,
    reduce,
    panelId,
    tabId,
    demoLabel,
}: {
    item: BentoItem;
    reduce: boolean | null;
    panelId: string;
    tabId: string;
    demoLabel?: string;
}) {
    const stagger = reduce
        ? undefined
        : {
              hidden: {},
              show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
          };
    const rise = reduce
        ? undefined
        : {
              hidden: { opacity: 0, y: 6 },
              show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: easeLuxury } },
          };

    return (
        <motion.div
            id={panelId}
            role="tabpanel"
            aria-labelledby={tabId}
            tabIndex={0}
            className="@container relative z-10 w-full max-w-[34rem] focus-visible:outline-none"
            variants={stagger}
            initial={reduce ? false : "hidden"}
            animate="show"
        >
            <motion.h3
                variants={rise}
                className="font-display text-[clamp(1.75rem,2.6vw,2.25rem)] leading-[1.1] font-normal tracking-[-0.035em] text-balance text-[#090a24]"
            >
                {item.name}
            </motion.h3>

            {item.tagline ? (
                <motion.p
                    variants={rise}
                    className="mt-3 max-w-[38ch] text-[18px] leading-7 tracking-[-0.01em] text-pretty text-[#253353] lg:text-[19px] lg:leading-8"
                >
                    {item.tagline}
                </motion.p>
            ) : null}

            <motion.div variants={rise} className="mt-9 sm:mt-10">
                <ModulePoints item={item} columns="two" />
            </motion.div>

            {demoLabel ? (
                <motion.div variants={rise} className="mt-9">
                    <DemoLink label={demoLabel} />
                </motion.div>
            ) : null}

            <motion.div variants={rise} className="mt-10 lg:hidden">
                <ModuleInlineArt item={item} />
            </motion.div>
        </motion.div>
    );
}

export function ModuleBento({
    items,
    linkLabel,
    linkHref,
    demoLabel,
}: {
    items: BentoItem[];
    linkLabel?: string;
    linkHref?: string;
    /** Per-module "see it in a demo" link label. */
    demoLabel?: string;
}) {
    const reduce = useReducedMotion();
    const [active, setActive] = useState(0);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const baseId = useId();

    const current = items[active] ?? items[0];
    if (!current) return null;

    const tabId = (id: string) => `${baseId}-tab-${id}`;
    const panelId = (id: string) => `${baseId}-tabpanel-${id}`;

    const focusTab = (index: number) => {
        const next = (index + items.length) % items.length;
        setActive(next);
        tabRefs.current[next]?.focus();
    };

    const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        switch (event.key) {
            case "ArrowDown":
            case "ArrowRight":
                event.preventDefault();
                focusTab(index + 1);
                break;
            case "ArrowUp":
            case "ArrowLeft":
                event.preventDefault();
                focusTab(index - 1);
                break;
            case "Home":
                event.preventDefault();
                focusTab(0);
                break;
            case "End":
                event.preventDefault();
                focusTab(items.length - 1);
                break;
        }
    };

    return (
        <div className="relative overflow-x-clip">

            <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
                <MobileModuleList items={items} demoLabel={demoLabel} />

                <div className="relative hidden min-w-0 md:grid md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:items-start md:gap-10 lg:min-h-[600px] lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_minmax(0,320px)] lg:gap-12 xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)_minmax(0,380px)] xl:gap-16">
                    <div
                        className="relative z-20 min-w-0 border-l border-[#4d6b97]/15"
                        role="tablist"
                        aria-orientation="vertical"
                        aria-label="Modules"
                    >
                        {items.map((item, index) => {
                            const isActive = index === active;
                            const accent = accents[item.id] ?? fallbackAccent;
                            const Icon = accent.icon;

                            return (
                                <button
                                    key={item.id}
                                    ref={(el) => {
                                        tabRefs.current[index] = el;
                                    }}
                                    type="button"
                                    role="tab"
                                    id={tabId(item.id)}
                                    aria-selected={isActive}
                                    aria-controls={isActive ? panelId(item.id) : undefined}
                                    tabIndex={isActive ? 0 : -1}
                                    onClick={() => setActive(index)}
                                    onKeyDown={(event) => onTabKeyDown(event, index)}
                                    className={cx(
                                        "group relative -ml-px flex w-full cursor-pointer items-center gap-3 border-l-2 py-3 pr-3 pl-4 text-left",
                                        "transition-colors duration-150 ease-out",
                                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4d6b97]",
                                        isActive
                                            ? "border-[#4d6b97] bg-[#eef3f9]/70"
                                            : "border-transparent hover:bg-[#eef3f9]/40",
                                    )}
                                >
                                    <Icon
                                        aria-hidden
                                        className={cx(
                                            "size-4 shrink-0 transition-colors duration-150",
                                            isActive ? accent.iconClass : "text-[#8a8a8a] group-hover:text-[#4d6b97]",
                                        )}
                                    />
                                    <span
                                        className={cx(
                                            "text-[15px] font-semibold tracking-[-0.015em] transition-colors duration-150",
                                            isActive ? "text-[#090a24]" : "text-[#090a24]/60 group-hover:text-[#090a24]",
                                        )}
                                    >
                                        {item.name}
                                    </span>
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
                                transition={{ duration: 0.18, ease: easeLuxury }}
                            >
                                <ModuleDetailCopy
                                    item={current}
                                    reduce={reduce}
                                    panelId={panelId(current.id)}
                                    tabId={tabId(current.id)}
                                    demoLabel={demoLabel}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Art column (lg+): part of the layout, aligned with the copy */}
                    <div className="relative hidden aspect-[4/3] w-full self-center lg:block">
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={`art-${current.id}`}
                                initial={reduce ? false : { opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={reduce ? undefined : { opacity: 0 }}
                                transition={{ duration: 0.35, ease: easeLuxury }}
                                className="absolute -inset-y-[24%] left-[2%] -right-[14%] xl:left-[6%] xl:-right-[40%]"
                            >
                                <ModuleSideArt item={current} />
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
