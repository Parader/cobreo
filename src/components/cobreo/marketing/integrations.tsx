"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export type IntegrationItem = {
    id: string;
    name: string;
    body: string;
};

const logos: Record<string, { src: string; width: number; height: number }> = {
    google: { src: "/images/integrations/google.svg", width: 22, height: 22 },
    microsoft: { src: "/images/integrations/microsoft.svg", width: 20, height: 20 },
    stripe: { src: "/images/integrations/stripe.svg", width: 22, height: 22 },
};

export function Integrations({
    title,
    lede,
    items,
}: {
    title: string;
    lede: string;
    items: IntegrationItem[];
}) {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <section className="relative overflow-hidden bg-[#4d6b97] py-14 text-[#f4f6f8] md:py-16">
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_100%_0%,rgba(177,182,166,0.28),transparent_55%)]"
            />
            <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14">
                    <div>
                        <h2 className="font-display text-[clamp(1.45rem,2.6vw,2rem)] font-normal tracking-[-0.03em] text-white">
                            {title}
                        </h2>
                        <p className="mt-3 max-w-md text-[15px] leading-7 text-[#d5e0ee] md:text-[16px]">{lede}</p>
                    </div>
                    <div ref={ref} className="grid gap-3 sm:grid-cols-3">
                        {items.map((item, index) => {
                            const logo = logos[item.id];
                            return (
                                <motion.article
                                    key={item.id}
                                    initial={reduce ? false : { opacity: 0, y: 10 }}
                                    animate={inView ? { opacity: 1, y: 0 } : undefined}
                                    transition={{
                                        duration: 0.4,
                                        delay: reduce ? 0 : index * 0.06,
                                        ease: [0.16, 1, 0.3, 1],
                                    }}
                                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-4 backdrop-blur-sm"
                                >
                                    <div className="flex items-center gap-2.5">
                                        {logo ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={logo.src}
                                                alt=""
                                                width={logo.width}
                                                height={logo.height}
                                                className="size-5 object-contain"
                                            />
                                        ) : null}
                                        <h3 className="text-[16px] font-semibold text-white">{item.name}</h3>
                                    </div>
                                    <p className="mt-2 text-[15px] leading-6 text-[#d5e0ee]">{item.body}</p>
                                </motion.article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
