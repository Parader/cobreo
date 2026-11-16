"use client";

import { motion, useReducedMotion } from "motion/react";
import type { StageCopy } from "@/components/cobreo/marketing/stage-copy";

function Panel({
    title,
    delay,
    children,
}: {
    title: string;
    delay: number;
    children: React.ReactNode;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.section
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
            className="min-w-0 border-b border-[#1c1c1c]/8 p-4 sm:p-5 md:odd:border-r"
        >
            <h3 className="text-[12px] font-semibold tracking-[0.04em] text-[#4d6b97] uppercase">{title}</h3>
            {children}
        </motion.section>
    );
}

export function HeroComposition({ copy }: { copy: StageCopy }) {
    const reduce = useReducedMotion();

    return (
        <div className="mt-10 overflow-hidden rounded-2xl border border-[#1c1c1c]/10 bg-white shadow-[0_30px_70px_-36px_rgba(37,51,83,0.45)]">
            <div className="flex h-12 items-center gap-3 border-b border-[#1c1c1c]/8 px-4">
                <span className="text-[13px] font-semibold tracking-tight">Cobreo</span>
                <span className="hidden items-center rounded-md border border-[#1c1c1c]/8 bg-[#f4f7fb] px-2.5 py-1 text-[12px] text-[#737373] sm:inline-flex">
                    {copy.search}
                </span>
                <kbd className="ml-auto rounded border border-[#1c1c1c]/10 bg-[#f4f7fb] px-1.5 py-0.5 text-[10px] text-[#737373]">{copy.kbd}</kbd>
            </div>
            <div className="grid lg:grid-cols-[196px_minmax(0,1fr)]">
                <aside className="flex gap-1 overflow-x-auto border-b border-[#1c1c1c]/8 bg-[#f7f9fb] p-2 lg:flex-col lg:border-r lg:border-b-0 lg:p-3">
                    {copy.modules.map((name, index) => (
                        <motion.p
                            key={name}
                            initial={reduce ? false : { opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.15 + index * 0.18, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className={
                                index === 0
                                    ? "shrink-0 rounded-md bg-white px-2.5 py-2 text-[13px] font-medium text-[#253353] shadow-[0_1px_0_rgba(23,23,23,0.04)]"
                                    : "shrink-0 rounded-md px-2.5 py-2 text-[13px] text-[#404040]"
                            }
                        >
                            {name}
                        </motion.p>
                    ))}
                </aside>
                <div className="grid md:grid-cols-2">
                    <Panel title={copy.modules[1]} delay={0.25}>
                        <p className="mt-3 text-[18px] font-medium tracking-[-0.02em]">{copy.eventTitle}</p>
                        <p className="text-[13px] text-[#737373]">{copy.eventMeta}</p>
                        <ul className="mt-4 space-y-2.5">
                            {copy.registrations.slice(0, 3).map((person) => (
                                <li key={person.name} className="flex items-center justify-between gap-3 text-[13px]">
                                    <span>
                                        <span className="font-medium">{person.name}</span>
                                        <span className="text-[#737373]"> · {person.org}</span>
                                    </span>
                                    <span className="rounded-md bg-[#e7eef6] px-1.5 py-0.5 text-[11px] font-medium text-[#253353]">{person.status}</span>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                    <Panel title={copy.modules[2]} delay={0.4}>
                        <ul className="mt-3 space-y-2">
                            {copy.bookings.map((item) => (
                                <motion.li
                                    key={item.title}
                                    initial={reduce || !item.appear ? false : { opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.1, duration: 0.4 }}
                                    className="flex items-baseline justify-between gap-3 rounded-lg border border-[#1c1c1c]/8 bg-[#f7f9fb] px-3 py-2"
                                >
                                    <span>
                                        <span className="block text-[13px] font-medium">{item.title}</span>
                                        <span className="block text-[12px] text-[#737373]">{item.who}</span>
                                    </span>
                                    <span className="text-[12px] text-[#525252]">{copy.days[item.day]} {item.time}</span>
                                </motion.li>
                            ))}
                        </ul>
                    </Panel>
                    <Panel title={copy.modules[3]} delay={0.55}>
                        <p className="mt-3 text-[14px] leading-5 font-medium text-pretty">{copy.surveyQ}</p>
                        <ul className="mt-3 space-y-3">
                            {copy.replies.slice(0, 2).map((reply) => (
                                <li key={reply.name}>
                                    <p className="text-[12px] font-medium text-[#253353]">{reply.name}</p>
                                    <p className="text-[13px] leading-5 text-pretty text-[#404040]">{reply.text}</p>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                    <Panel title={copy.modules[0]} delay={0.7}>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                            {copy.pipeline.map((column) => (
                                <div key={column.label} className="min-w-0">
                                    <p className="mb-2 text-[11px] font-medium text-[#737373]">{column.label}</p>
                                    <div className="rounded-lg border border-[#1c1c1c]/8 bg-[#f7f9fb] px-2 py-2">
                                        <p className="truncate text-[12px] font-medium">{column.name}</p>
                                        <p className="truncate text-[11px] text-[#737373]">{column.org}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            </div>
        </div>
    );
}
