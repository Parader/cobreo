"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { cx } from "@/utils/cx";

export type BentoItem = {
    id: string;
    name: string;
    summary: string;
    lead?: boolean;
};

const wash = ["bg-[#f7f9fb]", "bg-white", "bg-[#f4f7fb]", "bg-white"];

function ModuleCard({
    item,
    index,
    lead,
}: {
    item: BentoItem;
    index: number;
    lead?: boolean;
}) {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.25 });

    return (
        <motion.article
            ref={ref}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, delay: reduce ? 0 : Math.min(index * 0.05, 0.25), ease: [0.16, 1, 0.3, 1] }}
            className={cx(
                "rounded-2xl border border-[#1c1c1c]/8",
                lead ? cx("p-6 md:p-7", wash[index % wash.length]) : "bg-white p-5 md:p-6",
            )}
        >
            {lead ? (
                <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d6b97] uppercase">
                    {String(index + 1).padStart(2, "0")}
                </p>
            ) : null}
            <h3
                className={cx(
                    "font-medium tracking-[-0.03em] text-[#121212]",
                    lead ? "mt-3 font-display text-[1.55rem] leading-[1.1] md:text-[1.7rem]" : "text-[15px] leading-snug",
                )}
            >
                {item.name}
            </h3>
            <p
                className={cx(
                    "mt-3 text-[#525252]",
                    lead ? "max-w-[40rem] text-[15px] leading-7 md:text-[16px] md:leading-7" : "text-[14px] leading-6",
                )}
            >
                {item.summary}
            </p>
        </motion.article>
    );
}

export function ModuleBento({ items, linkLabel, linkHref }: { items: BentoItem[]; linkLabel?: string; linkHref?: string }) {
    const lead = items.filter((item) => item.lead);
    const rest = items.filter((item) => !item.lead);

    return (
        <div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
                {lead.map((item, index) => (
                    <ModuleCard key={item.id} item={item} index={index} lead />
                ))}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
                {rest.map((item, index) => (
                    <ModuleCard key={item.id} item={item} index={index + lead.length} />
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
