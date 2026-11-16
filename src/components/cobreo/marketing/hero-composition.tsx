"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { StageCopy } from "@/components/cobreo/marketing/stage-copy";

const tone = {
    slate: "bg-[#e7e5e2] text-[#253353]",
    brand: "bg-[#d5e0ee] text-[#253353]",
    sage: "bg-[#e4e6df] text-[#253353]",
};

function Cursor() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden className="drop-shadow">
            <path d="M3 2.2 14.2 8.1 8.6 9.4 6.8 15.2Z" fill="#171717" stroke="#fff" strokeWidth="1" />
        </svg>
    );
}

export function HeroComposition({ copy }: { copy: StageCopy }) {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [28, -48]);
    const yBack = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [48, -16]);
    const rotateX = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [7, 2]);

    const row = copy.crmRows[0]!;

    return (
        <div ref={ref} className="relative mx-auto mt-4 h-[500px] w-full max-w-[1100px] sm:h-[600px] lg:mt-0 lg:h-[680px]">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-8 bottom-0 rounded-[40px] bg-[radial-gradient(ellipse_at_center,rgba(77,107,151,0.38),transparent_68%)]"
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(23,23,23,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(23,23,23,0.05)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
            />

            <motion.div style={{ y: yBack }} className="absolute top-6 right-[4%] hidden w-[340px] lg:block">
                <div className="rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_20px_50px_-24px_rgba(37,51,83,0.45)] backdrop-blur-md">
                    <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d6b97] uppercase">{copy.modules[1]}</p>
                    <p className="mt-2 text-sm font-medium">{copy.eventTitle}</p>
                    <p className="text-xs text-[#737373]">{copy.eventMeta}</p>
                    <div className="mt-3 grid grid-cols-8 gap-1">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <span key={i} className={i % 3 === 0 ? "h-2.5 rounded-[3px] bg-[#4d6b97]" : "h-2.5 rounded-[3px] bg-[#eceae6]"} />
                        ))}
                    </div>
                </div>
            </motion.div>

            <div className="absolute inset-x-0 top-2 [perspective:1600px] lg:top-6 lg:right-[10%] lg:left-[4%]">
                <motion.div style={{ y, rotateX }} className="origin-center will-change-transform">
                    <div className="origin-center lg:[transform:rotateY(-8deg)]">
                    <div className="overflow-hidden rounded-2xl border border-[#1c1c1c]/10 bg-white shadow-[0_40px_80px_-28px_rgba(37,51,83,0.45)]">
                        <div className="flex h-11 items-center gap-2 border-b border-[#1c1c1c]/8 px-3">
                            <span className="text-[12px] font-semibold tracking-tight">Cobreo</span>
                            <span className="ml-2 hidden items-center rounded-md border border-[#1c1c1c]/8 bg-[#fafaf8] px-2 py-1 text-[11px] text-[#737373] sm:inline-flex">
                                {copy.search}
                            </span>
                            <kbd className="ml-auto rounded border border-[#1c1c1c]/10 bg-[#fafaf8] px-1.5 py-0.5 text-[10px] text-[#737373]">{copy.kbd}</kbd>
                        </div>
                        <div className="flex sm:min-h-[320px]">
                            <aside className="hidden w-[168px] shrink-0 border-r border-[#1c1c1c]/8 bg-[#fafaf8] p-2 sm:block">
                                <p className="px-2 py-1.5 text-[12px] text-[#737373]">{copy.home}</p>
                                {copy.modules.map((name, index) => (
                                    <motion.p
                                        key={name}
                                        initial={reduce ? false : { opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.35 + index * 0.45, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                                        className={
                                            index === 0
                                                ? "mt-0.5 rounded-md bg-white px-2 py-1.5 text-[12px] font-medium shadow-[0_1px_0_rgba(23,23,23,0.04)]"
                                                : "mt-0.5 rounded-md px-2 py-1.5 text-[12px] text-[#404040]"
                                        }
                                    >
                                        {name}
                                    </motion.p>
                                ))}
                            </aside>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between border-b border-[#1c1c1c]/8 px-3 py-2">
                                    <p className="text-[12px] font-medium">{copy.people}</p>
                                    <p className="text-[11px] text-[#737373]">{copy.modules[0]}</p>
                                </div>
                                <ul>
                                    {copy.crmRows.map((person, index) => (
                                        <li
                                            key={person.name}
                                            className="flex items-center gap-2 border-b border-[#1c1c1c]/6 px-3 py-2.5"
                                        >
                                            <span className={`grid size-7 place-items-center rounded-full text-[10px] font-semibold ${tone[person.tone]}`}>
                                                {person.initials}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-[13px] font-medium">{person.name}</span>
                                                <span className="block truncate text-[11px] text-[#737373]">{person.org}</span>
                                            </span>
                                            <span className="hidden rounded-md bg-[#f3f1ee] px-1.5 py-0.5 text-[10px] text-[#525252] md:inline">
                                                {person.tag}
                                            </span>
                                            {person.next ? (
                                                <span className="relative inline-grid">
                                                    <span className="col-start-1 row-start-1 rounded-md bg-[#f3f1ee] px-1.5 py-0.5 text-[10px] font-medium text-[#253353] cobreo-swap-from">
                                                        {person.status}
                                                    </span>
                                                    <span className="col-start-1 row-start-1 rounded-md bg-[#e7eef6] px-1.5 py-0.5 text-[10px] font-medium text-[#253353] cobreo-swap-to">
                                                        {person.next}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="rounded-md bg-[#f3f1ee] px-1.5 py-0.5 text-[10px] font-medium text-[#253353]">
                                                    {person.status}
                                                </span>
                                            )}
                                            {index === 0 ? <span className="sr-only">{row.name}</span> : null}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <aside className="hidden w-[220px] shrink-0 border-l border-[#1c1c1c]/8 p-3 lg:block">
                                <div className="flex items-center gap-2">
                                    <span className={`grid size-8 place-items-center rounded-full text-[11px] font-semibold ${tone.brand}`}>IM</span>
                                    <span>
                                        <span className="block text-[13px] font-medium">{copy.crmRows[0]!.name}</span>
                                        <span className="block text-[11px] text-[#737373]">{copy.crmRows[0]!.tag}</span>
                                    </span>
                                </div>
                                <p className="mt-3 text-[11px] tracking-[0.12em] text-[#737373] uppercase">{copy.activity}</p>
                                <p className="mt-2 text-[12px] leading-5 text-[#404040]">{copy.crmNote}</p>
                                <motion.p
                                    initial={reduce ? false : { opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 2.2, duration: 0.4 }}
                                    className="mt-2 text-[12px] leading-5 text-[#253353]"
                                >
                                    {copy.crmNext}
                                </motion.p>
                            </aside>
                        </div>
                    </div>
                    </div>
                </motion.div>
            </div>

            {!reduce ? (
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute z-20 hidden lg:block"
                    initial={{ opacity: 0, x: 280, y: 180 }}
                    animate={{ opacity: [0, 1, 1, 0], x: [280, 340, 420], y: [180, 250, 250] }}
                    transition={{ duration: 2.8, delay: 1.5, times: [0, 0.15, 0.75, 1] }}
                >
                    <Cursor />
                </motion.div>
            ) : null}

            <motion.div
                initial={reduce ? false : { opacity: 0, y: 16, x: -8 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 1.15, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-2 left-2 z-20 flex items-center gap-2 rounded-full border border-[#1c1c1c]/10 bg-white px-3 py-1.5 text-[12px] shadow-[0_12px_30px_-16px_rgba(37,51,83,0.5)] sm:bottom-6 sm:left-6"
            >
                <span className="size-1.5 rounded-full bg-[#4d6b97]" />
                {copy.modules[2]}
                <span className="text-[#737373]">{copy.snap}</span>
            </motion.div>
        </div>
    );
}
