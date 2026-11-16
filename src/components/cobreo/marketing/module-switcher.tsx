"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { StageCopy } from "@/components/cobreo/marketing/stage-copy";
import { cx } from "@/utils/cx";

const tone = {
    slate: "bg-[#e7e5e2] text-[#253353]",
    brand: "bg-[#d5e0ee] text-[#253353]",
    sage: "bg-[#e4e6df] text-[#253353]",
};

function Frame({ children, label }: { children: React.ReactNode; label: string }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-[#1c1c1c]/10 bg-white shadow-[0_24px_60px_-32px_rgba(37,51,83,0.4)]">
            <div className="flex h-10 items-center border-b border-[#1c1c1c]/8 px-3 text-[12px] font-medium text-[#525252]">
                {label}
            </div>
            {children}
        </div>
    );
}

function CrmScene({ copy }: { copy: StageCopy }) {
    const reduce = useReducedMotion();
    return (
        <Frame label={copy.modules[0]}>
            <div className="grid min-h-[420px] lg:grid-cols-[180px_minmax(0,1fr)_240px]">
                <aside className="hidden border-r border-[#1c1c1c]/8 bg-[#fafaf8] p-2 lg:block">
                    <p className="px-2 py-1.5 text-[12px] text-[#737373]">{copy.home}</p>
                    {copy.modules.map((name, index) => (
                        <p key={name} className={cx("rounded-md px-2 py-1.5 text-[12px]", index === 0 ? "bg-white font-medium" : "text-[#404040]")}>
                            {name}
                        </p>
                    ))}
                </aside>
                <div>
                    <p className="border-b border-[#1c1c1c]/8 px-4 py-2 text-[12px] font-medium">{copy.people}</p>
                    <ul>
                        {copy.crmRows.map((person) => (
                            <li key={person.name} className="flex items-center gap-3 border-b border-[#1c1c1c]/6 px-4 py-3">
                                <span className={cx("grid size-8 place-items-center rounded-full text-[11px] font-semibold", tone[person.tone])}>
                                    {person.initials}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[13px] font-medium">{person.name}</span>
                                    <span className="block truncate text-[11px] text-[#737373]">{person.org}</span>
                                </span>
                                <span className="hidden rounded-md bg-[#f6f5f3] px-1.5 py-0.5 text-[10px] text-[#525252] sm:inline">{person.tag}</span>
                                <span className="rounded-md bg-[#e7eef6] px-1.5 py-0.5 text-[10px] font-medium text-[#253353]">
                                    {person.next ?? person.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <aside className="border-t border-[#1c1c1c]/8 p-4 lg:border-t-0 lg:border-l">
                    <p className="text-[11px] tracking-[0.14em] text-[#737373] uppercase">{copy.activity}</p>
                    <p className="mt-3 text-[13px] leading-5">{copy.crmNote}</p>
                    <motion.p
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35, duration: 0.4 }}
                        className="mt-3 rounded-lg bg-[#f4f7fb] px-3 py-2 text-[13px] leading-5 text-[#253353]"
                    >
                        {copy.crmNext}
                    </motion.p>
                </aside>
            </div>
        </Frame>
    );
}

function EventScene({ copy }: { copy: StageCopy }) {
    const reduce = useReducedMotion();
    return (
        <Frame label={copy.modules[1]}>
            <div className="grid min-h-[420px] lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="p-4 sm:p-5">
                    <p className="text-[11px] tracking-[0.14em] text-[#4d6b97] uppercase">{copy.eventSeats}</p>
                    <h3 className="mt-1 text-xl font-medium tracking-[-0.03em]">{copy.eventTitle}</h3>
                    <p className="text-sm text-[#737373]">{copy.eventMeta}</p>
                    <div className="mt-5 grid grid-cols-8 gap-1.5 sm:grid-cols-12">
                        {Array.from({ length: 48 }).map((_, i) => {
                            const filled = i % 4 !== 1;
                            const late = i === 17 || i === 18 || i === 29;
                            return (
                                <motion.span
                                    key={i}
                                    initial={reduce || !late ? false : { scale: 0.4, opacity: 0.4 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.4 + (i % 5) * 0.05, duration: 0.35 }}
                                    className={cx(
                                        "h-4 rounded-[4px]",
                                        late ? "bg-[#253353]" : filled ? "bg-[#4d6b97]" : "bg-[#eceae6]",
                                    )}
                                />
                            );
                        })}
                    </div>
                </div>
                <div className="border-t border-[#1c1c1c]/8 p-4 lg:border-t-0 lg:border-l">
                    <p className="text-[12px] font-medium">{copy.eventPeople}</p>
                    <ul className="mt-3 space-y-3">
                        {copy.registrations.map((person, index) => (
                            <motion.li
                                key={person.name}
                                initial={reduce ? false : { opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 * index, duration: 0.35 }}
                                className="flex items-center justify-between gap-3"
                            >
                                <span>
                                    <span className="block text-[13px] font-medium">{person.name}</span>
                                    <span className="block text-[11px] text-[#737373]">{person.org}</span>
                                </span>
                                <span className="rounded-md bg-[#f3f1ee] px-1.5 py-0.5 text-[10px] font-medium">{person.status}</span>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>
        </Frame>
    );
}

function CalendarScene({ copy }: { copy: StageCopy }) {
    const reduce = useReducedMotion();
    return (
        <Frame label={copy.modules[2]}>
            <div className="grid min-h-[420px] grid-cols-5 gap-2 p-3 sm:p-4">
                {copy.days.map((day, index) => (
                    <div key={day} className="min-w-0">
                        <p className="mb-2 text-[11px] font-medium text-[#737373]">{day}</p>
                        <div className="flex min-h-[340px] flex-col gap-2 rounded-xl bg-[#fafaf8] p-1.5">
                            {copy.bookings
                                .filter((item) => item.day === index)
                                .map((item) => (
                                    <motion.div
                                        key={item.title}
                                        initial={reduce || !item.appear ? false : { opacity: 0, y: 10, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ delay: 0.45, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        className="rounded-lg border border-[#1c1c1c]/10 bg-white px-2 py-1.5"
                                    >
                                        <p className="text-[10px] text-[#737373]">{item.time}</p>
                                        <p className="text-[12px] font-medium">{item.title}</p>
                                        <p className="truncate text-[10px] text-[#525252]">{item.who}</p>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </Frame>
    );
}

function SurveyScene({ copy }: { copy: StageCopy }) {
    const reduce = useReducedMotion();
    return (
        <Frame label="Satisfaction">
            <div className="grid min-h-[420px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="border-b border-[#1c1c1c]/8 p-5 lg:border-r lg:border-b-0">
                    <p className="text-[15px] font-medium tracking-[-0.02em] text-pretty">{copy.surveyQ}</p>
                    <ul className="mt-6 space-y-4">
                        {copy.bars.map((bar, index) => (
                            <li key={bar.label}>
                                <p className="text-[12px] text-[#525252]">{bar.label}</p>
                                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f0eeeb]">
                                    <motion.div
                                        className="h-full origin-left rounded-full bg-[#4d6b97]"
                                        initial={reduce ? false : { scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        style={{ width: bar.width }}
                                        transition={{ delay: 0.15 + index * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <ul className="divide-y divide-[#1c1c1c]/8">
                    {copy.replies.map((reply) => (
                        <motion.li
                            key={reply.name}
                            initial={reduce || !reply.appear ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55, duration: 0.4 }}
                            className="px-5 py-4"
                        >
                            <p className="text-[12px] font-medium">{reply.name}</p>
                            <p className="mt-1 text-[13px] leading-5 text-pretty text-[#404040]">{reply.text}</p>
                        </motion.li>
                    ))}
                </ul>
            </div>
        </Frame>
    );
}

const scenes = [CrmScene, EventScene, CalendarScene, SurveyScene];

export function ModuleSwitcher({
    copy,
    label,
    tabs,
}: {
    copy: StageCopy;
    label: string;
    tabs: string[];
}) {
    const [active, setActive] = useState(0);
    const reduce = useReducedMotion();
    const Scene = scenes[active] ?? CrmScene;

    return (
        <div>
            <div role="tablist" aria-label={label} className="mb-4 flex gap-1 overflow-x-auto">
                {tabs.map((tab, index) => (
                    <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={index === active}
                        onClick={() => setActive(index)}
                        className={cx(
                            "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-150",
                            index === active ? "bg-[#253353] text-white" : "bg-white text-[#404040] ring-1 ring-[#1c1c1c]/10",
                        )}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={active}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Scene copy={copy} />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
