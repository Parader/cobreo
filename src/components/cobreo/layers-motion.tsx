"use client";

import { type ElementType, type ReactNode, useEffect, useRef, useState } from "react";
import {
    motion,
    useInView,
    useMotionValue,
    useScroll,
    useSpring,
    useTransform,
} from "motion/react";
import { easeLuxury, easeSoft } from "@/components/cobreo/motion";
import { usePreferSimpleMotion } from "@/hooks/use-prefer-simple-motion";
import { cx } from "@/utils/cx";

/** Cinematic clip reveal — rises through a mask (reliable useInView on outer box) */
export function ClipReveal({
    children,
    className,
    delay = 0,
    as: Tag = "div",
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    as?: ElementType;
}) {
    const reduce = usePreferSimpleMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.2, margin: "0px" });
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        if (inView) setRevealed(true);
    }, [inView]);

    // Backstop for a missed observer: reveal on scroll from the element's own position.
    useEffect(() => {
        if (revealed) return;
        const check = () => {
            const el = ref.current;
            if (!el) return;
            if (el.getBoundingClientRect().top < window.innerHeight * 0.92) setRevealed(true);
        };
        check();
        window.addEventListener("scroll", check, { passive: true });
        window.addEventListener("resize", check);
        return () => {
            window.removeEventListener("scroll", check);
            window.removeEventListener("resize", check);
        };
    }, [revealed]);

    // Simple mode swaps the clip rise for a crossfade — no movement, still an entrance.
    // Both modes must render the same tree and declare `y`: switching between two
    // different trees left the inner node holding a stale translateY(110%) while the
    // wrapper lost its clipping, which dropped the copy on top of the next element.
    const hidden = reduce ? { y: 0, opacity: 0 } : { y: "110%", opacity: 0 };

    return (
        <div ref={ref} className="overflow-hidden">
            <motion.div
                initial={hidden}
                animate={revealed ? { y: 0, opacity: 1 } : hidden}
                transition={
                    reduce
                        ? { duration: 0.45, delay, ease: easeSoft }
                        : { duration: 1.15, delay, ease: easeLuxury }
                }
            >
                <Tag className={className}>{children}</Tag>
            </motion.div>
        </div>
    );
}

/** Hero-only: animate on mount */
export function ClipRevealHero({
    children,
    className,
    delay = 0,
    as: Tag = "div",
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    as?: ElementType;
}) {
    const reduce = usePreferSimpleMotion();

    // Same tree in both modes, and `y` declared either way — see ClipReveal.
    return (
        <div className="overflow-hidden">
            <motion.div
                initial={{ y: reduce ? 0 : 64, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={
                    reduce
                        ? { duration: 0.45, delay, ease: easeSoft }
                        : { duration: 1.25, delay, ease: easeLuxury }
                }
            >
                <Tag className={className}>{children}</Tag>
            </motion.div>
        </div>
    );
}

/** Scroll parallax depth layer */
export function Parallax({
    children,
    className,
    speed = 0.2,
    fade = false,
}: {
    children: ReactNode;
    className?: string;
    speed?: number;
    fade?: boolean;
}) {
    const reduce = usePreferSimpleMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    const y = useTransform(scrollYProgress, [0, 1], [speed * 90, speed * -90]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], fade ? [0.45, 1, 1, 0.45] : [1, 1, 1, 1]);
    const smoothY = useSpring(y, { stiffness: 70, damping: 26, mass: 0.55 });

    if (reduce) {
        return (
            <div ref={ref} className={className}>
                {children}
            </div>
        );
    }

    return (
        <motion.div ref={ref} className={className} style={{ y: smoothY, opacity }}>
            {children}
        </motion.div>
    );
}

/** Soft mouse parallax — listens on parent so it never blocks clicks */
export function MouseParallax({
    children,
    className,
    strength = 22,
}: {
    children: ReactNode;
    className?: string;
    strength?: number;
}) {
    const reduce = usePreferSimpleMotion();
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, { stiffness: 55, damping: 22 });
    const springY = useSpring(y, { stiffness: 55, damping: 22 });

    useEffect(() => {
        if (reduce) return;
        const parent = ref.current?.parentElement;
        if (!parent) return;

        const onMove = (e: MouseEvent) => {
            const rect = parent.getBoundingClientRect();
            const px = (e.clientX - rect.left) / rect.width - 0.5;
            const py = (e.clientY - rect.top) / rect.height - 0.5;
            x.set(px * strength);
            y.set(py * strength);
        };
        const onLeave = () => {
            x.set(0);
            y.set(0);
        };

        parent.addEventListener("mousemove", onMove);
        parent.addEventListener("mouseleave", onLeave);
        return () => {
            parent.removeEventListener("mousemove", onMove);
            parent.removeEventListener("mouseleave", onLeave);
        };
    }, [reduce, strength, x, y]);

    if (reduce) {
        return (
            <div ref={ref} className={className}>
                {children}
            </div>
        );
    }

    return (
        <motion.div ref={ref} className={cx("pointer-events-none", className)} style={{ x: springX, y: springY }}>
            {children}
        </motion.div>
    );
}

/** Soft ambient gradient wash — stays behind content (static CSS; avoid WAAPI keyframes on Safari) */
export function AtmosphereWash({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cx(
                "pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_20%_10%,rgba(77,107,151,0.08),transparent_55%),radial-gradient(ellipse_at_85%_35%,rgba(177,182,166,0.1),transparent_50%)] opacity-90",
                className,
            )}
        />
    );
}

/** Mockup tracks scroll for cinematic depth */
export function ScrollLinkedMockup({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    const reduce = usePreferSimpleMotion();
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
    });
    // Keep only a light translate — scale/rotate blur vector UI (text + charts).
    const y = useTransform(scrollYProgress, [0, 1], [28, -28]);

    if (reduce) {
        return (
            <div ref={ref} className={className}>
                {children}
            </div>
        );
    }

    return (
        <motion.div ref={ref} className={className} style={{ y }}>
            {children}
        </motion.div>
    );
}

/** Section push-in — keep mild so nested text reveals stay readable */
export function CinematicEnter({ children, className }: { children: ReactNode; className?: string }) {
    const reduce = usePreferSimpleMotion();
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.2 });

    if (reduce) {
        return <div className={className}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 28 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ duration: 1.1, ease: easeLuxury }}
        >
            {children}
        </motion.div>
    );
}
