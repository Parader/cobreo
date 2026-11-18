"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { usePreferSimpleMotion } from "@/hooks/use-prefer-simple-motion";
import { ArrowNarrowRight } from "@untitledui/icons";
import { Link } from "@/i18n/navigation";
import { DemoButton } from "@/components/cobreo/marketing/demo-button";
import { HeroMark } from "@/components/cobreo/marketing/hero-mark";
import { DiagnosticEntryButton } from "@/components/cobreo/diagnostic/diagnostic-entry-button";
import { DarkLogoMosaic } from "@/components/cobreo/dark-logo-mosaic";
import { MarketingAtmosphere } from "@/components/cobreo/marketing-page-chrome";
import { childReveal, staggerContainer, staggerContainerSlow } from "@/components/cobreo/motion";
import { Reveal } from "@/components/cobreo/reveal";
import { cx } from "@/utils/cx";

const FOUNDERS = [
    {
        nameKey: "founder2Name",
        roleKey: "founder2Role",
        bioKey: "founder2Bio",
        experienceKey: "founder2Experience",
        src: "/images/founders/nicolas-stoltz.png",
        objectClass: "object-[center_18%]",
    },
    {
        nameKey: "founder1Name",
        roleKey: "founder1Role",
        bioKey: "founder1Bio",
        experienceKey: "founder1Experience",
        src: "/images/founders/derick-paradis.png",
        objectClass: "object-[center_20%]",
    },
] as const;

const h2 = "font-display text-[34px] font-normal leading-[1.1] tracking-[-0.03em] text-balance md:text-[46px]";

/**
 * About: why Cobreo exists → who builds it → how → contact.
 * Same positioning as the home page (modular platform + custom modules).
 */
export function AboutPage() {
    const t = useTranslations("about");
    const reduce = usePreferSimpleMotion();
    const text = childReveal(reduce, "up");
    const heroStagger = staggerContainerSlow(reduce);
    const sectionStagger = staggerContainer(reduce, 0.14, 0.08);
    const listStagger = staggerContainer(reduce, 0.12, 0.08);
    const inViewAmount = 0.15;

    return (
        <div className="relative overflow-x-clip bg-white">
            <MarketingAtmosphere />

            {/* Hero */}
            <section className="relative z-10 overflow-hidden">
                <HeroMark className="-right-[45%] top-[46%] h-[260px] w-[440px] opacity-80 md:-right-[6%] md:top-[6%] md:h-[460px] md:w-[780px]" />
                <div className="relative mx-auto max-w-container px-4 pt-12 pb-20 md:px-8 md:pt-20 md:pb-28">
                    <motion.div className="max-w-3xl" variants={heroStagger} initial="hidden" animate="show">
                        <motion.h1
                            variants={text}
                            className="font-display text-[42px] leading-[1.06] font-normal tracking-[-0.035em] text-balance text-[#090a24] md:text-[64px]"
                        >
                            {t("heroTitle")}
                        </motion.h1>
                        <motion.p
                            variants={text}
                            className="mt-7 max-w-[38rem] text-[18px] leading-[1.6] text-pretty text-[#525252] md:text-[21px]"
                        >
                            {t("heroBody")}
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Why */}
            <section className="relative z-10 mx-auto max-w-container px-4 py-16 md:px-8 md:py-24">
                <Reveal
                    className="grid gap-8 border-t border-[#171717]/10 pt-12 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-20 lg:pt-16"
                    variants={sectionStagger}
                    amount={inViewAmount}
                >
                    <motion.h2 variants={text} className={cx(h2, "text-[#090a24]")}>
                        {t("originTitle")}
                    </motion.h2>
                    <motion.div variants={text} className="max-w-2xl space-y-5">
                        <p className="text-[17px] leading-[1.7] text-[#404040] md:text-[19px]">{t("originBody1")}</p>
                        <p className="text-[17px] leading-[1.7] text-[#404040] md:text-[19px]">{t("originBody2")}</p>
                    </motion.div>
                </Reveal>
            </section>

            {/* Who */}
            <section className="relative z-10 mx-auto max-w-container px-4 pb-20 md:px-8 md:pb-28">
                <Reveal className="max-w-3xl" variants={sectionStagger} amount={inViewAmount}>
                    <motion.h2 variants={text} className={cx(h2, "text-[#090a24]")}>
                        {t("foundersTitle")}
                    </motion.h2>
                    <motion.p variants={text} className="mt-5 max-w-2xl text-[17px] leading-[1.7] text-[#404040] md:text-[19px]">
                        {t("foundersBody")}
                    </motion.p>
                </Reveal>

                <Reveal
                    as="ul"
                    className="mt-12 grid gap-12 md:mt-16 md:grid-cols-2 md:gap-10"
                    variants={listStagger}
                    amount={inViewAmount}
                >
                    {FOUNDERS.map((founder) => (
                        <motion.li key={founder.src} variants={text} className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-7">
                            <div className="relative aspect-[4/5] w-full max-w-[220px] shrink-0 overflow-hidden rounded-md bg-[#e4e1dc] ring-1 ring-[#171717]/10 sm:w-[160px] lg:w-[180px]">
                                <Image
                                    src={founder.src}
                                    alt={t(founder.nameKey)}
                                    fill
                                    sizes="(max-width: 640px) 220px, 180px"
                                    className={cx("object-cover", founder.objectClass)}
                                />
                            </div>
                            <div className="min-w-0 flex-1 sm:pt-1">
                                <h3 className="font-display text-[26px] font-normal tracking-[-0.02em] text-[#090a24] md:text-[28px]">
                                    {t(founder.nameKey)}
                                </h3>
                                <p className="mt-1 text-[15px] font-medium text-[#4d6b97]">{t(founder.roleKey)}</p>
                                <p className="mt-4 text-[16px] leading-[1.65] text-[#404040] md:text-[17px]">{t(founder.bioKey)}</p>
                                <p className="mt-3 text-[15px] leading-relaxed text-[#6b6b6b]">{t(founder.experienceKey)}</p>
                            </div>
                        </motion.li>
                    ))}
                </Reveal>
            </section>

            {/* How */}
            <section className="relative z-10 overflow-hidden bg-[#171718] text-[#efedea]">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(77,107,151,0.18),_transparent_55%)]"
                />
                <DarkLogoMosaic variant="corner-tr" />
                <div className="relative mx-auto max-w-container px-4 py-20 md:px-8 md:py-28">
                    <Reveal
                        className="grid gap-8 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-20"
                        variants={sectionStagger}
                        amount={inViewAmount}
                    >
                        <motion.h2 variants={text} className={h2}>
                            {t("approachTitle")}
                        </motion.h2>
                        <motion.div variants={text} className="max-w-2xl">
                            <p className="text-[18px] leading-[1.7] text-[#c8c8c8] md:text-[20px]">{t("approachBody")}</p>
                            <p className="mt-5 text-[18px] leading-[1.7] text-[#c8c8c8] md:text-[20px]">{t("workBody")}</p>
                            <Link
                                href={{ pathname: "/", hash: "modules" }}
                                className="group mt-8 inline-flex items-center gap-2 text-base font-semibold text-white underline decoration-white/30 underline-offset-4 transition-colors duration-150 hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                                {t("workLink")}
                                <ArrowNarrowRight
                                    data-icon
                                    className="size-5 transition-transform duration-300 ease-out group-hover:translate-x-1"
                                    aria-hidden
                                />
                            </Link>
                        </motion.div>
                    </Reveal>
                </div>
            </section>

            {/* Contact — same closing style as the home page: open, left-aligned, no card */}
            <section className="relative z-10 px-4 py-24 md:px-8 md:py-32">
                <Reveal className="mx-auto max-w-[760px]" variants={sectionStagger} amount={inViewAmount}>
                    <motion.h2
                        variants={text}
                        className="font-display text-[clamp(1.9rem,3.6vw,2.75rem)] leading-[1.15] font-normal tracking-[-0.03em] text-balance text-[#090a24]"
                    >
                        {t("ctaTitle")}
                    </motion.h2>
                    <motion.p variants={text} className="mt-4 max-w-xl text-[17px] leading-[1.65] text-[#525252] md:text-[19px]">
                        {t("ctaBody")}
                    </motion.p>
                    <motion.div variants={text} className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                        <DemoButton ctaId="about_demo" surface="about_cta">
                            {t("ctaContact")}
                        </DemoButton>
                        <DiagnosticEntryButton
                            variant="ghost"
                            size="xl"
                            surface="about_cta"
                            ctaId="about_diagnostic"
                            iconTrailing={<ArrowNarrowRight data-icon className="size-5" />}
                        />
                    </motion.div>
                </Reveal>
            </section>
        </div>
    );
}
