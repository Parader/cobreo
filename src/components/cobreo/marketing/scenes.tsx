import type { ReactNode } from "react";
import { cx } from "@/utils/cx";

export type SceneRow = {
    title: string;
    meta: string;
    status: string;
    statusAlt?: string;
    appear?: boolean;
};

type NavItem = { label: string; current?: boolean };

function Shell({
    label,
    nav,
    search,
    children,
}: {
    label: string;
    nav?: NavItem[];
    search?: string;
    children: ReactNode;
}) {
    return (
        <div
            className="overflow-hidden rounded-xl border border-[#1c1c1c]/10 bg-white text-[#1c1c1c] shadow-[0_1px_2px_rgba(23,23,23,0.04)]"
            aria-hidden
        >
            <div className="flex items-center gap-3 border-b border-[#1c1c1c]/8 px-3 py-2">
                <span className="text-[11px] font-semibold tracking-[0.04em] text-[#737373] uppercase">{label}</span>
                {search ? (
                    <span className="ml-auto hidden h-7 items-center rounded-md border border-[#1c1c1c]/8 bg-[#fafaf8] px-2 text-[12px] text-[#737373] sm:inline-flex sm:w-40">
                        {search}
                    </span>
                ) : null}
            </div>
            <div className="flex flex-col sm:flex-row">
                {nav && nav.length > 0 ? (
                    <div className="flex gap-1 overflow-x-auto border-b border-[#1c1c1c]/8 px-2 py-2 sm:w-[148px] sm:flex-col sm:border-r sm:border-b-0 sm:px-2 sm:py-3">
                        {nav.map((item) => (
                            <span
                                key={item.label}
                                className={cx(
                                    "shrink-0 rounded-md px-2 py-1.5 text-[12px] leading-4",
                                    item.current ? "bg-[#f3f1ee] font-medium text-[#1c1c1c]" : "text-[#525252]",
                                )}
                            >
                                {item.label}
                            </span>
                        ))}
                    </div>
                ) : null}
                <div className="min-w-0 flex-1 p-3 sm:p-4">{children}</div>
            </div>
        </div>
    );
}

function Status({ row }: { row: SceneRow }) {
    if (!row.statusAlt) {
        return (
            <span className="inline-flex rounded-md bg-[#f3f1ee] px-1.5 py-0.5 text-[11px] font-medium text-[#253353]">
                {row.status}
            </span>
        );
    }

    return (
        <span className="relative inline-grid">
            <span data-status="from" className="col-start-1 row-start-1 inline-flex rounded-md bg-[#f3f1ee] px-1.5 py-0.5 text-[11px] font-medium text-[#253353]">
                {row.status}
            </span>
            <span data-status="to" className="col-start-1 row-start-1 inline-flex rounded-md bg-[#e7eef6] px-1.5 py-0.5 text-[11px] font-medium text-[#253353]">
                {row.statusAlt}
            </span>
        </span>
    );
}

export function RecordScene({
    label,
    nav,
    columns,
    rows,
    search,
}: {
    label: string;
    nav?: NavItem[];
    columns: [string, string, string];
    rows: SceneRow[];
    search?: string;
}) {
    return (
        <Shell label={label} nav={nav} search={search}>
            <div className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-x-3 border-b border-[#1c1c1c]/8 pb-2 text-[11px] font-medium text-[#737373]">
                <span>{columns[0]}</span>
                <span>{columns[1]}</span>
                <span>{columns[2]}</span>
            </div>
            <ul className="divide-y divide-[#1c1c1c]/8">
                {rows.map((row) => (
                    <li
                        key={row.title}
                        data-appear={row.appear ? "" : undefined}
                        className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] items-center gap-x-3 py-2.5"
                    >
                        <span className="truncate text-[13px] font-medium">{row.title}</span>
                        <span className="truncate text-[12px] text-[#525252]">{row.meta}</span>
                        <Status row={row} />
                    </li>
                ))}
            </ul>
        </Shell>
    );
}

export function ModulePickerScene({
    label,
    onLabel,
    offLabel,
    items,
    search,
}: {
    label: string;
    onLabel: string;
    offLabel: string;
    items: Array<{ name: string; state: "on" | "off" | "turn-on" }>;
    search?: string;
}) {
    return (
        <Shell label={label} search={search}>
            <ul className="divide-y divide-[#1c1c1c]/8">
                {items.map((item) => {
                    const on = item.state === "on";
                    return (
                        <li key={item.name} className="flex items-center justify-between gap-3 py-2.5">
                            <span className="text-[13px] font-medium">{item.name}</span>
                            <span className="inline-flex items-center gap-2 text-[12px] text-[#525252]">
                                <span className="relative inline-grid">
                                    <span
                                        data-status={item.state === "turn-on" ? "from" : undefined}
                                        className="col-start-1 row-start-1"
                                    >
                                        {item.state === "on" ? onLabel : offLabel}
                                    </span>
                                    {item.state === "turn-on" ? (
                                        <span data-status="to" className="col-start-1 row-start-1">
                                            {onLabel}
                                        </span>
                                    ) : null}
                                </span>
                                <span
                                    data-switch={item.state === "on" ? "on" : item.state === "turn-on" ? "pending" : "off"}
                                    className={cx(
                                        "relative h-5 w-9 rounded-full p-0.5",
                                        on ? "bg-[#253353]" : "bg-[#e6e4e0]",
                                    )}
                                >
                                    <span className="cobreo-knob block size-4 rounded-full bg-white shadow-[0_1px_1px_rgba(23,23,23,0.16)]" />
                                </span>
                            </span>
                        </li>
                    );
                })}
            </ul>
        </Shell>
    );
}

export function CalendarScene({
    label,
    days,
    items,
    search,
}: {
    label: string;
    days: string[];
    items: Array<{ day: number; time: string; title: string; appear?: boolean }>;
    search?: string;
}) {
    return (
        <Shell label={label} search={search}>
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                {days.map((day, index) => (
                    <div key={day} className="min-w-0">
                        <p className="mb-1.5 text-[11px] font-medium text-[#737373]">{day}</p>
                        <div className="flex min-h-[148px] flex-col gap-1.5 rounded-lg border border-[#1c1c1c]/8 bg-[#fafaf8] p-1 sm:min-h-[180px] sm:p-1.5">
                            {items
                                .filter((item) => item.day === index)
                                .map((item) => (
                                    <div
                                        key={`${item.time}-${item.title}`}
                                        data-appear={item.appear ? "" : undefined}
                                        className="rounded-md border border-[#1c1c1c]/10 bg-white px-1.5 py-1"
                                    >
                                        <p className="text-[10px] text-[#737373] sm:text-[11px]">{item.time}</p>
                                        <p className="text-[11px] leading-4 font-medium text-pretty sm:text-[12px]">{item.title}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </Shell>
    );
}

export function SurveyScene({
    label,
    question,
    rows,
    search,
}: {
    label: string;
    question: string;
    rows: Array<{ name: string; text: string; appear?: boolean }>;
    search?: string;
}) {
    return (
        <Shell label={label} search={search}>
            <p className="text-[13px] font-medium text-pretty">{question}</p>
            <ul className="mt-3 divide-y divide-[#1c1c1c]/8 border-t border-[#1c1c1c]/8">
                {rows.map((row) => (
                    <li key={row.name} data-appear={row.appear ? "" : undefined} className="py-2.5">
                        <p className="text-[12px] font-medium">{row.name}</p>
                        <p className="mt-0.5 text-[13px] leading-5 text-pretty text-[#404040]">{row.text}</p>
                    </li>
                ))}
            </ul>
        </Shell>
    );
}

export function ThreadScene({
    label,
    prompt,
    reply,
    search,
}: {
    label: string;
    prompt: string;
    reply: string;
    search?: string;
}) {
    return (
        <Shell label={label} search={search}>
            <div className="flex flex-col gap-3">
                <p className="ml-auto max-w-[90%] rounded-lg border border-[#1c1c1c]/10 bg-[#f7f6f4] px-3 py-2 text-[13px] leading-5 text-pretty">
                    {prompt}
                </p>
                <p
                    data-appear=""
                    className="max-w-[92%] rounded-lg border border-[#1c1c1c]/10 px-3 py-2 text-[13px] leading-5 text-pretty"
                >
                    {reply}
                </p>
            </div>
        </Shell>
    );
}

export function EventListScene({
    label,
    rows,
    search,
}: {
    label: string;
    rows: SceneRow[];
    search?: string;
}) {
    return (
        <Shell label={label} nav={[{ label, current: true }]} search={search}>
            <ul className="divide-y divide-[#1c1c1c]/8">
                {rows.map((row) => (
                    <li
                        key={row.title}
                        data-appear={row.appear ? "" : undefined}
                        className="flex items-start justify-between gap-3 py-2.5"
                    >
                        <span className="min-w-0">
                            <span className="block truncate text-[13px] font-medium">{row.title}</span>
                            <span className="block text-[12px] text-[#525252]">{row.meta}</span>
                        </span>
                        <Status row={row} />
                    </li>
                ))}
            </ul>
        </Shell>
    );
}
