"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { cx } from "@/utils/cx";

/** Shared interior-page atmosphere — canvas wash + brand/sage light. */
export function MarketingAtmosphere({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cx(
                "pointer-events-none absolute inset-x-0 top-0 h-[min(72vh,720px)]",
                "bg-[radial-gradient(ellipse_78%_58%_at_10%_-8%,_rgba(77,107,151,0.16),_transparent_58%),radial-gradient(ellipse_64%_46%_at_96%_4%,_rgba(177,182,166,0.34),_transparent_54%)]",
                className,
            )}
        />
    );
}

/** Soft logo watermarks — prefer left on interior pages to keep heroes clear. */
export function MarketingLogoMarks({ side = "left" }: { side?: "both" | "left" | "right" }) {
    const showRight = side === "both" || side === "right";
    const showLeft = side === "both" || side === "left";

    return (
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
            {showRight ? (
                <div
                    className={cx(
                        "cobreo-logo-mark cobreo-logo-mark--1 cobreo-logo-mark-opacity absolute top-[min(46vh,480px)]",
                        "right-[-52%] h-[360px] w-[620px]",
                        "md:right-[-32%] md:h-[440px] md:w-[760px]",
                        "lg:right-[-18%] lg:h-[500px] lg:w-[860px]",
                        "xl:right-[-8%] xl:h-[520px] xl:w-[900px]",
                    )}
                />
            ) : null}
            {showLeft ? (
                <div
                    className={cx(
                        "cobreo-logo-mark cobreo-logo-mark--2 cobreo-logo-mark-opacity absolute top-[58%]",
                        "left-[-56%] h-[320px] w-[560px]",
                        "md:left-[-34%] md:h-[400px] md:w-[700px]",
                        "lg:left-[-18%] lg:h-[440px] lg:w-[760px]",
                        "xl:left-[-8%] xl:h-[460px] xl:w-[780px]",
                    )}
                />
            ) : null}
        </div>
    );
}

export function MarketingEyebrow({
    children,
    tone = "brand",
}: {
    children: ReactNode;
    tone?: "brand" | "onDark";
}) {
    return (
        <p
            className={cx(
                "text-sm font-semibold tracking-[0.1em] uppercase",
                tone === "brand" ? "text-[#4d6b97]" : "text-[#a6b5cb]",
            )}
        >
            {children}
        </p>
    );
}

/** Sage CTA band — quieter decoration, same brand surface as home. */
export function MarketingCtaBand({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={cx(
                "relative overflow-hidden rounded-2xl bg-[#b1b6a6] px-8 py-12 md:px-14 md:py-16",
                className,
            )}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute -right-6 top-1/2 hidden h-[180px] w-[150px] -translate-y-1/2 opacity-30 md:block"
            >
                <div className="relative h-full w-full">
                    <Image
                        src="/images/diagnostic-watermark.svg"
                        alt=""
                        fill
                        className="object-contain"
                    />
                </div>
            </div>
            <div className="relative z-10">{children}</div>
        </div>
    );
}
