"use client";

import { motion } from "motion/react";
import { usePreferSimpleMotion } from "@/hooks/use-prefer-simple-motion";
import { cx } from "@/utils/cx";

type Variant = "corner-tr" | "corner-bl" | "edge-right" | "flow" | "bottom-right" | "bottom-left";

type Props = {
    variant?: Variant;
    className?: string;
};

/** Soft elliptical halo — opaque core near the edge, long falloff into the page. */
const haloMasks: Record<Variant, string> = {
    "corner-tr":
        "radial-gradient(ellipse 70% 62% at 100% 22%, #000 0%, #000 12%, rgba(0,0,0,0.62) 32%, rgba(0,0,0,0.22) 52%, transparent 72%)",
    "corner-bl":
        "radial-gradient(ellipse 70% 62% at 0% 78%, #000 0%, #000 12%, rgba(0,0,0,0.62) 32%, rgba(0,0,0,0.22) 52%, transparent 72%)",
    "edge-right":
        "radial-gradient(ellipse 64% 74% at 100% 50%, #000 0%, #000 10%, rgba(0,0,0,0.58) 30%, rgba(0,0,0,0.2) 50%, transparent 70%)",
    flow: "radial-gradient(ellipse 68% 70% at 100% 48%, #000 0%, #000 11%, rgba(0,0,0,0.6) 34%, rgba(0,0,0,0.2) 54%, transparent 74%)",
    "bottom-right":
        "radial-gradient(ellipse 78% 70% at 96% 100%, #000 0%, #000 14%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.18) 58%, transparent 76%)",
    "bottom-left":
        "radial-gradient(ellipse 78% 70% at 4% 100%, #000 0%, #000 14%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.18) 58%, transparent 76%)",
};

const placements: Record<Variant, { shell: string; grid: string }> = {
    "corner-tr": {
        shell: "inset-y-0 right-0 w-[min(48%,360px)] sm:w-[min(42%,420px)] md:w-[min(46%,520px)] lg:w-[min(55%,720px)] xl:w-[min(62%,860px)]",
        grid: "top-0 right-0",
    },
    "corner-bl": {
        shell: "inset-y-0 left-0 w-[min(48%,360px)] sm:w-[min(42%,420px)] md:w-[min(46%,520px)] lg:w-[min(55%,720px)] xl:w-[min(62%,860px)]",
        grid: "top-0 left-0",
    },
    "edge-right": {
        shell: "inset-y-0 right-0 w-[min(40%,300px)] sm:w-[min(38%,360px)] md:w-[min(42%,440px)] lg:w-[min(48%,560px)] xl:w-[min(55%,680px)]",
        grid: "top-0 right-0",
    },
    flow: {
        shell: "inset-y-0 right-0 w-[min(44%,340px)] sm:w-[min(40%,400px)] md:w-[min(44%,480px)] lg:w-[min(50%,640px)] xl:w-[min(56%,780px)]",
        grid: "top-0 right-0",
    },
    "bottom-right": {
        shell: "bottom-0 right-0 h-[min(100%,280px)] w-[min(55%,360px)] sm:h-[min(100%,320px)] sm:w-[min(50%,420px)] md:h-[min(100%,380px)] md:w-[min(55%,560px)] lg:h-[min(100%,420px)] lg:w-[min(60%,720px)]",
        grid: "bottom-0 right-0",
    },
    "bottom-left": {
        shell: "bottom-0 left-0 h-[min(100%,280px)] w-[min(55%,360px)] sm:h-[min(100%,320px)] sm:w-[min(50%,420px)] md:h-[min(100%,380px)] md:w-[min(55%,560px)] lg:h-[min(100%,420px)] lg:w-[min(60%,720px)]",
        grid: "bottom-0 left-0",
    },
};

/** Fixed tile metrics — same look everywhere; grid is tall enough to cover full height. */
const COLS = 12;
const ROWS = 32;
const CELL_W = 48;
const CELL_H = 28;
const GAP_X = 14;
const GAP_Y = 18;

function LogoCell() {
    return (
        <div
            className={cx(
                "h-full w-full bg-white opacity-[0.12]",
                "[mask-image:url('/images/logo-mark.svg')]",
                "[mask-size:contain]",
                "[mask-repeat:no-repeat]",
                "[mask-position:center]",
                "[-webkit-mask-image:url('/images/logo-mark.svg')]",
                "[-webkit-mask-size:contain]",
                "[-webkit-mask-repeat:no-repeat]",
                "[-webkit-mask-position:center]",
            )}
        />
    );
}

/**
 * Cobreo C-mark mosaic with fixed cell size and a soft halo fade.
 */
export function DarkLogoMosaic({ variant = "corner-tr", className }: Props) {
    const reduce = usePreferSimpleMotion();
    const count = COLS * ROWS;
    const { shell, grid } = placements[variant];
    const halo = haloMasks[variant];

    return (
        <motion.div
            aria-hidden
            className={cx(
                "pointer-events-none absolute z-0 overflow-hidden",
                shell,
                className,
            )}
            style={{
                maskImage: halo,
                WebkitMaskImage: halo,
                maskRepeat: "no-repeat",
                WebkitMaskRepeat: "no-repeat",
                maskSize: "100% 100%",
                WebkitMaskSize: "100% 100%",
            }}
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
            <div
                className={cx("absolute", grid)}
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${COLS}, ${CELL_W}px)`,
                    gridTemplateRows: `repeat(${ROWS}, ${CELL_H}px)`,
                    columnGap: GAP_X,
                    rowGap: GAP_Y,
                }}
            >
                {Array.from({ length: count }, (_, i) => (
                    <LogoCell key={i} />
                ))}
            </div>
        </motion.div>
    );
}
