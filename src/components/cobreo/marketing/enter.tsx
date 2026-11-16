"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * One enter fade: 12px, 400ms, once.
 * Content stays visible when the visitor prefers reduced motion, and before
 * paint the matching CSS rule does the same.
 */
export function Enter({ children, className }: { children: ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setShown(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry?.isIntersecting) return;
                setShown(true);
                observer.disconnect();
            },
            { threshold: 0.18, rootMargin: "0px" },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} data-enter="" data-in={shown ? "true" : "false"} className={className}>
            {children}
        </div>
    );
}
