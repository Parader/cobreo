"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { usePreferSimpleMotion } from "@/hooks/use-prefer-simple-motion";
import { ArrowNarrowRight, MessageChatSquare } from "@untitledui/icons";
import { Link } from "@/i18n/navigation";
import { CobreoButton } from "@/components/cobreo/cobreo-button";
import { DiagnosticEntryButton } from "@/components/cobreo/diagnostic/diagnostic-entry-button";
import { DarkLogoMosaic } from "@/components/cobreo/dark-logo-mosaic";
import {
    MarketingAtmosphere,
    MarketingCtaBand,
    MarketingEyebrow,
} from "@/components/cobreo/marketing-page-chrome";
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
        altKey: "founder2Name",
        objectClass: "object-[center_18%]",
    },
    {
        nameKey: "founder1Name",
        roleKey: "founder1Role",
        bioKey: "founder1Bio",
        experienceKey: "founder1Experience",
        src: "/images/founders/derick-paradis.png",
        altKey: "founder1Name",
        objectClass: "object-[center_20%]",
    },
] as const;

export function AboutPage() {
    const t = useTranslations("about");
    const reduce = usePreferSimpleMotion();
    const text = childReveal(reduce, "up");
    const heroStagger = staggerContainerSlow(reduce);
    const sectionStagger = staggerContainer(reduce, 0.14, 0.08);
    const listStagger = staggerContainer(reduce, 0.12, 0.08);
    const inViewAmount = 0.15;

    return (
        <div className="relative overflow-x-clip bg-[#efedea]">
            <MarketingAtmosphere />

            <section className="relative z-10 mx-auto max-w-container px-4 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16">
                <motion.div className="max-w-3xl" variants={heroStagger} initial="hidden" animate="show">
                    <motion.div variants={text}>
                        <MarketingEyebrow>{t("eyebrow")}</MarketingEyebrow>
                    </motion.div>
                    <motion.h1
                        variants={text}
                        className="mt-4 font-display text-[42px] font-normal leading-[1.08] tracking-[-0.03em] text-[#171717] md:mt-5 md:text-[60px]"
                    >
                        {t("heroTitle")}
                    </motion.h1>
                    <motion.p
                        variants={text}
                        className="mt-6 max-w-2xl font-display text-[22px] font-light leading-[1.45] text-[#404040] md:mt-7 md:text-[28px]"
                    >
                        {t("heroBody")}
                    </motion.p>
                    <motion.div
                        variants={text}
                        aria-hidden
                        className="mt-10 h-px w-24 bg-gradient-to-r from-[#4d6b97] to-transparent"
                    />
                </motion.div>
            </section>

            <section className="relative z-10 mx-auto max-w-container px-4 py-16 md:px-8 md:py-24">
                <Reveal className="max-w-3xl" variants={sectionStagger} amount={inViewAmount}>
                    <motion.div variants={text}>
                        <MarketingEyebrow>{t("foundersEyebrow")}</MarketingEyebrow>
                    </motion.div>
                    <motion.h2
                        variants={text}
                        className="mt-4 font-display text-[34px] font-normal leading-[1.1] tracking-[-0.03em] text-[#171717] md:mt-5 md:text-[48px]"
                    >
                        {t("foundersTitle")}
                    </motion.h2>
                    <motion.p
                        variants={text}
                        className="mt-5 max-w-2xl text-base leading-relaxed text-[#404040] md:mt-6 md:text-lg"
                    >
                        {t("foundersBody")}
                    </motion.p>
                </Reveal>

                <Reveal
                    as="ul"
                    className="mt-12 flex max-w-4xl flex-col gap-12 md:mt-16 md:gap-16"
                    variants={listStagger}
                    amount={inViewAmount}
                >
                    {FOUNDERS.map((founder) => (
                        <motion.li
                            key={founder.src}
                            variants={text}
                            className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8 md:gap-10"
                        >
                            <div className="relative aspect-[4/5] w-full max-w-[220px] shrink-0 overflow-hidden rounded-sm bg-[#e4e1dc] ring-1 ring-[#171717]/10 sm:w-[180px] sm:max-w-none md:w-[200px]">
                                <Image
                                    src={founder.src}
                                    alt={t(founder.altKey)}
                                    fill
                                    sizes="(max-width: 640px) 220px, 200px"
                                    className={cx("object-cover", founder.objectClass)}
                                />
                            </div>

                            <div className="min-w-0 flex-1 sm:pt-1 md:pt-2">
                                <h3 className="font-display text-[26px] font-normal tracking-[-0.02em] text-[#171717] md:text-[30px]">
                                    {t(founder.nameKey)}
                                </h3>
                                <p className="mt-1.5 text-sm font-medium tracking-[0.06em] text-[#4d6b97] uppercase md:text-[15px]">
                                    {t(founder.roleKey)}
                                </p>
                                <p className="mt-4 text-base leading-relaxed text-[#404040] md:text-lg md:leading-relaxed">
                                    {t(founder.bioKey)}
                                </p>
                                <p className="mt-3 text-[15px] leading-relaxed text-[#737373] md:text-base">
                                    {t(founder.experienceKey)}
                                </p>
                            </div>
                        </motion.li>
                    ))}
                </Reveal>
            </section>

            <section className="relative z-10 overflow-hidden bg-[#171718] text-[#efedea]">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(77,107,151,0.18),_transparent_55%)]"
                />
                <DarkLogoMosaic variant="corner-tr" />
                <div className="relative mx-auto max-w-container px-4 py-20 md:px-8 md:py-28">
                    <Reveal
                        className="grid gap-10 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,1fr)] lg:items-start lg:gap-20"
                        variants={sectionStagger}
                        amount={inViewAmount}
                    >
                        <motion.div variants={text}>
                            <MarketingEyebrow tone="onDark">{t("approachEyebrow")}</MarketingEyebrow>
                            <div aria-hidden className="mt-8 hidden h-px w-16 bg-[#4d6b97] lg:block" />
                        </motion.div>
                        <motion.div variants={text} className="max-w-2xl">
                            <h2 className="font-display text-[34px] font-normal leading-[1.12] tracking-[-0.03em] md:text-[48px] md:leading-[1.08]">
                                {t("approachTitle")}
                            </h2>
                            <p className="mt-7 font-display text-[20px] font-light leading-[1.55] text-[#c4c4c4] md:mt-8 md:text-[24px]">
                                {t("approachBody")}
                            </p>
                        </motion.div>
                    </Reveal>
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-container px-4 py-20 md:px-8 md:py-28">
                <Reveal
                    className="grid gap-10 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,1fr)] lg:items-start lg:gap-20"
                    variants={sectionStagger}
                    amount={inViewAmount}
                >
                    <motion.div variants={text}>
                        <MarketingEyebrow>{t("originEyebrow")}</MarketingEyebrow>
                        <h2 className="mt-4 font-display text-[34px] font-normal leading-[1.1] tracking-[-0.03em] text-[#171717] md:mt-5 md:text-[48px]">
                            {t("originTitle")}
                        </h2>
                        <div aria-hidden className="mt-8 hidden h-px w-16 bg-[#4d6b97] lg:block" />
                    </motion.div>
                    <motion.div variants={text} className="max-w-2xl space-y-5">
                        <p className="text-base leading-relaxed text-[#404040] md:text-lg">
                            {t("originBody1")}
                        </p>
                        <p className="text-base leading-relaxed text-[#404040] md:text-lg">
                            {t("originBody2")}
                        </p>
                    </motion.div>
                </Reveal>
            </section>

            <section className="relative z-10 mx-auto max-w-container px-4 py-20 md:px-8 md:py-28">
                <Reveal
                    className="grid gap-10 border-t border-[#171717]/12 pt-14 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,1fr)] lg:items-start lg:gap-20 lg:pt-16"
                    variants={sectionStagger}
                    amount={inViewAmount}
                >
                    <motion.div variants={text}>
                        <MarketingEyebrow>{t("workEyebrow")}</MarketingEyebrow>
                        <h2 className="mt-4 font-display text-[34px] font-normal leading-[1.1] tracking-[-0.03em] text-[#171717] md:mt-5 md:text-[44px]">
                            {t("workTitle")}
                        </h2>
                    </motion.div>
                    <motion.div variants={text} className="max-w-2xl">
                        <p className="font-display text-[20px] font-light leading-relaxed text-[#525252] md:text-[22px]">
                            {t("workBody")}
                        </p>
                        <div className="mt-8">
                            <Link
                                href="/services"
                                className="group inline-flex items-center gap-2 text-base font-semibold text-[#4d6b97] transition-colors duration-100 ease-linear hover:text-[#253353] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]"
                            >
                                {t("workLink")}
                                <ArrowNarrowRight
                                    data-icon
                                    className="size-5 transition-transform duration-300 ease-out group-hover:translate-x-1"
                                    aria-hidden
                                />
                            </Link>
                        </div>
                    </motion.div>
                </Reveal>
            </section>

            <section className="relative z-10 mx-auto max-w-container px-4 pb-24 md:px-8 md:pb-32">
                <Reveal variants={sectionStagger} amount={inViewAmount}>
                    <MarketingCtaBand>
                        <motion.h2
                            variants={text}
                            className="max-w-xl font-display text-[28px] font-normal leading-[1.2] text-[#171717] md:text-[36px]"
                        >
                            {t("ctaTitle")}
                        </motion.h2>
                        <motion.p
                            variants={text}
                            className="mt-4 max-w-xl text-base leading-relaxed text-[#404040] md:text-lg"
                        >
                            {t("ctaBody")}
                        </motion.p>
                        <motion.div variants={text} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <CobreoButton
                                href="/contact"
                                size="xl"
                                iconLeading={<MessageChatSquare data-icon className="size-5" />}
                                analytics={{ ctaId: "about_contact", destination: "contact", surface: "about_cta" }}
                            >
                                {t("ctaContact")}
                            </CobreoButton>
                            <DiagnosticEntryButton
                                variant="ghost"
                                size="xl"
                                surface="about_cta"
                                ctaId="about_diagnostic"
                                className="!border-[#d4d4d4] !bg-white/80"
                                iconTrailing={<ArrowNarrowRight data-icon className="size-5" />}
                            />
                        </motion.div>
                    </MarketingCtaBand>
                </Reveal>
            </section>
        </div>
    );
}
