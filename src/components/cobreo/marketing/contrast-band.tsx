"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Plus } from "@untitledui/icons";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { MarkMotif } from "@/components/cobreo/marketing/mark-motif";
import { moduleIcon } from "@/components/cobreo/marketing/module-bento";

/**
 * Custom-module band. The visual is the platform itself: the existing modules as
 * quiet tiles, and one dashed tile where a custom module slots in.
 */
export function ContrastBand({
    title,
    body,
    body2,
    cta,
    modules,
    customLabel,
}: {
    title: string;
    body: string;
    body2: string;
    cta: { label: string; href: string };
    modules: { id: string; name: string }[];
    customLabel: string;
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
            <MarkMotif
                variant="contour"
                opacity={0.1}
                className="-right-[12%] bottom-[-18%] h-[340px] w-[560px] md:h-[460px] md:w-[760px]"
            />
            <div className="relative z-10 mx-auto grid max-w-[1200px] items-center gap-14 px-4 py-24 md:px-8 md:py-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-20">
                <div>
                    <h2 className="max-w-[16ch] font-display text-[clamp(2.1rem,4.2vw,3.35rem)] leading-[1.05] font-normal tracking-[-0.03em] text-balance">
                        {title}
                    </h2>
                    <p className="mt-6 max-w-[34rem] text-[17px] leading-8 text-pretty text-[#c8c8c8] md:text-[18px]">{body}</p>
                    <p className="mt-4 max-w-[34rem] text-[16px] leading-7 text-pretty text-[#a8a8a8]">{body2}</p>
                    <div className="mt-10">
                        <CobreoButton
                            href={cta.href}
                            variant="inverse"
                            size="xl"
                            analytics={{ ctaId: "custom_module_contact", destination: "contact", surface: "home_custom" }}
                        >
                            {cta.label}
                        </CobreoButton>
                    </div>
                </div>

                <div aria-hidden className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {modules.map((module) => {
                        const Icon = moduleIcon(module.id);
                        return (
                            <div
                                key={module.id}
                                className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-3"
                            >
                                <Icon className="size-4 shrink-0 text-[#a6b5cb]" />
                                <span className="min-w-0 text-[14px] leading-snug text-balance text-[#c8c8c8]">{module.name}</span>
                            </div>
                        );
                    })}
                    <motion.div
                        initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                        animate={inView ? { opacity: 1, scale: 1 } : undefined}
                        transition={{ delay: reduce ? 0 : 0.35, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                        className="col-span-2 flex items-center justify-center gap-2.5 rounded-xl border border-dashed border-[#a6b5cb]/60 bg-[#4d6b97]/20 px-4 py-4 sm:col-span-3"
                    >
                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-white text-[#253353]">
                            <Plus className="size-3.5" />
                        </span>
                        <span className="text-[15px] font-semibold text-white">{customLabel}</span>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
