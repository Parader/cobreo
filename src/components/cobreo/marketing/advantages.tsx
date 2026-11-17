"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { MarkMotif } from "@/components/cobreo/marketing/mark-motif";

export type AdvantageItem = {
    title: string;
    body: string;
};

export function Advantages({ title, items }: { title: string; items: AdvantageItem[] }) {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.25 });

    return (
        <section className="relative overflow-hidden bg-white py-20 md:py-28">
            <MarkMotif
                variant="pattern"
                opacity={0.05}
                className="inset-0"
            />
            <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
                <h2 className="max-w-[20ch] font-display text-[clamp(1.85rem,3.4vw,2.75rem)] font-normal leading-[1.08] tracking-[-0.03em] text-[#090a24]">
                    {title}
                </h2>
                <div ref={ref} className="mt-12 grid gap-4 md:mt-14 md:grid-cols-3 md:gap-5">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={reduce ? false : { opacity: 0, y: 12 }}
                            animate={inView ? { opacity: 1, y: 0 } : undefined}
                            transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                            className="rounded-2xl border border-[#4d6b97]/12 bg-white/80 px-5 py-6 shadow-[0_18px_40px_-32px_rgba(37,51,83,0.4)] md:px-6"
                        >
                            <div className="mb-4 h-1 w-10 rounded-full bg-[#4d6b97]" aria-hidden />
                            <h3 className="text-[15px] leading-snug font-semibold tracking-[-0.01em] text-[#171717]">{item.title}</h3>
                            <p className="mt-2.5 text-[14px] leading-6 text-[#5c6168]">{item.body}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
