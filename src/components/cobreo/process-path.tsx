"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { usePreferSimpleMotion } from "@/hooks/use-prefer-simple-motion";

/** One-shot reveal when the ribbon enters the viewport */
const TRACE_DURATION = 1.45;

/**
 * Original Figma ribbon — revealed top→bottom once in view.
 */
export function ProcessPath({ className }: { className?: string }) {
    const reduce = usePreferSimpleMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.15, margin: "0px" });

    if (reduce) {
        return (
            <div className={className} aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/process-path.svg" alt="" className="h-full w-full object-contain object-top" />
            </div>
        );
    }

    return (
        <div ref={ref} className={className} aria-hidden>
            <motion.div
                className="h-full w-full origin-top"
                initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0.4 }}
                animate={
                    inView
                        ? { clipPath: "inset(0 0 0% 0)", opacity: 1 }
                        : { clipPath: "inset(0 0 100% 0)", opacity: 0.4 }
                }
                transition={{ duration: TRACE_DURATION, ease: [0.22, 1, 0.36, 1], delay: 0.04 }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/process-path.svg" alt="" className="h-full w-full object-contain object-top" />
            </motion.div>
        </div>
    );
}

/** Stagger delays so process cards arrive as the line reaches them */
export const PROCESS_STEP_DELAYS = [0.12, 0.35, 0.58, 0.82] as const;
