import { getLocale, getTranslations } from "next-intl/server";
import { DemoButton } from "@/components/cobreo/marketing/demo-button";
import { HeroComposition } from "@/components/cobreo/marketing/hero-composition";
import { ModuleBento, type BentoItem } from "@/components/cobreo/marketing/module-bento";
import { ContrastBand } from "@/components/cobreo/marketing/contrast-band";
import { Advantages, type AdvantageItem } from "@/components/cobreo/marketing/advantages";
import { Rise } from "@/components/cobreo/marketing/rise";
import { stageCopy } from "@/components/cobreo/marketing/stage-copy";
import { Closing } from "@/components/cobreo/marketing/closing";

export async function HomePage() {
    const t = await getTranslations("home");
    const modules = await getTranslations("modules");
    const locale = await getLocale();
    const copy = stageCopy(locale);
    const items = modules.raw("items") as BentoItem[];
    const advantages = t.raw("advantages") as AdvantageItem[];

    return (
        <div className="bg-[#f4f6f8] text-[#171717]">
            <section className="relative">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[980px] bg-[radial-gradient(ellipse_65%_42%_at_72%_18%,rgba(77,107,151,0.2),transparent_64%)]"
                />
                <div className="relative mx-auto max-w-[1200px] px-4 pt-8 pb-20 md:px-8 md:pt-14 md:pb-28">
                    <Rise>
                        <h1 className="max-w-[11.5em] font-display text-[clamp(2.6rem,5.4vw,4.6rem)] leading-[1.02] font-medium tracking-[-0.036em] text-[#121212] md:max-w-[18.5em]">
                            <span className="md:whitespace-nowrap">{t("heroTitleLine1")}</span>
                            <br className="hidden md:block" />
                            <span className="md:whitespace-nowrap"> {t("heroTitleLine2")}</span>
                        </h1>
                    </Rise>
                    <Rise delay={0.08}>
                        <p className="mt-6 max-w-[36rem] text-[clamp(1.05rem,1.7vw,1.2rem)] leading-[1.55] font-normal tracking-[-0.01em] text-[#6e7278]">
                            {t("heroSubtitle")}
                        </p>
                    </Rise>
                    <Rise delay={0.16} className="mt-9">
                        <DemoButton ctaId="hero_demo" surface="home_hero">
                            {t("demoCta")}
                        </DemoButton>
                    </Rise>
                    <div className="mt-12 md:mt-14">
                        <HeroComposition copy={copy} />
                    </div>
                </div>
            </section>

            <section id="modules" className="relative scroll-mt-28 overflow-x-clip bg-[#efedea] py-16 sm:py-20 md:scroll-mt-32 md:py-24 lg:py-[120px]">
                <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
                    <div className="mb-8 flex max-w-4xl flex-col gap-3 sm:mb-10 md:mb-12 md:gap-4 lg:mb-14">
                        <p className="text-sm font-semibold tracking-[0.1em] text-[#4d6b97] uppercase">{t("modulesEyebrow")}</p>
                        <h2 className="max-w-[18ch] font-display text-[clamp(1.75rem,4vw,3rem)] font-normal tracking-[-0.96px] text-[#090a24] md:leading-[1.2]">
                            {t("modulesTitle")}
                        </h2>
                        <p className="max-w-3xl font-display text-[clamp(1.05rem,2.2vw,1.5rem)] font-light leading-[1.4] text-[#090a24]">
                            {t("modulesLede")}
                        </p>
                    </div>
                    <ModuleBento items={items} />
                </div>
            </section>

            <ContrastBand
                eyebrow={t("contrastEyebrow")}
                title={t("contrastTitle")}
                body={t("contrastBody")}
                body2={t("contrastBody2")}
                copy={copy}
            />

            <Advantages title={t("advantagesTitle")} items={advantages} />

            <Closing
                quote={t("quote")}
                name={t("quoteName")}
                role={t("quoteRole")}
                cta={t("demoCta")}
                ctaId="close_demo"
                surface="home_close"
            />
        </div>
    );
}
