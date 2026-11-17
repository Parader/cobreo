"use client";

import { useRef, type FC } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
    Calendar,
    CheckDone01,
    CreditCard01,
    Download01,
    Stars01,
} from "@untitledui/icons";
import { cx } from "@/utils/cx";

export type PlatformFeatureItem = {
    id: string;
    name: string;
    body: string;
};

const icons: Record<string, FC<{ className?: string }>> = {
    tasks: CheckDone01,
    payments: CreditCard01,
    calendar: Calendar,
    importExport: Download01,
    ai: Stars01,
};

export function PlatformFeatures({
    title,
    lede,
    items,
}: {
    title: string;
    lede: string;
    items: PlatformFeatureItem[];
}) {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <section className="relative overflow-hidden bg-[#eef3f9] py-16 md:py-20">
            <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
                <div className="max-w-2xl">
                    <h2 className="font-display text-[clamp(1.45rem,2.6vw,2rem)] font-normal tracking-[-0.03em] text-[#090a24]">
                        {title}
                    </h2>
                    <p className="mt-3 text-[15px] leading-7 text-[#525252] md:text-[16px]">{lede}</p>
                </div>
                <div ref={ref} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-3">
                    {items.map((item, index) => {
                        const Icon = icons[item.id] ?? CheckDone01;
                        return (
                            <motion.article
                                key={item.id}
                                initial={reduce ? false : { opacity: 0, y: 10 }}
                                animate={inView ? { opacity: 1, y: 0 } : undefined}
                                transition={{ duration: 0.4, delay: reduce ? 0 : index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                                className={cx(
                                    "rounded-xl border border-[#4d6b97]/12 bg-white px-4 py-4",
                                    "shadow-[0_12px_30px_-24px_rgba(37,51,83,0.35)]",
                                )}
                            >
                                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-[#4d6b97]/10 text-[#4d6b97]">
                                    <Icon className="size-4" aria-hidden />
                                </span>
                                <h3 className="mt-3 text-[14px] font-semibold tracking-[-0.01em] text-[#171717]">{item.name}</h3>
                                <p className="mt-1.5 text-[13px] leading-5 text-[#5c6168]">{item.body}</p>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
