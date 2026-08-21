"use client";

import type { ReactNode } from "react";
import { cx } from "@/utils/cx";

/**
 * Untitled UI modern screen mockup chrome.
 * Matches marketing screen-mockup sections (outer/inner inset shadows + thin ring).
 */
export function ScreenMockup({
    children,
    className,
    /** Square off the bottom edge (e.g. when the mockup is vertically clipped). */
    flushBottom = false,
}: {
    children: ReactNode;
    className?: string;
    flushBottom?: boolean;
}) {
    return (
        <div
            className={cx(
                "relative rounded-[9.03px] bg-primary p-[0.9px] shadow-modern-mockup-outer-md ring-[0.56px] ring-secondary ring-inset",
                "md:rounded-[20.08px] md:p-1 md:shadow-modern-mockup-outer-lg md:ring-[1.25px]",
                flushBottom && "lg:rounded-b-none",
                className,
            )}
        >
            <div
                className={cx(
                    "rounded-[7.77px] bg-primary p-0.5 shadow-modern-mockup-inner-md md:rounded-[16.02px] md:p-[3.5px] md:shadow-modern-mockup-inner-lg",
                    flushBottom && "lg:rounded-b-none",
                )}
            >
                <div
                    className={cx(
                        "relative overflow-hidden rounded-[6.77px] bg-secondary md:rounded-[12.5px]",
                        flushBottom && "lg:rounded-b-none",
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
