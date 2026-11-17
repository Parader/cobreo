"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export type AdvantageItem = {
    title: string;
    body: string;
};

export function Advantages({ title, items }: { title: string; items: AdvantageItem[] }) {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.25 });

    return (
        <section className="mx-auto max-w-[1200px] px-4 py-24 md:px-8 md:py-28">
            <h2 className="max-w-[20ch] font-display text-[clamp(1.85rem,3.4vw,2.75rem)] leading-[1.08] font-medium tracking-[-0.03em] text-[#121212]">
                {title}
            </h2>
            <div ref={ref} className="mt-12 grid gap-10 border-t border-[#1c1c1c]/10 pt-10 md:mt-14 md:grid-cols-3 md:gap-8 md:pt-12">
                {items.map((item, index) => (
                    <motion.div
                        key={item.title}
                        initial={reduce ? false : { opacity: 0, y: 12 }}
                        animate={inView ? { opacity: 1, y: 0 } : undefined}
                        transition={{ duration: 0.45, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        className="md:border-l md:border-[#1c1c1c]/10 md:pl-8 md:first:border-l-0 md:first:pl-0"
                    >
                        <h3 className="text-[15px] leading-snug font-semibold tracking-[-0.01em] text-[#171717]">{item.title}</h3>
                        <p className="mt-2.5 text-[14px] leading-6 text-[#5c6168]">{item.body}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
