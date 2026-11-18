"use client";

import { useId } from "react";
import { useReducedMotion } from "motion/react";
import { cx } from "@/utils/cx";

/** The Cobreo mark outline (same path as /images/mark-outline.svg). */
const MARK_PATH =
    "M317.061 339.131L297.301 366.957L296.801 367.665L296.259 368.321C292.977 372.305 289.477 376.112 285.79 379.718C282.175 383.252 278.376 386.599 274.404 389.739C269.123 393.913 263.534 397.724 257.684 401.136C253.305 403.689 248.782 406.026 244.121 408.115C226.198 416.147 206.341 420.595 185.513 420.595C106.301 420.594 42.0879 356.382 42.0879 277.17C42.089 197.959 106.302 133.746 185.513 133.745C198.801 133.745 211.707 135.557 223.974 138.964C229.726 140.562 235.341 142.516 240.777 144.787C246.259 147.078 251.566 149.697 256.673 152.621C261.133 155.173 265.441 157.956 269.58 160.955C274.349 164.409 278.897 168.153 283.196 172.153C292.899 181.182 293.452 196.368 284.425 206.072C275.395 215.776 260.2 216.321 250.496 207.291C247.629 204.624 244.598 202.133 241.423 199.832C238.664 197.834 235.795 195.977 232.828 194.28C229.431 192.336 225.903 190.591 222.265 189.071C218.66 187.565 214.942 186.276 211.129 185.217C203.006 182.96 194.419 181.748 185.513 181.748C132.813 181.749 90.0918 224.47 90.0907 277.17C90.0907 329.871 132.813 372.591 185.513 372.592C199.442 372.592 212.616 369.628 224.484 364.311C227.578 362.924 230.593 361.373 233.505 359.675C237.396 357.406 241.111 354.863 244.631 352.081C247.278 349.988 249.815 347.76 252.225 345.403C254.541 343.139 256.723 340.734 258.799 338.247L320.685 251.118C340.19 216.588 377.233 193.276 419.719 193.276C482.493 193.277 533.382 244.166 533.382 306.939C533.382 369.712 482.492 420.602 419.719 420.602C392.556 420.602 367.56 411.037 348.007 395.122C337.728 386.753 336.181 371.639 344.548 361.359C352.917 351.081 368.031 349.534 378.311 357.901C389.615 367.101 403.994 372.599 419.719 372.599C455.981 372.599 485.379 343.201 485.379 306.939C485.379 270.677 455.981 241.28 419.719 241.279C400.684 241.279 383.54 249.38 371.547 262.322C350.67 284.852 334.837 314.098 317.061 339.131Z";

/**
 * Hero symbol, drawn as a hairline engraving: a whisper of satin fill, a fine steel
 * stroke, and a slow white glint that travels along the edge like light on brushed metal.
 * Strokes stay 1px at any size. Motion stops for reduced-motion users.
 */
export function HeroMark({
    className,
    edgeColor = "#4d6b97",
    edgeOpacity = 0.22,
    halo = true,
}: {
    className?: string;
    /** Stroke colour/opacity; raise them when the mark crosses a dark surface. */
    edgeColor?: string;
    edgeOpacity?: number;
    /** White breathing halo; turn off where the mark crosses a dark surface (it would read as a spotlight). */
    halo?: boolean;
}) {
    const reduce = useReducedMotion();
    const id = useId().replace(/:/g, "");

    return (
        <div aria-hidden className={cx("pointer-events-none absolute", className)}>
            {/* Soft halo, very low and slow */}
            <div className={halo ? "contents" : "hidden"}>
            <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(ellipse_at_35%_45%,rgba(255,255,255,0.9),rgba(255,255,255,0.45)_40%,rgba(177,182,166,0.08)_60%,transparent_75%)] blur-2xl motion-safe:animate-[cobreo-glow_14s_ease-in-out_infinite]" />
            </div>
            <svg viewBox="41 132 494 290" className="relative h-full w-full overflow-visible" fill="none">
                <defs>
                    <linearGradient id={`${id}-satin`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#4d6b97" stopOpacity="0.07" />
                        <stop offset="55%" stopColor="#4d6b97" stopOpacity="0.03" />
                        <stop offset="100%" stopColor="#b1b6a6" stopOpacity="0.06" />
                    </linearGradient>
                    <linearGradient id={`${id}-glint`} x1="0" y1="0" x2="1" y2="0.35">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                        <stop offset="40%" stopColor="#ffffff" stopOpacity="0" />
                        <stop offset="46%" stopColor="#c9d3e2" stopOpacity="0.35" />
                        <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="55%" stopColor="#ffffff" stopOpacity="0.85" />
                        <stop offset="60%" stopColor="#c9d3e2" stopOpacity="0.3" />
                        <stop offset="66%" stopColor="#ffffff" stopOpacity="0" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        {reduce ? null : (
                            <animateTransform
                                attributeName="gradientTransform"
                                type="translate"
                                values="-1 0; 1 0; -1 0"
                                dur="26s"
                                repeatCount="indefinite"
                                calcMode="spline"
                                keyTimes="0; 0.5; 1"
                                keySplines="0.45 0 0.55 1; 0.45 0 0.55 1"
                            />
                        )}
                    </linearGradient>
                </defs>
                {/* Satin body */}
                <path d={MARK_PATH} fill={`url(#${id}-satin)`} />
                {/* Engraved edge */}
                <path d={MARK_PATH} stroke={edgeColor} strokeOpacity={edgeOpacity} strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                {/* Travelling glint */}
                <path d={MARK_PATH} stroke={`url(#${id}-glint)`} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
            </svg>
        </div>
    );
}
