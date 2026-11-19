"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

/** Visible immediately, then settles. Keeps the headline paintable for LCP. */
export function Rise({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            initial={reduce ? false : { y: 14 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
