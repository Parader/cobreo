"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import type { StageCopy } from "@/components/cobreo/marketing/stage-copy";

export function ContrastBand({
    eyebrow,
    title,
    body,
    copy,
}: {
    eyebrow: string;
    title: string;
    body: string;
    copy: StageCopy;
}) {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.35 });

    return (
        <section ref={ref} className="relative overflow-hidden bg-[#12141a] text-[#f4f2ee]">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(77,107,151,0.45),transparent_55%),radial-gradient(ellipse_at_90%_80%,rgba(177,182,166,0.16),transparent_50%)]"
            />
            <div className="relative mx-auto grid max-w-[1100px] items-center gap-12 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div>
                    <p className="text-[11px] font-medium tracking-[0.16em] text-[#a6b5cb] uppercase">{eyebrow}</p>
                    <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance">
                        {title}
                    </h2>
                    <p className="mt-4 max-w-md text-lg leading-relaxed text-[#c8c8c8]">{body}</p>
                    <div className="mt-6 flex gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[12px]">{copy.private}</span>
                        <span className="rounded-full bg-[#4d6b97] px-3 py-1 text-[12px] text-white">{copy.published}</span>
                    </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md sm:p-5">
                    <p className="ml-auto max-w-[90%] rounded-2xl bg-white/10 px-4 py-3 text-[14px] leading-6 text-pretty">{copy.prompt}</p>
                    <motion.p
                        initial={reduce ? false : { opacity: 0, y: 8 }}
                        animate={inView ? { opacity: 1, y: 0 } : undefined}
                        transition={{ delay: 0.35, duration: 0.45 }}
                        className="mt-3 max-w-[92%] rounded-2xl bg-white px-4 py-3 text-[14px] leading-6 text-pretty text-[#171717]"
                    >
                        {copy.reply}
                    </motion.p>
                </div>
            </div>
        </section>
    );
}
