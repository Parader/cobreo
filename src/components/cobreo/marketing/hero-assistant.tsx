"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ArrowUp, BarChart10, ChevronDown, ChevronLeft, ChevronRight, Eye, HelpCircle, Home02, Microphone01, SearchSm, Stars02 } from "@untitledui/icons";
import { moduleAccent } from "@/components/cobreo/marketing/module-bento";
import { cx } from "@/utils/cx";

/** What the assistant offers next: go look, see figures, preview something, or decide. */
export type HeroNext =
    | { type: "link"; label: string }
    | { type: "decision"; question: string; confirm: string; cancel: string }
    | { type: "preview"; label: string; title: string; body: string; confirm: string; cancel: string }
    | { type: "chart"; title: string; rows: { label: string; value: number }[] };

export type HeroScenario = {
    label: string;
    prompt: string;
    reply: string;
    /** Modules involved, with where things stand (suggested, to confirm, figures…). */
    actions: { module: string; status: string }[];
    next?: HeroNext;
};

type Phase = "typing" | "sent" | "thinking" | "reply";

const TYPE_MS = 46;
const SENT_MS = 450;
const THINK_MS = 1300;
const HOLD_MS = 8500;
const ease = [0.23, 1, 0.32, 1] as const;

function Buttons({ confirm, cancel }: { confirm: string; cancel: string }) {
    return (
        <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-lg bg-[#4d6b97] px-3 py-1.5 text-[13px] font-semibold text-white">{confirm}</span>
            <span className="rounded-lg border border-[#4d6b97]/25 bg-white px-3 py-1.5 text-[13px] font-semibold text-[#253353]">{cancel}</span>
        </div>
    );
}

function NextStep({ next, reduce }: { next: HeroNext; reduce: boolean | null }) {
    const appear = {
        initial: reduce ? false : ({ opacity: 0, y: 6 } as const),
        animate: { opacity: 1, y: 0 },
        transition: { delay: reduce ? 0 : 1.1, duration: 0.45, ease },
    };
    let body: ReactNode;

    if (next.type === "link") {
        body = (
            <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-[#4d6b97] underline decoration-[#4d6b97]/30 underline-offset-4">
                {next.label}
                <ArrowRight className="size-4" />
            </span>
        );
    } else if (next.type === "decision") {
        body = (
            <div className="rounded-xl border border-[#4d6b97]/20 bg-[#eef3f9]/60 px-3.5 py-3">
                <p className="text-[14px] leading-6 text-[#090a24]">{next.question}</p>
                <Buttons confirm={next.confirm} cancel={next.cancel} />
            </div>
        );
    } else if (next.type === "preview") {
        body = (
            <div className="overflow-hidden rounded-xl border border-[#4d6b97]/20 bg-white">
                <p className="flex items-center gap-2 border-b border-[#4d6b97]/10 bg-[#eef3f9]/60 px-3.5 py-2 text-[12px] font-medium text-[#4d6b97]">
                    <Eye className="size-3.5" />
                    {next.label}
                </p>
                <div className="px-3.5 py-3">
                    <p className="text-[14px] font-semibold text-[#090a24]">{next.title}</p>
                    <p className="mt-1 text-[14px] leading-6 text-[#525252]">{next.body}</p>
                    <Buttons confirm={next.confirm} cancel={next.cancel} />
                </div>
            </div>
        );
    } else {
        const max = Math.max(...next.rows.map((row) => row.value), 1);
        body = (
            <div className="rounded-xl border border-[#4d6b97]/15 bg-white px-3.5 py-3.5">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-[#090a24]">
                    <BarChart10 className="size-4 text-[#4d6b97]" />
                    {next.title}
                </p>
                <ul className="mt-3 space-y-2">
                    {next.rows.map((row, i) => (
                        <li key={row.label} className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)_2.5rem] items-center gap-2.5 text-[12px]">
                            <span className="truncate text-[#525252]">{row.label}</span>
                            <span className="h-2 overflow-hidden rounded-full bg-[#eef3f9]">
                                <motion.span
                                    className="block h-full rounded-full bg-[#4d6b97]"
                                    initial={reduce ? false : { width: 0 }}
                                    animate={{ width: `${(row.value / max) * 100}%` }}
                                    transition={{ delay: reduce ? 0 : 1.4 + i * 0.15, duration: 0.9, ease }}
                                />
                            </span>
                            <span className="text-right font-semibold text-[#090a24] tabular-nums">{row.value}&nbsp;%</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <motion.div {...appear} className="mt-3">
            {body}
        </motion.div>
    );
}

export type HeroChrome = {
    home: string;
    search: string;
    help: string;
    greeting: string;
    modules: string;
    composer: string;
    meetings: string;
    today: string;
    tasks: string;
};

const bar = "rounded-full bg-[#e3e8ef]";

/** Sidebar in the shape of the app: workspace, search, home, modules (icons + grey bars). */
function Sidebar({ chrome, moduleIds }: { chrome: HeroChrome; moduleIds: string[] }) {
    const widths = [58, 46, 66, 52, 62, 42, 56, 68, 48];
    return (
        <aside className="hidden flex-col border-r border-[#1c1c1c]/8 bg-[#f7f9fb] px-2.5 py-3 md:flex" aria-hidden>
            <div className="flex items-center gap-2 px-1.5 py-1">
                <span className="inline-flex size-6 items-center justify-center rounded-md bg-[#4d6b97] text-[12px] font-bold text-white">C</span>
                <span className="hidden text-[14px] font-semibold text-[#090a24] lg:inline">Cobreo</span>
                <ChevronDown className="hidden size-3.5 text-[#8a909c] lg:block" />
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#1c1c1c]/8 bg-white px-2 py-1.5 text-[13px] text-[#6b7280]">
                <SearchSm className="size-3.5 shrink-0" />
                <span className="hidden flex-1 lg:inline">{chrome.search}</span>
                <kbd className="hidden rounded border border-[#1c1c1c]/10 px-1 text-[10px] lg:inline">⌘K</kbd>
            </div>
            <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-white px-2 py-1.5 text-[13px] font-medium text-[#090a24] shadow-[0_1px_2px_rgba(9,10,36,0.06)]">
                <Home02 className="size-4 shrink-0 text-[#4d6b97]" />
                <span className="hidden lg:inline">{chrome.home}</span>
            </div>
            <p className="mt-4 hidden px-2 text-[11px] font-medium text-[#8a909c] lg:block">{chrome.modules}</p>
            <div className="mt-1 flex flex-col">
                {moduleIds.map((id, i) => {
                    const accent = moduleAccent(id);
                    const Icon = accent.icon;
                    return (
                        <span key={id} className="flex items-center gap-2.5 px-2 py-[7px]">
                            <span className={cx("inline-flex size-5 shrink-0 items-center justify-center rounded", accent.tile)}>
                                <Icon className={cx("size-3", accent.iconClass)} />
                            </span>
                            <span className={cx("hidden h-2 lg:block", bar)} style={{ width: `${widths[i % widths.length]}%` }} />
                        </span>
                    );
                })}
            </div>
        </aside>
    );
}

/** Home sections under the composer before a request is sent: today's appointments and tasks. */
function HomeSections({ chrome }: { chrome: HeroChrome }) {
    return (
        <div aria-hidden className="space-y-7">
            <div>
                <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-[#4b5263]">{chrome.meetings}</p>
                    <span className="flex items-center gap-1.5 text-[12px] text-[#8a909c]">
                        {chrome.today}
                        <ChevronLeft className="size-3.5" />
                        <ChevronRight className="size-3.5" />
                    </span>
                </div>
                <div className="mt-3 space-y-2">
                    {[0, 1].map((row) => (
                        <div key={row} className="flex items-center gap-3 rounded-lg border border-[#1c1c1c]/6 px-3 py-2.5">
                            <span className="h-7 w-1 shrink-0 rounded-full bg-[#c9d3e2]" />
                            <span className="flex flex-1 flex-col gap-1.5">
                                <span className={cx("h-2.5", bar)} style={{ width: row ? "38%" : "52%" }} />
                                <span className="h-2 w-20 rounded-full bg-[#eef1f5]" />
                            </span>
                            <span className="h-2 w-10 rounded-full bg-[#eef1f5]" />
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <p className="text-[13px] font-semibold text-[#4b5263]">{chrome.tasks}</p>
                <div className="mt-3 divide-y divide-[#1c1c1c]/6">
                    {[0, 1, 2].map((row) => (
                        <div key={row} className="flex items-center gap-3 py-2.5">
                            <span className="size-3.5 shrink-0 rounded-full border border-[#c4c8d0]" />
                            <span className={cx("h-2.5", bar)} style={{ width: `${44 + row * 12}%` }} />
                            <span className="ml-auto h-2 w-12 rounded-full bg-[#eef1f5]" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/**
 * AI-led hero visual in the shape of the Cobreo home: sidebar, greeting, a large
 * "ask anything" composer, then today's sections — real labels, skeleton data.
 * A request is typed and sent, the sections give way to the conversation, and
 * the assistant eases in: suggests a module, shows figures or a preview, asks
 * before acting. Cycles through scenarios until the visitor picks a suggestion.
 */
export function HeroAssistant({
    chrome,
    sendLabel,
    scenariosLabel,
    scenarios,
    moduleNames,
}: {
    chrome: HeroChrome;
    sendLabel: string;
    scenariosLabel: string;
    scenarios: HeroScenario[];
    moduleNames: Record<string, string>;
}) {
    const reduce = useReducedMotion();
    const [index, setIndex] = useState(0);
    const [typed, setTyped] = useState(0);
    const [phase, setPhase] = useState<Phase>("typing");
    const [auto, setAuto] = useState(true);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const scenario = scenarios[index] ?? scenarios[0];
    const promptLength = scenario?.prompt.length ?? 0;

    function go(next: number, keepAuto: boolean) {
        setIndex(next);
        setTyped(0);
        setPhase("typing");
        if (!keepAuto) setAuto(false);
        const chip = chipRefs.current[next];
        const row = chip?.parentElement;
        if (chip && row) row.scrollTo({ left: chip.offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
    }

    useEffect(() => {
        if (!scenario) return;
        const clear = () => {
            if (timer.current) clearTimeout(timer.current);
        };
        clear();

        if (reduce) {
            setTyped(promptLength);
            setPhase("reply");
            if (auto) timer.current = setTimeout(() => go((index + 1) % scenarios.length, true), HOLD_MS + 2000);
            return clear;
        }

        if (phase === "typing") {
            timer.current =
                typed < promptLength
                    ? setTimeout(() => setTyped((n) => n + 1), TYPE_MS)
                    : setTimeout(() => setPhase("sent"), 500);
        } else if (phase === "sent") {
            timer.current = setTimeout(() => setPhase("thinking"), SENT_MS);
        } else if (phase === "thinking") {
            timer.current = setTimeout(() => setPhase("reply"), THINK_MS);
        } else if (phase === "reply" && auto) {
            timer.current = setTimeout(() => go((index + 1) % scenarios.length, true), HOLD_MS);
        }
        return clear;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, typed, index, auto, reduce, promptLength]);

    if (!scenario) return null;

    const sent = phase !== "typing";

    return (
        <div className="grid overflow-hidden rounded-2xl border border-[#1c1c1c]/10 bg-white shadow-[0_40px_90px_-42px_rgba(37,51,83,0.5)] ring-1 ring-[#253353]/[0.04] md:grid-cols-[56px_minmax(0,1fr)] lg:grid-cols-[210px_minmax(0,1fr)]">
            <Sidebar chrome={chrome} moduleIds={Object.keys(moduleNames)} />

            <section aria-label={chrome.home} className="flex h-[720px] min-w-0 flex-col sm:h-[640px]">
                {/* Breadcrumb bar */}
                <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[#1c1c1c]/8 px-4 text-[13px] font-medium text-[#090a24]" aria-hidden>
                    <Home02 className="size-3.5 text-[#6b7280]" />
                    {chrome.home}
                    <span className="ml-auto flex items-center gap-1.5 text-[12px] text-[#6b7280]">
                        <HelpCircle className="size-3.5" />
                        {chrome.help}
                    </span>
                </div>

                <div className="flex min-h-0 flex-1 justify-center overflow-hidden px-4 pt-7 pb-5 md:px-10 md:pt-10">
                    <div className="flex w-full max-w-[600px] flex-col">
                        <p className="flex items-center gap-2 text-[20px] font-semibold tracking-[-0.02em] text-[#090a24]" aria-hidden>
                            {chrome.greeting}
                            <span className="h-3.5 w-20 rounded-full bg-[#dfe5ee]" />
                        </p>

                        {/* Composer */}
                        <div
                            aria-hidden
                            className="mt-4 flex min-h-[96px] flex-col rounded-xl border border-[#4d6b97]/25 bg-white px-4 pt-3 pb-2.5 shadow-[0_1px_2px_rgba(9,10,36,0.04),0_10px_28px_-20px_rgba(37,51,83,0.4)]"
                        >
                            <p className="flex-1 text-[15px] leading-6 text-[#090a24]">
                                {!sent && typed > 0 ? (
                                    scenario.prompt.slice(0, typed)
                                ) : (
                                    <span className="text-[#9aa1ab]">{chrome.composer}</span>
                                )}
                                {!sent && !reduce && typed > 0 ? (
                                    <span className="ml-px inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-pulse bg-[#4d6b97]" />
                                ) : null}
                            </p>
                            <div className="mt-2 flex items-center justify-end gap-2">
                                <span className="inline-flex items-center gap-1 text-[12px] text-[#8a909c]">
                                    <Stars02 className="size-3.5" />
                                    Auto
                                </span>
                                <span
                                    className={cx(
                                        "inline-flex size-7 items-center justify-center rounded-lg transition-colors duration-300",
                                        !sent && typed > 0 ? "bg-[#4d6b97] text-white" : "bg-[#4d6b97]/12 text-[#4d6b97]",
                                    )}
                                    title={sendLabel}
                                >
                                    {!sent && typed > 0 ? <ArrowUp className="size-3.5" /> : <Microphone01 className="size-3.5" />}
                                </span>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div
                            className="relative -mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                            role="group"
                            aria-label={scenariosLabel}
                        >
                            {scenarios.map((item, i) => (
                                <button
                                    key={item.label}
                                    ref={(el) => {
                                        chipRefs.current[i] = el;
                                    }}
                                    type="button"
                                    aria-pressed={i === index}
                                    onClick={() => go(i, false)}
                                    className={cx(
                                        "shrink-0 cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors duration-150 ease-out",
                                        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#4d6b97]",
                                        i === index
                                            ? "border-[#4d6b97] bg-[#4d6b97] text-white"
                                            : "border-[#4d6b97]/20 bg-white text-[#253353] hover:border-[#4d6b97]/60",
                                    )}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Today's sections → conversation */}
                        <div aria-hidden className="relative mt-6 min-h-0 flex-1">
                            <AnimatePresence mode="wait" initial={false}>
                                {!sent ? (
                                    <motion.div
                                        key="home"
                                        initial={reduce ? false : { opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, transition: { duration: 0.25 } }}
                                        transition={{ duration: 0.4, ease }}
                                    >
                                        <HomeSections chrome={chrome} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={`chat-${index}`}
                                        initial={reduce ? false : { opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                        transition={{ duration: 0.35, ease }}
                                    >
                                        <p className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-md bg-[#4d6b97] px-3.5 py-2.5 text-[14px] leading-6 text-white">
                                            {scenario.prompt}
                                        </p>

                                        {phase === "sent" || phase === "thinking" ? (
                                            <div className="mt-4 flex gap-1">
                                                {[0, 1, 2].map((dot) => (
                                                    <span
                                                        key={dot}
                                                        className="size-1.5 animate-bounce rounded-full bg-[#4d6b97]/60"
                                                        style={{ animationDelay: `${dot * 140}ms` }}
                                                    />
                                                ))}
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={reduce ? false : { opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.45, ease }}
                                                className="mt-4"
                                            >
                                                <p className="text-[15px] leading-6 text-pretty text-[#171717]">{scenario.reply}</p>
                                                <ul className="mt-3 flex flex-wrap gap-1.5">
                                                    {scenario.actions.map((action, i) => {
                                                        const accent = moduleAccent(action.module);
                                                        const Icon = accent.icon;
                                                        return (
                                                            <motion.li
                                                                key={`${action.module}-${action.status}`}
                                                                initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: reduce ? 0 : 0.45 + i * 0.25, duration: 0.4, ease }}
                                                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#4d6b97]/15 bg-white py-1 pr-2.5 pl-1 text-[13px]"
                                                            >
                                                                <span className={cx("inline-flex size-5 items-center justify-center rounded-md", accent.tile)}>
                                                                    <Icon className={cx("size-3", accent.iconClass)} />
                                                                </span>
                                                                <span className="font-semibold text-[#090a24]">{moduleNames[action.module] ?? action.module}</span>
                                                                <span className="text-[#525252]">{action.status}</span>
                                                            </motion.li>
                                                        );
                                                    })}
                                                </ul>
                                                {scenario.next ? <NextStep next={scenario.next} reduce={reduce} /> : null}
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
