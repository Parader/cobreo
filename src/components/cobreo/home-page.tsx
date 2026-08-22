"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { usePreferSimpleMotion } from "@/hooks/use-prefer-simple-motion";
import { ArrowNarrowRight, ChevronDown, ChevronLeft, ChevronRight, MessageChatSquare } from "@untitledui/icons";
import { Link } from "@/i18n/navigation";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { DiagnosticEntryButton } from "@/components/cobreo/diagnostic/diagnostic-entry-button";
import { Avatar } from "@/components/base/avatar/avatar";
import { RatingStars } from "@/components/foundations/rating-stars";
import { DarkLogoMosaic } from "@/components/cobreo/dark-logo-mosaic";
import {
    childReveal,
    easeLuxury,
    mediaReveal,
    staggerContainer,
    viewportOnce,
} from "@/components/cobreo/motion";
import { LAYERS_MOTION_EXPERIMENT } from "@/components/cobreo/motion-flags";
import {
    AtmosphereWash,
    ClipReveal,
    ClipRevealHero,
} from "@/components/cobreo/layers-motion";
import { ProcessIllustration } from "@/components/cobreo/process-illustration";
import { PROCESS_STEP_DELAYS, ProcessPath } from "@/components/cobreo/process-path";
import { ValueProductMockup, ValueProductMockupMobile } from "@/components/cobreo/value-product-mockups";
import { cx } from "@/utils/cx";

const layers = LAYERS_MOTION_EXPERIMENT;

export function HomePage() {
    const t = useTranslations("home");
    const reduce = usePreferSimpleMotion();
    const [activeValue, setActiveValue] = useState(0);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [testimonialDir, setTestimonialDir] = useState(1);
    const valueListRef = useRef<HTMLDivElement>(null);
    const valueItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [valueIndicator, setValueIndicator] = useState({ top: 0, height: 0 });

    const text = childReveal(reduce, "up");
    const textLeft = childReveal(reduce, "left");
    const media = mediaReveal(reduce);
    const stagger = staggerContainer(reduce, 0.12, 0.06);
    const staggerTight = staggerContainer(reduce, 0.09, 0.04);
    const staggerSlow = staggerContainer(reduce, 0.16, 0.1);
    const inView = viewportOnce(0.15);

    const values = [
        { title: t("value1Title"), body: t("value1Body"), hint: t("value1Hint") },
        { title: t("value2Title"), body: t("value2Body"), hint: t("value2Hint") },
        { title: t("value3Title"), body: t("value3Body"), hint: t("value3Hint") },
        { title: t("value4Title"), body: t("value4Body"), hint: t("value4Hint") },
        { title: t("value5Title"), body: t("value5Body"), hint: t("value5Hint") },
        { title: t("value6Title"), body: t("value6Body"), hint: t("value6Hint") },
    ];

    const testimonials = t.raw("testimonials") as Array<{ quote: string; name: string; role: string }>;
    const testimonial = testimonials[activeTestimonial] ?? testimonials[0];
    const testimonialInitials = testimonial.name
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const goPrevTestimonial = () => {
        setTestimonialDir(-1);
        setActiveTestimonial((i) => (i - 1 + testimonials.length) % testimonials.length);
    };
    const goNextTestimonial = () => {
        setTestimonialDir(1);
        setActiveTestimonial((i) => (i + 1) % testimonials.length);
    };

    const syncValueIndicator = () => {
        const list = valueListRef.current;
        const item = valueItemRefs.current[activeValue];
        if (!list || !item) return;
        const listRect = list.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        setValueIndicator({
            top: itemRect.top - listRect.top,
            height: itemRect.height,
        });
    };

    useLayoutEffect(() => {
        syncValueIndicator();
    }, [activeValue]);

    useEffect(() => {
        const item = valueItemRefs.current[activeValue];
        if (!item) return;
        const ro = new ResizeObserver(() => syncValueIndicator());
        ro.observe(item);
        window.addEventListener("resize", syncValueIndicator);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", syncValueIndicator);
        };
    }, [activeValue]);

    return (
        <div className="relative -mt-20 overflow-x-clip bg-[#efedea] md:-mt-24">
            {layers && <AtmosphereWash />}

            {/*
              Background logo marks — sit in the side gutters; more off-canvas on smaller viewports
              so they peek without crossing content. Search: cobreo-logo-mark
            */}
            <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden>
                <div
                    className={cx(
                        "cobreo-logo-mark cobreo-logo-mark--1 cobreo-logo-mark-opacity absolute top-[min(52vh,520px)]",
                        "right-[-58%] h-[360px] w-[620px]",
                        "sm:right-[-48%] sm:h-[420px] sm:w-[720px]",
                        "md:right-[-36%] md:top-[min(48vh,560px)] md:h-[500px] md:w-[820px]",
                        "lg:right-[-22%] lg:top-[620px] lg:h-[560px] lg:w-[940px]",
                        "xl:right-[-10%] xl:top-[681px] xl:h-[640px] xl:w-[1080px]",
                        "2xl:right-[-6%] 2xl:w-[1130px]",
                    )}
                />
                <div
                    className={cx(
                        "cobreo-logo-mark cobreo-logo-mark--2 cobreo-logo-mark-opacity absolute",
                        "top-[1680px] left-[-62%] h-[340px] w-[580px]",
                        "sm:left-[-52%] sm:h-[400px] sm:w-[680px]",
                        "md:top-[1980px] md:left-[-40%] md:h-[480px] md:w-[780px]",
                        "lg:top-[2280px] lg:left-[-26%] lg:h-[540px] lg:w-[900px]",
                        "xl:top-[2460px] xl:left-[-14%] xl:h-[600px] xl:w-[1000px]",
                        "2xl:left-[-260px] 2xl:h-[614px] 2xl:w-[1052px]",
                    )}
                />
            </div>

            {/* Hero */}
            <section className="relative flex min-h-[calc(95dvh)] flex-col justify-center overflow-hidden pt-20 md:min-h-[calc(95dvh)] md:pt-24">
                <div className="relative z-10 mx-auto w-full min-w-0 max-w-container -translate-y-6 px-4 py-16 md:-translate-y-10 md:px-8 md:py-20">
                    {layers ? (
                        <div className="flex max-w-[930px] min-w-0 flex-col gap-6 md:gap-10">
                            <ClipRevealHero
                                as="h1"
                                delay={0.08}
                                className="font-display text-[clamp(1.75rem,8vw,2.5rem)] font-normal leading-[1.15] tracking-[-1.2px] text-balance text-[#171717] md:text-[60px] md:leading-[72px]"
                            >
                                {t("heroTitle")}
                            </ClipRevealHero>
                            <ClipRevealHero
                                as="p"
                                delay={0.28}
                                className="max-w-[930px] font-display text-[clamp(1.125rem,5vw,1.5rem)] font-light leading-[1.4] text-pretty text-[#171717] md:text-[30px]"
                            >
                                {t("heroSubtitle")}
                            </ClipRevealHero>
                            <motion.div
                                initial={reduce ? false : { y: 18 }}
                                animate={{ y: 0 }}
                                transition={{ duration: 1.1, delay: 0.48, ease: easeLuxury }}
                                className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
                            >
                                <CobreoButton
                                    href="/contact"
                                    variant="primary"
                                    size="xl"
                                    className="w-full sm:w-auto"
                                    iconLeading={<MessageChatSquare className="size-5" />}
                                    analytics={{ ctaId: "hero_contact", destination: "contact", surface: "home_hero" }}
                                >
                                    {t("heroCta")}
                                </CobreoButton>
                                <DiagnosticEntryButton
                                    variant="secondary"
                                    size="xl"
                                    className="w-full sm:w-auto"
                                    surface="home_hero"
                                    ctaId="hero_diagnostic"
                                    iconTrailing={<ArrowNarrowRight className="size-5 opacity-60" />}
                                />
                            </motion.div>
                        </div>
                    ) : (
                        <motion.div
                            className="flex max-w-[930px] min-w-0 flex-col gap-6 md:gap-10"
                            variants={staggerSlow}
                            initial="hidden"
                            animate="show"
                        >
                            <motion.h1
                                variants={text}
                                className="font-display text-[clamp(1.75rem,8vw,2.5rem)] font-normal leading-[1.15] tracking-[-1.2px] text-balance text-[#171717] md:text-[60px] md:leading-[72px]"
                            >
                                {t("heroTitle")}
                            </motion.h1>
                            <motion.p
                                variants={text}
                                className="max-w-[930px] font-display text-[clamp(1.125rem,5vw,1.5rem)] font-light leading-[1.4] text-pretty text-[#171717] md:text-[30px]"
                            >
                                {t("heroSubtitle")}
                            </motion.p>
                            <motion.div variants={text} className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                                <CobreoButton
                                    href="/contact"
                                    variant="primary"
                                    size="xl"
                                    className="w-full sm:w-auto"
                                    iconLeading={<MessageChatSquare className="size-5" />}
                                    analytics={{ ctaId: "hero_contact", destination: "contact", surface: "home_hero" }}
                                >
                                    {t("heroCta")}
                                </CobreoButton>
                                <DiagnosticEntryButton
                                    variant="secondary"
                                    size="xl"
                                    className="w-full sm:w-auto"
                                    surface="home_hero"
                                    ctaId="hero_diagnostic"
                                    iconTrailing={<ArrowNarrowRight className="size-5 opacity-60" />}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </div>

                <a
                    href="#process"
                    onClick={(e) => {
                        e.preventDefault();
                        const target = document.getElementById("process");
                        if (!target) return;
                        target.scrollIntoView({
                            behavior: reduce ? "auto" : "smooth",
                            block: "start",
                        });
                        if (typeof window !== "undefined") {
                            window.history.replaceState(null, "", "#process");
                        }
                    }}
                    className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 rounded-full p-2 text-[#404040] transition duration-100 ease-linear hover:text-[#171717] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97] md:bottom-8"
                    aria-label={t("scrollToProcess")}
                >
                    <motion.span
                        aria-hidden
                        className="flex"
                        animate={reduce ? undefined : { y: [0, 6, 0] }}
                        transition={
                            reduce
                                ? undefined
                                : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
                        }
                    >
                        <ChevronDown className="size-6 stroke-[1.75px]" />
                    </motion.span>
                </a>
            </section>

            {/* Process — bg is a sibling layer so page textures can sit above it */}
            <section id="process" className="relative scroll-mt-24 overflow-hidden px-4 py-20 text-[#efedea] md:px-8 md:pb-[120px] md:pt-24">
                <div className="absolute inset-0 z-0 bg-[#171718]" aria-hidden />
                <div className="relative z-10 mx-auto flex max-w-container flex-col gap-16 md:gap-20">
                    {layers ? (
                        <div className="flex max-w-5xl min-w-0 flex-col items-center gap-6 text-center md:items-start md:gap-12 md:text-left">
                            <div className="min-w-0">
                                <ClipReveal
                                    as="h2"
                                    delay={0.05}
                                    className="font-display text-[28px] font-normal leading-[1.2] tracking-[-0.96px] text-pretty md:text-[48px] md:leading-[60px] md:whitespace-nowrap"
                                >
                                    {t("processTitleLine1")}
                                </ClipReveal>
                                <ClipReveal
                                    as="h2"
                                    delay={0.16}
                                    className="font-display text-[28px] font-normal leading-[1.2] tracking-[-0.96px] text-pretty md:text-[48px] md:leading-[60px] md:whitespace-nowrap"
                                >
                                    {t("processTitleLine2")}
                                </ClipReveal>
                            </div>
                            <ClipReveal as="p" delay={0.28} className="min-w-0 font-display text-[22px] font-light leading-[1.35] text-pretty md:text-[30px] md:leading-[1.4]">
                                <span className="md:whitespace-nowrap">{t("processSubtitleLine1")}</span>
                                <br />
                                <span className="md:whitespace-nowrap">{t("processSubtitleLine2")}</span>
                            </ClipReveal>
                            <motion.div
                                initial={reduce ? false : { y: 16 }}
                                whileInView={{ y: 0 }}
                                viewport={inView}
                                transition={{ duration: 1.1, delay: 0.38, ease: easeLuxury }}
                                className="w-full min-w-0 sm:w-auto"
                            >
                                <DiagnosticEntryButton
                                    variant="secondary"
                                    size="xl"
                                    className="w-full sm:w-auto"
                                    surface="home_process"
                                    ctaId="process_diagnostic"
                                    idleLabel={t("processCta")}
                                    iconTrailing={<ArrowNarrowRight className="size-5 opacity-60" />}
                                />
                            </motion.div>
                        </div>
                    ) : (
                        <motion.div
                            className="flex max-w-5xl min-w-0 flex-col items-center gap-6 text-center md:items-start md:gap-12 md:text-left"
                            variants={stagger}
                            initial="hidden"
                            whileInView="show"
                            viewport={inView}
                        >
                            <motion.h2
                                variants={text}
                                className="min-w-0 font-display text-[28px] font-normal leading-[1.2] tracking-[-0.96px] text-pretty md:text-[48px] md:leading-[60px]"
                            >
                                <span className="md:whitespace-nowrap">{t("processTitleLine1")}</span>
                                <br />
                                <span className="md:whitespace-nowrap">{t("processTitleLine2")}</span>
                            </motion.h2>
                            <motion.p variants={text} className="min-w-0 font-display text-[22px] font-light leading-[1.35] text-pretty md:text-[30px] md:leading-[1.4]">
                                <span className="md:whitespace-nowrap">{t("processSubtitleLine1")}</span>
                                <br />
                                <span className="md:whitespace-nowrap">{t("processSubtitleLine2")}</span>
                            </motion.p>
                            <motion.div variants={text} className="w-full min-w-0 sm:w-auto">
                                <DiagnosticEntryButton
                                    variant="secondary"
                                    size="xl"
                                    className="w-full sm:w-auto"
                                    surface="home_process"
                                    ctaId="process_diagnostic"
                                    idleLabel={t("processCta")}
                                    iconTrailing={<ArrowNarrowRight className="size-5 opacity-60" />}
                                />
                            </motion.div>
                        </motion.div>
                    )}

                    <div className="relative hidden xl:block xl:h-[1080px] xl:w-full">
                        <ProcessPath className="pointer-events-none absolute left-[27.6%] top-[3.5%] z-[1] h-[79.4%] w-[41.7%]" />

                        <ProcessStep
                            className="absolute left-0 top-0 z-[2] max-w-full"
                            side="left"
                            kind="identify"
                            delay={PROCESS_STEP_DELAYS[0]}
                            imageClassName="h-[200px] w-[220px] shrink-0 xl:h-[244px] xl:w-[268px]"
                            gap="gap-6 xl:gap-[60px]"
                            text={
                                <p className="max-w-[min(100%,22rem)] py-4 font-display text-[24px] font-light leading-[1.35] text-[#efedea] xl:py-[31px] xl:text-[30px] xl:leading-[1.4]">
                                    <span className="font-bold">{t("identifyBold")} </span>
                                    <span>
                                        {t("identifyLine2")}
                                        <br />
                                        {t("identifyLine3")}
                                    </span>
                                </p>
                            }
                        />

                        <ProcessStep
                            className="absolute left-[52.1%] top-[242px] z-[2] max-w-full"
                            side="right"
                            kind="validate"
                            delay={PROCESS_STEP_DELAYS[1]}
                            imageClassName="h-[200px] w-[240px] shrink-0 xl:h-[244px] xl:w-[294px]"
                            text={
                                <p className="max-w-[min(100%,20rem)] py-4 font-display text-[24px] font-light leading-[1.35] text-[#efedea] xl:w-[317px] xl:max-w-none xl:py-6 xl:text-[30px] xl:leading-[1.4]">
                                    <span className="font-bold">{t("validateBold")} </span>
                                    <span>
                                        {t("validateLine2")}
                                        <br />
                                        {t("validateLine3")}
                                    </span>
                                </p>
                            }
                        />

                        <ProcessStep
                            className="absolute left-0 top-[522px] z-[2] max-w-full"
                            side="left"
                            kind="develop"
                            delay={PROCESS_STEP_DELAYS[2]}
                            imageClassName="h-[200px] w-[260px] shrink-0 xl:h-[244px] xl:w-[324px]"
                            text={
                                <p className="max-w-[min(100%,22rem)] py-4 font-display text-[24px] font-light leading-[1.35] text-[#efedea] xl:w-[362px] xl:max-w-none xl:py-6 xl:text-[30px] xl:leading-[1.4]">
                                    <span className="font-bold">{t("developBold")} </span>
                                    <span>
                                        {t("developLine2")}
                                        <br />
                                        {t("developLine3")}
                                    </span>
                                </p>
                            }
                        />

                        <ProcessStep
                            className="absolute left-[48.3%] top-[836px] z-[2] max-w-full"
                            side="right"
                            kind="evolve"
                            delay={PROCESS_STEP_DELAYS[3]}
                            imageClassName="h-[200px] w-[200px] shrink-0 overflow-hidden pl-4 xl:h-[244px] xl:w-[235px] xl:pl-6"
                            text={
                                <p className="max-w-[min(100%,24rem)] py-4 font-display text-[24px] font-light leading-[1.35] text-[#efedea] xl:w-[401px] xl:max-w-none xl:py-6 xl:text-[30px] xl:leading-[1.4]">
                                    <span className="font-bold">{t("evolveBold")} </span>
                                    <span>
                                        {t("evolveLine2")}
                                        <br />
                                        {t("evolveLine3")}
                                    </span>
                                </p>
                            }
                        />
                    </div>

                    <div className="flex flex-col gap-14 xl:hidden">
                        <ProcessRow
                            kind="identify"
                            bold={t("identifyBold")}
                            line2={t("identifyLine2")}
                            line3={t("identifyLine3")}
                            side="left"
                        />
                        <ProcessRow
                            kind="validate"
                            bold={t("validateBold")}
                            line2={t("validateLine2")}
                            line3={t("validateLine3")}
                            side="right"
                        />
                        <ProcessRow
                            kind="develop"
                            bold={t("developBold")}
                            line2={t("developLine2")}
                            line3={t("developLine3")}
                            side="left"
                        />
                        <ProcessRow
                            kind="evolve"
                            bold={t("evolveBold")}
                            line2={t("evolveLine2")}
                            line3={t("evolveLine3")}
                            side="right"
                        />
                    </div>
                </div>
            </section>

            {/* Value — list + restrained mockup (keeps rounded chrome, avoids upscaling blur) */}
            <section className="relative overflow-x-clip py-16 sm:py-20 md:py-24 lg:py-[120px] xl:py-[160px]">
                <div className="relative z-10 mx-auto max-w-container px-4 md:px-8">
                    <motion.div
                        className="mb-8 flex max-w-4xl flex-col gap-3 sm:mb-10 md:mb-12 md:gap-4 lg:mb-14"
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={inView}
                    >
                        <motion.h2
                            variants={text}
                            className="font-display text-[clamp(1.75rem,4vw,3rem)] font-normal tracking-[-0.96px] text-[#090a24] md:leading-[1.2]"
                        >
                            {t("valueTitle")}
                        </motion.h2>
                        <motion.p
                            variants={text}
                            className="max-w-3xl font-display text-[clamp(1.125rem,2.4vw,1.875rem)] font-light leading-[1.4] text-[#090a24]"
                        >
                            {t("valueSubtitle")}
                        </motion.p>
                    </motion.div>

                    <div className="relative min-w-0 overflow-x-clip lg:overflow-visible">
                        <motion.div
                            ref={valueListRef}
                            className="relative z-20 w-full lg:w-[min(100%,22rem)] xl:w-[26rem]"
                            aria-label={t("valueTitle")}
                            variants={staggerTight}
                            initial="hidden"
                            whileInView="show"
                            viewport={inView}
                        >
                            <motion.span
                                aria-hidden
                                className="pointer-events-none absolute left-0 w-1 rounded-full bg-[#5f7aa1]"
                                initial={false}
                                animate={{
                                    top: valueIndicator.top,
                                    height: Math.max(valueIndicator.height, 8),
                                }}
                                transition={
                                    reduce
                                        ? { duration: 0 }
                                        : { type: "spring", stiffness: 420, damping: 38, mass: 0.7 }
                                }
                            />
                            {values.map((item, i) => {
                                const active = i === activeValue;
                                return (
                                    <motion.button
                                        key={item.title}
                                        ref={(el) => {
                                            valueItemRefs.current[i] = el;
                                        }}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() => setActiveValue(i)}
                                        variants={textLeft}
                                        className={cx(
                                            "group relative cursor-pointer rounded-r-xl py-5 pl-8 pr-4 text-left transition-colors duration-200 sm:py-5 sm:pl-8 sm:pr-5",
                                            "hover:bg-[#4d6b97]/[0.04]",
                                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                                            active && "bg-[#4d6b97]/[0.03]",
                                        )}
                                    >
                                        <h3
                                            className={cx(
                                                "text-[18px] font-semibold leading-snug transition-colors duration-200 sm:text-[20px] sm:leading-[30px]",
                                                active ? "text-[#171717]" : "text-[#171717]/75 group-hover:text-[#171717]",
                                            )}
                                        >
                                            {item.title}
                                        </h3>
                                        <AnimatePresence initial={false}>
                                            {active ? (
                                                <motion.div
                                                    key="details"
                                                    initial={reduce ? false : { opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={reduce ? undefined : { opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.35, ease: easeLuxury }}
                                                    className="overflow-hidden"
                                                >
                                                    <p className="mt-1 text-[16px] leading-relaxed text-[#525252] sm:text-[18px] sm:leading-[28px]">
                                                        {item.body}
                                                    </p>
                                                    <p className="mt-1 text-[15px] font-light italic leading-6 text-[#525252] sm:text-[16px]">
                                                        {item.hint}
                                                    </p>
                                                </motion.div>
                                            ) : (
                                                <p className="mt-1 line-clamp-1 text-[16px] leading-relaxed text-[#525252]/70 transition-colors group-hover:text-[#525252] sm:text-[18px] sm:leading-[28px]">
                                                    {item.body}
                                                </p>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                );
                            })}

                            <motion.div
                                variants={textLeft}
                                className="mt-8 px-2 lg:hidden"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={`mobile-${activeValue}`}
                                        initial={reduce ? false : { opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={reduce ? undefined : { opacity: 0, y: -8 }}
                                        transition={{ duration: 0.4, ease: easeLuxury }}
                                    >
                                        <ValueProductMockupMobile
                                            activeIndex={activeValue}
                                            brandLabel={t("valueMockupBrand")}
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            </motion.div>

                            <motion.div
                                variants={textLeft}
                                className="mt-10 flex flex-col items-start gap-4 border-t border-[#090a24]/12 pt-8 pl-8 sm:mt-12 sm:gap-5 sm:pt-10 sm:pl-8"
                            >
                                <p className="max-w-[18rem] font-display text-[18px] font-normal leading-snug tracking-[-0.02em] text-[#090a24] sm:text-[20px] sm:leading-[1.35]">
                                    {t("valueCtaPrompt")}
                                </p>
                                <CobreoButton
                                    href="/contact"
                                    variant="primary"
                                    size="xl"
                                    iconLeading={<MessageChatSquare className="size-5" />}
                                    analytics={{ ctaId: "value_contact", destination: "contact", surface: "home_value" }}
                                >
                                    {t("valueCta")}
                                </CobreoButton>
                            </motion.div>
                        </motion.div>

                        {(() => {
                            const mockupFrame = (
                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.div
                                        key={activeValue}
                                        className="overflow-hidden rounded-2xl"
                                        initial={reduce ? false : { opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={reduce ? undefined : { opacity: 0, y: -6 }}
                                        transition={{ duration: 0.45, ease: easeLuxury }}
                                    >
                                        <ValueProductMockup activeIndex={activeValue} brandLabel={t("valueMockupBrand")} />
                                    </motion.div>
                                </AnimatePresence>
                            );

                            // Desktop-only product preview — keep static (no scroll parallax) so prod matches design.
                            const mockupShellClass = cx(
                                "pointer-events-none absolute top-0 z-10 hidden lg:block",
                                "lg:left-[calc(22rem+1rem)] lg:right-[calc((100%-100vw)/2+1rem)]",
                                "xl:left-[calc(26rem+1.25rem)] xl:right-[calc((100%-100vw)/2+1.5rem)]",
                            );

                            return (
                                <motion.div
                                    className={mockupShellClass}
                                    variants={media}
                                    initial="hidden"
                                    whileInView="show"
                                    viewport={inView}
                                >
                                    {mockupFrame}
                                </motion.div>
                            );
                        })()}
                    </div>
                </div>
            </section>

            {/* Philosophy */}
            <section className="relative z-10 overflow-hidden bg-[#171718] px-4 py-24 text-[#efedea] md:px-8 md:py-[103px]">
                <DarkLogoMosaic variant="flow" />
                {layers ? (
                    <div className="relative z-10 mx-auto flex max-w-container flex-col gap-10">
                        <ClipReveal
                            as="h2"
                            className="max-w-5xl font-display text-[36px] font-normal tracking-[-0.96px] md:text-[48px] md:leading-[60px]"
                        >
                            {t("philosophyTitle")}
                        </ClipReveal>
                        <ClipReveal as="p" delay={0.12} className="max-w-5xl font-display text-[24px] font-light leading-[1.4] md:text-[30px]">
                            {t("philosophyBody")}
                        </ClipReveal>
                        <motion.div
                            initial={reduce ? false : { y: 12 }}
                            whileInView={{ y: 0 }}
                            viewport={inView}
                            transition={{ duration: 1, delay: 0.22, ease: easeLuxury }}
                        >
                            <Link href="/a-propos" className="group inline-flex items-center gap-1.5 text-[20px] font-semibold text-[#a6b5cb] hover:text-white">
                                {t("philosophyLink")}
                                <ArrowNarrowRight className="size-5 transition-transform duration-500 ease-out group-hover:translate-x-1.5" />
                            </Link>
                        </motion.div>
                    </div>
                ) : (
                    <motion.div
                        className="relative z-10 mx-auto flex max-w-container flex-col gap-10"
                        variants={stagger}
                        initial="hidden"
                        whileInView="show"
                        viewport={inView}
                    >
                        <motion.h2
                            variants={text}
                            className="max-w-5xl font-display text-[36px] font-normal tracking-[-0.96px] md:text-[48px] md:leading-[60px]"
                        >
                            {t("philosophyTitle")}
                        </motion.h2>
                        <motion.p variants={text} className="max-w-5xl font-display text-[24px] font-light leading-[1.4] md:text-[30px]">
                            {t("philosophyBody")}
                        </motion.p>
                        <motion.div variants={text}>
                            <Link href="/a-propos" className="group inline-flex items-center gap-1.5 text-[20px] font-semibold text-[#a6b5cb] hover:text-white">
                                {t("philosophyLink")}
                                <ArrowNarrowRight className="size-5 transition-transform duration-500 ease-out group-hover:translate-x-1.5" />
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </section>

            {/* Testimonials */}
            <section className="relative z-10 px-4 py-24 md:px-8 md:py-40">
                <motion.div
                    className="mx-auto flex max-w-container flex-col items-center gap-6 md:gap-8"
                    variants={staggerSlow}
                    initial="hidden"
                    whileInView="show"
                    viewport={inView}
                >
                    <motion.h2
                        variants={text}
                        className="text-center font-display text-[28px] font-normal tracking-[-0.72px] text-[#090a24] md:text-[36px] md:leading-[44px]"
                    >
                        {t("testimonialTitle")}
                    </motion.h2>

                    <div className="flex w-full max-w-5xl min-w-0 items-center gap-1 sm:gap-2 md:gap-6">
                        <motion.button
                            type="button"
                            variants={text}
                            onClick={goPrevTestimonial}
                            aria-label={t("testimonialPrev")}
                            className={cx(
                                "group flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full sm:size-14",
                                "text-[#171717]/55 transition duration-200 ease-out",
                                "hover:bg-[#171717]/[0.06] hover:text-[#171717]",
                                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                                "md:size-16",
                            )}
                        >
                            <ChevronLeft className="size-6 transition-transform duration-200 group-hover:-translate-x-0.5 sm:size-8 md:size-10" />
                        </motion.button>

                        <div className="flex min-w-0 flex-1 flex-col items-center gap-8 overflow-hidden px-1">
                            <AnimatePresence mode="wait" initial={false} custom={testimonialDir}>
                                <motion.blockquote
                                    key={activeTestimonial}
                                    custom={testimonialDir}
                                    initial={reduce ? false : { opacity: 0, x: testimonialDir * 56 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={reduce ? undefined : { opacity: 0, x: testimonialDir * -56 }}
                                    transition={{ duration: 0.5, ease: easeLuxury }}
                                    className="max-w-full text-center font-display text-[clamp(1.125rem,4.5vw,1.375rem)] font-light leading-[1.35] text-pretty text-[#171717] md:text-[30px] md:leading-[38px]"
                                >
                                    {testimonial.quote}
                                </motion.blockquote>
                            </AnimatePresence>

                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={`meta-${activeTestimonial}`}
                                    initial={reduce ? false : { opacity: 0, x: testimonialDir * 28 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={reduce ? undefined : { opacity: 0, x: testimonialDir * -28 }}
                                    transition={{ duration: 0.4, ease: easeLuxury }}
                                    className="flex items-center gap-4"
                                >
                                    <Avatar initials={testimonialInitials} size="lg" alt={testimonial.name} />
                                    <div>
                                        <p className="text-[18px] font-semibold leading-7 text-[#171717]">{testimonial.name}</p>
                                        <p className="text-[16px] leading-6 text-[#525252]">{testimonial.role}</p>
                                        <RatingStars rating={5} className="mt-1.5 gap-0.5" starClassName="size-5 text-[#171717]" />
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            <div className="flex gap-2" role="group" aria-label={t("testimonialTitle")}>
                                {testimonials.map((item, i) => (
                                    <button
                                        key={item.name}
                                        type="button"
                                        aria-current={i === activeTestimonial ? "true" : undefined}
                                        aria-label={`${i + 1} / ${testimonials.length}`}
                                        onClick={() => {
                                            setTestimonialDir(i > activeTestimonial ? 1 : -1);
                                            setActiveTestimonial(i);
                                        }}
                                        className={cx(
                                            "h-2 cursor-pointer rounded-full transition duration-200",
                                            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                                            i === activeTestimonial ? "w-6 bg-[#171717]" : "w-2 bg-[#171717]/25 hover:bg-[#171717]/50",
                                        )}
                                    />
                                ))}
                            </div>
                        </div>

                        <motion.button
                            type="button"
                            variants={text}
                            onClick={goNextTestimonial}
                            aria-label={t("testimonialNext")}
                            className={cx(
                                "group flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full sm:size-14",
                                "text-[#171717]/55 transition duration-200 ease-out",
                                "hover:bg-[#171717]/[0.06] hover:text-[#171717]",
                                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                                "md:size-16",
                            )}
                        >
                            <ChevronRight className="size-6 transition-transform duration-200 group-hover:translate-x-0.5 sm:size-8 md:size-10" />
                        </motion.button>
                    </div>
                </motion.div>
            </section>

            {/* Diagnostic CTA */}
            <section className="relative z-10 px-4 pb-24 md:px-8">
                <motion.div
                    variants={stagger}
                    initial="hidden"
                    whileInView="show"
                    viewport={inView}
                    className="relative mx-auto flex max-w-container min-w-0 flex-col items-start justify-between gap-8 overflow-hidden rounded-2xl bg-[#b1b6a6] px-5 py-12 sm:px-8 md:flex-row md:items-center md:px-16 md:pb-[90px] md:pt-[60px] md:py-14"
                >
                    <motion.div
                        variants={media}
                        className="pointer-events-none absolute top-1/2 hidden -translate-y-1/2 md:block md:-right-16 md:h-[180px] md:w-[155px] lg:-right-12 lg:h-[200px] lg:w-[172px] xl:-right-8 xl:h-[213px] xl:w-[184px]"
                    >
                        <div className="relative h-full w-full">
                            <Image src="/images/diagnostic-watermark.svg" alt="" fill className="object-contain opacity-40" />
                        </div>
                    </motion.div>
                    <div className="relative z-10 min-w-0 max-w-3xl">
                        <motion.h2
                            variants={text}
                            className="font-display text-[clamp(1.375rem,5vw,1.75rem)] font-semibold tracking-[-0.72px] text-balance text-[#404040] md:text-[36px] md:leading-[44px]"
                        >
                            {t("diagnosticTitle")}
                        </motion.h2>
                        <motion.p variants={text} className="mt-5 text-[18px] leading-[28px] text-pretty text-[#404040] md:text-[20px] md:leading-[30px]">
                            {t("diagnosticBody")}
                        </motion.p>
                    </div>
                    <motion.div variants={text} className="relative z-10 w-full min-w-0 shrink-0 md:w-auto">
                        <DiagnosticEntryButton
                            variant="ghost"
                            size="lg"
                            surface="home_diagnostic_band"
                            ctaId="home_band_diagnostic"
                            iconTrailing={<ArrowNarrowRight className="size-5" />}
                            className="!w-full !border-[#d4d4d4] !bg-white md:!w-auto"
                        />
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
}

function ProcessStep({
    className,
    side,
    kind,
    imageClassName,
    text,
    gap = "gap-8",
    delay = 0,
}: {
    className?: string;
    side: "left" | "right";
    kind: "identify" | "validate" | "develop" | "evolve";
    imageClassName: string;
    text: ReactNode;
    gap?: string;
    delay?: number;
}) {
    const reduce = usePreferSimpleMotion();
    const media = mediaReveal(reduce);
    const copy = childReveal(reduce, side);
    const stagger = staggerContainer(reduce, 0.14, reduce ? 0 : delay);

    const mediaEl = (
        <motion.div variants={media} className={cx("relative shrink-0 overflow-hidden", imageClassName)}>
            <ProcessIllustration kind={kind} />
        </motion.div>
    );

    const textEl = <motion.div variants={copy} className="min-w-0">{text}</motion.div>;

    return (
        <motion.div
            className={cx("flex max-w-full items-start", gap, className)}
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce(0.2)}
        >
            {side === "left" ? (
                <>
                    {mediaEl}
                    {textEl}
                </>
            ) : (
                <>
                    {textEl}
                    {mediaEl}
                </>
            )}
        </motion.div>
    );
}

function ProcessRow({
    kind,
    bold,
    line2,
    line3,
    side,
    className,
}: {
    kind: "identify" | "validate" | "develop" | "evolve";
    bold: string;
    line2: string;
    line3: string;
    side: "left" | "right";
    className?: string;
}) {
    const reduce = usePreferSimpleMotion();
    const media = mediaReveal(reduce);
    // Vertical only — horizontal slide looked "décalé" on narrow phones when motion stuck.
    const copy = childReveal(reduce, "up");
    const stagger = staggerContainer(reduce, 0.12, 0.06);

    return (
        <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce(0.15)}
            className={cx(
                "relative z-10 flex min-w-0 flex-col items-center gap-6 text-center md:flex-row md:items-start md:gap-8 md:text-left",
                side === "right" && "md:ml-auto md:max-w-[720px] md:flex-row-reverse",
                side === "left" && "md:max-w-[720px]",
                className,
            )}
        >
            <motion.div variants={media} className="relative aspect-square h-auto w-[60%] max-w-[168px] shrink-0 overflow-hidden md:w-auto md:max-w-[320px]">
                <ProcessIllustration kind={kind} />
            </motion.div>
            <motion.p
                variants={copy}
                className="min-w-0 max-w-full font-display text-[22px] font-light leading-[1.35] text-[#efedea] md:py-6 md:text-[30px] md:leading-[1.4] md:text-pretty"
            >
                <span className="md:whitespace-nowrap">
                    <span className="font-bold">{bold} </span>
                    <span>{line2}</span>
                </span>
                <br />
                <span className="md:whitespace-nowrap">{line3}</span>
            </motion.p>
        </motion.div>
    );
}
