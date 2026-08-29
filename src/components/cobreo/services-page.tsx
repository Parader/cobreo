"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { usePreferSimpleMotion } from "@/hooks/use-prefer-simple-motion";
import { ArrowNarrowRight, MessageChatSquare } from "@untitledui/icons";
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

export function ServicesPage() {
    const t = useTranslations("services");
    const reduce = usePreferSimpleMotion();
    const text = childReveal(reduce, "up");
    const heroStagger = staggerContainerSlow(reduce);
    const sectionStagger = staggerContainer(reduce, 0.14, 0.08);
    const listStagger = staggerContainer(reduce, 0.1, 0.04);
    const inViewAmount = 0.15;

    const steps = [
        { bold: t("step1Bold"), rest: t("step1Rest"), body: t("step1Body") },
        { bold: t("step2Bold"), rest: t("step2Rest"), body: t("step2Body") },
        { bold: t("step3Bold"), rest: t("step3Rest"), body: t("step3Body") },
        { bold: t("step4Bold"), rest: t("step4Rest"), body: t("step4Body") },
    ];

    const domains = [
        { title: t("domain1Title"), body: t("domain1Body"), hint: t("domain1Hint") },
        { title: t("domain2Title"), body: t("domain2Body"), hint: t("domain2Hint") },
        { title: t("domain3Title"), body: t("domain3Body"), hint: t("domain3Hint") },
        { title: t("domain4Title"), body: t("domain4Body"), hint: t("domain4Hint") },
        { title: t("domain5Title"), body: t("domain5Body"), hint: t("domain5Hint") },
        { title: t("domain6Title"), body: t("domain6Body"), hint: t("domain6Hint") },
    ];

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

            <section className="relative z-10 overflow-hidden bg-[#171718] text-[#efedea]">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(77,107,151,0.2),_transparent_55%)]"
                />
                <DarkLogoMosaic variant="edge-right" className="hidden md:block" />
                <div className="relative mx-auto max-w-container px-4 py-20 md:px-8 md:py-28">
                    <Reveal className="max-w-2xl" variants={sectionStagger} amount={inViewAmount}>
                        <motion.div variants={text}>
                            <MarketingEyebrow tone="onDark">{t("processEyebrow")}</MarketingEyebrow>
                        </motion.div>
                        <motion.h2
                            variants={text}
                            className="mt-4 font-display text-[34px] font-normal leading-[1.1] tracking-[-0.03em] md:mt-5 md:text-[48px]"
                        >
                            {t("processTitle")}
                        </motion.h2>
                        <motion.p
                            variants={text}
                            className="mt-5 max-w-xl font-display text-[20px] font-light leading-relaxed text-[#c4c4c4] md:text-[24px]"
                        >
                            {t("processBody")}
                        </motion.p>
                    </Reveal>

                    <Reveal
                        as="ol"
                        className="relative mt-14 grid gap-0 md:mt-20 md:grid-cols-2 md:gap-x-16"
                        variants={listStagger}
                        amount={inViewAmount}
                    >
                        <div
                            aria-hidden
                            className="pointer-events-none absolute top-3 bottom-3 left-[15px] w-px bg-gradient-to-b from-[#4d6b97] via-[#4d6b97]/30 to-transparent md:hidden"
                        />
                        {steps.map((step, i) => (
                            <motion.li
                                key={step.bold}
                                className="relative flex gap-5 border-b border-white/10 py-8 last:border-b-0 md:border-b-0 md:py-10"
                                variants={text}
                            >
                                <span className="relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full bg-[#253353] font-display text-sm font-medium tabular-nums text-[#a6b5cb] ring-1 ring-[#4d6b97]/35 md:mt-1 md:size-10 md:text-base">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <div className="min-w-0 pt-0.5">
                                    <h3 className="font-display text-[24px] font-normal leading-snug md:text-[28px]">
                                        <span className="font-medium text-[#efedea]">{step.bold}</span>{" "}
                                        <span className="font-light text-[#a3a3a3]">{step.rest}</span>
                                    </h3>
                                    <p className="mt-3 max-w-md text-base leading-relaxed text-[#a3a3a3]">
                                        {step.body}
                                    </p>
                                </div>
                            </motion.li>
                        ))}
                    </Reveal>
                </div>
            </section>

            <section className="relative z-10 mx-auto max-w-container px-4 py-20 md:px-8 md:py-28">
                <Reveal className="max-w-2xl" variants={sectionStagger} amount={inViewAmount}>
                    <motion.div variants={text}>
                        <MarketingEyebrow>{t("domainsEyebrow")}</MarketingEyebrow>
                    </motion.div>
                    <motion.h2
                        variants={text}
                        className="mt-4 font-display text-[34px] font-normal leading-[1.1] tracking-[-0.03em] text-[#171717] md:mt-5 md:text-[48px]"
                    >
                        {t("domainsTitle")}
                    </motion.h2>
                    <motion.p
                        variants={text}
                        className="mt-5 font-display text-[20px] font-light leading-relaxed text-[#525252] md:text-[22px]"
                    >
                        {t("domainsBody")}
                    </motion.p>
                </Reveal>

                <Reveal
                    as="ul"
                    className="mt-12 border-t border-[#171717]/12 md:mt-16"
                    variants={listStagger}
                    amount={inViewAmount}
                >
                    {domains.map((domain) => (
                        <motion.li
                            key={domain.title}
                            variants={text}
                            className="grid gap-3 border-b border-[#171717]/12 py-8 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] md:items-start md:gap-12 md:py-10"
                        >
                            <h3 className="font-display text-[22px] font-normal leading-snug text-[#171717] md:text-[26px]">
                                {domain.title}
                            </h3>
                            <div className="max-w-xl">
                                <p className="text-base leading-relaxed text-[#404040]">{domain.body}</p>
                                <p className="mt-2 text-sm leading-relaxed text-[#737373]">{domain.hint}</p>
                            </div>
                        </motion.li>
                    ))}
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
                                analytics={{ ctaId: "services_contact", destination: "contact", surface: "services_cta" }}
                            >
                                {t("ctaContact")}
                            </CobreoButton>
                            <DiagnosticEntryButton
                                variant="ghost"
                                size="xl"
                                surface="services_cta"
                                ctaId="services_diagnostic"
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
