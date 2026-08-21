"use client";

import { cx } from "@/utils/cx";

export function ChoiceButton({
    selected,
    onClick,
    children,
    multi,
}: {
    selected: boolean;
    onClick: () => void;
    children: React.ReactNode;
    multi?: boolean;
}) {
    return (
        <button
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={selected}
            onClick={onClick}
            className={cx(
                "flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-base transition duration-100 ease-linear",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                selected
                    ? "border-[#4d6b97] bg-[#4d6b97]/10 text-[#171717]"
                    : "border-[#171717]/12 bg-white/70 text-[#404040] hover:border-[#171717]/25 hover:bg-white",
            )}
        >
            {multi ? (
                <span
                    aria-hidden
                    className={cx(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border-2 transition duration-100",
                        selected
                            ? "border-[#4d6b97] bg-[#4d6b97] text-white"
                            : "border-[#171717]/25 bg-white",
                    )}
                >
                    {selected ? (
                        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3.5 8.5 6.5 11.5 12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : null}
                </span>
            ) : null}
            <span className="min-w-0 flex-1">{children}</span>
        </button>
    );
}

export function ScreenHeader({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
    return (
        <header className="flex flex-col gap-3" data-ph-mask>
            {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#4d6b97]">{eyebrow}</p>
            ) : null}
            <h1 className="font-display text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-[#171717] md:text-[36px]">
                {title}
            </h1>
            {body ? <p className="max-w-xl text-base leading-relaxed text-[#525252] md:text-lg">{body}</p> : null}
        </header>
    );
}
