"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";

export type BentoItem = {
    id: string;
    name: string;
    tagline: string;
    points: string[];
    lead?: boolean;
};

function ModuleCard({
    item,
    index,
}: {
    item: BentoItem;
    index: number;
}) {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <motion.article
            ref={ref}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.4, delay: reduce ? 0 : Math.min(index * 0.04, 0.24), ease: [0.16, 1, 0.3, 1] }}
            className="flex h-full flex-col rounded-2xl border border-[#1c1c1c]/8 bg-white p-5"
        >
            <h3 className="text-[15px] font-semibold tracking-[-0.02em] text-[#121212]">{item.name}</h3>
            <p className="mt-1.5 text-[13px] leading-5 text-[#5c6168]">{item.tagline}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
                {item.points.map((point) => (
                    <li
                        key={point}
                        className="rounded-md border border-[#1c1c1c]/8 bg-[#f4f7fb] px-2 py-1 text-[12px] leading-4 font-medium text-[#253353]"
                    >
                        {point}
                    </li>
                ))}
            </ul>
        </motion.article>
    );
}

export function ModuleBento({ items, linkLabel, linkHref }: { items: BentoItem[]; linkLabel?: string; linkHref?: string }) {
    return (
        <div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
                {items.map((item, index) => (
                    <ModuleCard key={item.id} item={item} index={index} />
                ))}
            </div>
            {linkHref && linkLabel ? (
                <Link href={linkHref} className="mt-6 inline-flex text-sm font-semibold text-[#253353]">
                    {linkLabel}
                </Link>
            ) : null}
        </div>
    );
}
