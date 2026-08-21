"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { usePreferSimpleMotion } from "@/hooks/use-prefer-simple-motion";
import { ArrowNarrowRight, Mail01 } from "@untitledui/icons";
import { ContactForm } from "@/components/cobreo/contact-form";
import { DiagnosticEntryButton } from "@/components/cobreo/diagnostic/diagnostic-entry-button";
import {
    MarketingAtmosphere,
    MarketingEyebrow,
} from "@/components/cobreo/marketing-page-chrome";
import { childReveal, staggerContainer, staggerContainerSlow } from "@/components/cobreo/motion";

export function ContactPage() {
    const t = useTranslations("contact");
    const reduce = usePreferSimpleMotion();
    const text = childReveal(reduce, "up");
    const heroStagger = staggerContainerSlow(reduce);
    const bodyStagger = staggerContainer(reduce, 0.16, 0.2);

    return (
        <div className="relative overflow-x-clip bg-[#efedea]">
            <MarketingAtmosphere />

            <div className="relative z-10 mx-auto max-w-container px-4 pb-24 pt-12 md:px-8 md:pb-32 md:pt-16">
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
                        {t("subtitle")}
                    </motion.p>
                    <motion.div
                        variants={text}
                        aria-hidden
                        className="mt-10 h-px w-24 bg-gradient-to-r from-[#4d6b97] to-transparent"
                    />
                </motion.div>

                <motion.div
                    className="mt-14 grid items-start gap-14 lg:mt-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.7fr)] lg:gap-20"
                    variants={bodyStagger}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div className="relative max-w-xl" variants={text}>
                        <h2 className="font-display text-[28px] font-normal leading-tight text-[#171717] md:text-[34px]">
                            {t("formTitle")}
                        </h2>
                        <p className="mt-3 text-sm text-[#737373]">{t("requiredNote")}</p>
                        <div className="mt-8">
                            <ContactForm />
                        </div>
                    </motion.div>

                    <motion.aside
                        className="relative border-t border-[#171717]/12 pt-10 lg:sticky lg:top-28 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10"
                        variants={text}
                        aria-label={t("sideTitle")}
                    >
                        <h2 className="font-display text-[24px] font-normal text-[#171717] md:text-[28px]">
                            {t("sideTitle")}
                        </h2>

                        <div className="mt-8 space-y-9">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#4d6b97]/12 text-[#4d6b97]">
                                        <Mail01 className="size-4" aria-hidden />
                                    </span>
                                    <p className="text-sm font-semibold tracking-wide text-[#737373] uppercase">
                                        {t("sideEmailLabel")}
                                    </p>
                                </div>
                                <a
                                    href={`mailto:${t("sideEmail")}`}
                                    className="mt-3 inline-block text-lg text-[#171717] transition-colors duration-100 ease-linear hover:text-[#4d6b97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]"
                                >
                                    {t("sideEmail")}
                                </a>
                            </div>

                            <div className="border-t border-[#171717]/10 pt-8">
                                <p className="text-sm font-semibold tracking-wide text-[#737373] uppercase">
                                    {t("sideDiagnosticLabel")}
                                </p>
                                <p className="mt-3 text-base leading-relaxed text-[#525252]">
                                    {t("sideDiagnosticBody")}
                                </p>
                                <div className="mt-5">
                                    <DiagnosticEntryButton
                                        variant="secondary"
                                        size="md"
                                        surface="contact_sidebar"
                                        ctaId="contact_side_diagnostic"
                                        idleLabel={t("sideDiagnosticCta")}
                                        iconTrailing={<ArrowNarrowRight data-icon className="size-4" />}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                </motion.div>
            </div>
        </div>
    );
}
