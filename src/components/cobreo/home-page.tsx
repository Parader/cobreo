"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ArrowNarrowRight, MessageChatSquare } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Link } from "@/i18n/navigation";

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0 },
};

export function HomePage() {
    const t = useTranslations("home");
    const reduce = useReducedMotion();

    const motionProps = reduce
        ? {}
        : {
              initial: "hidden" as const,
              whileInView: "show" as const,
              viewport: { once: true, amount: 0.2 },
              variants: fadeUp,
              transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
          };

    const values = [
        { title: t("value1Title"), body: t("value1Body") },
        { title: t("value2Title"), body: t("value2Body") },
        { title: t("value3Title"), body: t("value3Body") },
        { title: t("value4Title"), body: t("value4Body") },
        { title: t("value5Title"), body: t("value5Body") },
        { title: t("value6Title"), body: t("value6Body") },
    ];

    const process = [
        { label: t("identify"), src: "/images/process-identify.svg" },
        { label: t("validate"), src: "/images/process-validate.svg" },
        { label: t("develop"), src: "/images/process-develop.svg" },
        { label: t("evolve"), src: "/images/process-evolve.svg" },
    ];

    return (
        <div>
            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-[0.07] lg:block">
                    <div className="absolute right-[-10%] top-1/2 size-[720px] -translate-y-1/2 rounded-full border-[48px] border-brand-600" />
                </div>
                <div className="mx-auto flex max-w-container flex-col justify-center px-4 pb-24 pt-10 md:px-8 md:pb-40 md:pt-16">
                    <motion.div {...motionProps} className="flex max-w-4xl flex-col gap-6">
                        <h1 className="text-display-md font-normal tracking-tight text-primary md:text-display-xl">{t("heroTitle")}</h1>
                        <p className="max-w-3xl text-xl font-light leading-relaxed text-primary md:text-display-xs">{t("heroSubtitle")}</p>
                        <div>
                            <Button href="/contact" color="primary" size="xl" iconLeading={MessageChatSquare}>
                                {t("heroCta")}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="bg-cobreo-ink px-4 py-20 text-[#efedea] md:px-8 md:py-24">
                <div className="mx-auto flex max-w-container flex-col gap-16">
                    <motion.div {...motionProps} className="flex max-w-4xl flex-col gap-6">
                        <h2 className="text-display-sm font-normal tracking-tight md:text-display-lg">{t("processTitle")}</h2>
                        <p className="text-xl font-light leading-relaxed md:text-display-xs">{t("processSubtitle")}</p>
                        <div>
                            <Button href="/diagnostic" color="secondary" size="xl" iconTrailing={ArrowNarrowRight} className="!bg-[#efedea] !text-[#253353]">
                                {t("processCta")}
                            </Button>
                        </div>
                    </motion.div>
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {process.map((step, i) => (
                            <motion.div
                                key={step.label}
                                {...(reduce
                                    ? {}
                                    : {
                                          initial: { opacity: 0, y: 20 },
                                          whileInView: { opacity: 1, y: 0 },
                                          viewport: { once: true },
                                          transition: { delay: i * 0.08, duration: 0.45 },
                                      })}
                                className="flex flex-col items-start gap-4"
                            >
                                <div className="relative h-40 w-full max-w-[220px]">
                                    <Image src={step.src} alt="" fill className="object-contain object-left" />
                                </div>
                                <p className="text-xl font-light">{step.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-20 md:px-8 md:py-24">
                <div className="mx-auto grid max-w-container gap-12 lg:grid-cols-2 lg:gap-16">
                    <motion.div {...motionProps} className="flex flex-col gap-8">
                        <h2 className="text-display-sm font-normal tracking-tight text-primary md:text-display-md">{t("valueTitle")}</h2>
                        <ul className="flex flex-col gap-6">
                            {values.map((item) => (
                                <li key={item.title}>
                                    <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                                    <p className="mt-1 text-md text-tertiary">{item.body}</p>
                                </li>
                            ))}
                        </ul>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <p className="text-md text-secondary">{t("valueCtaPrompt")}</p>
                            <Button href="/contact" color="primary" size="lg">
                                {t("valueCta")}
                            </Button>
                        </div>
                    </motion.div>
                    <motion.div {...motionProps} className="relative min-h-[320px] overflow-hidden rounded-2xl shadow-xl lg:min-h-[520px]">
                        <Image src="/images/mockup-dashboard.png" alt="Cobreo application mockup" fill className="object-cover object-top" sizes="(max-width: 1024px) 100vw, 50vw" />
                    </motion.div>
                </div>
            </section>

            <section className="bg-cobreo-ink px-4 py-20 text-[#efedea] md:px-8 md:py-24">
                <motion.div {...motionProps} className="mx-auto flex max-w-3xl flex-col gap-6">
                    <h2 className="text-display-sm font-normal tracking-tight md:text-display-md">{t("philosophyTitle")}</h2>
                    <p className="text-lg font-light leading-relaxed text-white/80 md:text-xl">{t("philosophyBody")}</p>
                    <Link href="/a-propos" className="inline-flex items-center gap-2 text-md font-semibold text-white hover:opacity-80">
                        {t("philosophyLink")}
                        <ArrowNarrowRight className="size-5" />
                    </Link>
                </motion.div>
            </section>

            <section className="px-4 py-20 md:px-8 md:py-24">
                <motion.div {...motionProps} className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
                    <h2 className="text-display-sm font-normal text-primary md:text-display-md">{t("testimonialTitle")}</h2>
                    <blockquote className="text-xl font-light italic leading-relaxed text-secondary md:text-display-xs">“{t("testimonialQuote")}”</blockquote>
                    <div className="flex flex-col items-center gap-3">
                        <div className="relative size-14 overflow-hidden rounded-full">
                            <Image src="/images/avatar-adrian.png" alt={t("testimonialName")} fill className="object-cover" />
                        </div>
                        <div>
                            <p className="font-semibold text-primary">{t("testimonialName")}</p>
                            <p className="text-sm text-tertiary">{t("testimonialRole")}</p>
                        </div>
                        <div className="flex gap-1 text-brand-600" aria-label="5 stars">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i}>★</span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            <section className="px-4 pb-24 md:px-8">
                <motion.div
                    {...motionProps}
                    className="mx-auto flex max-w-container flex-col items-start justify-between gap-8 rounded-2xl bg-[#dfe3df] px-8 py-10 md:flex-row md:items-center md:px-12"
                >
                    <div className="max-w-xl">
                        <h2 className="text-display-xs font-semibold text-primary md:text-display-sm">{t("diagnosticTitle")}</h2>
                        <p className="mt-2 text-md text-tertiary">{t("diagnosticBody")}</p>
                    </div>
                    <Button href="/diagnostic" color="secondary" size="xl" iconTrailing={ArrowNarrowRight} className="!bg-white">
                        {t("diagnosticCta")}
                    </Button>
                </motion.div>
            </section>
        </div>
    );
}
