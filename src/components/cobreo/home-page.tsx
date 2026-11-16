import { getLocale, getTranslations } from "next-intl/server";
import { DemoButton } from "@/components/cobreo/marketing/demo-button";
import { HeroComposition } from "@/components/cobreo/marketing/hero-composition";
import { ModuleBento, type BentoItem } from "@/components/cobreo/marketing/module-bento";
import { ContrastBand } from "@/components/cobreo/marketing/contrast-band";
import { Rise } from "@/components/cobreo/marketing/rise";
import { stageCopy } from "@/components/cobreo/marketing/stage-copy";
import { Closing } from "@/components/cobreo/marketing/closing";

const leadIds = new Set(["crm", "events", "satisfaction", "booking"]);

export async function HomePage() {
    const t = await getTranslations("home");
    const modules = await getTranslations("modules");
    const locale = await getLocale();
    const copy = stageCopy(locale);
    const items = (modules.raw("items") as BentoItem[]).map((item) => ({ ...item, lead: leadIds.has(item.id) }));

    return (
        <div className="bg-[#f4f6f8] text-[#171717]">
            <section className="relative">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[920px] bg-[radial-gradient(ellipse_70%_45%_at_70%_20%,rgba(77,107,151,0.18),transparent_62%)]"
                />
                <div className="relative mx-auto max-w-[1200px] px-4 pt-6 pb-16 md:px-8 md:pt-10 md:pb-24">
                    <Rise>
                        <h1 className="max-w-[16ch] font-display text-[clamp(2.7rem,6.4vw,4.6rem)] leading-[0.98] font-medium tracking-[-0.034em] text-balance text-[#121212]">
                            {t("heroTitle")}
                        </h1>
                    </Rise>
                    <Rise delay={0.08}>
                        <p className="mt-5 max-w-[34rem] text-[clamp(1.15rem,2vw,1.45rem)] leading-snug font-normal tracking-[-0.02em] text-[#6e7278]">
                            {t("heroSubtitle")}
                        </p>
                    </Rise>
                    <Rise delay={0.16} className="mt-8">
                        <DemoButton ctaId="hero_demo" surface="home_hero">
                            {t("demoCta")}
                        </DemoButton>
                    </Rise>
                    <HeroComposition copy={copy} />
                </div>
            </section>

            <section className="mx-auto max-w-[1200px] px-4 py-16 md:px-8 md:py-24">
                <p className="text-[11px] font-medium tracking-[0.16em] text-[#4d6b97] uppercase">{t("modulesEyebrow")}</p>
                <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(2rem,4vw,3.15rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance">
                    {t("modulesTitle")}
                </h2>
                <p className="mt-4 max-w-md text-lg text-[#5c6168]">{t("modulesBody")}</p>
                <div className="mt-10">
                    <ModuleBento items={items} linkLabel={t("modulesLink")} linkHref="/modules" />
                </div>
            </section>

            <ContrastBand eyebrow={t("contrastEyebrow")} title={t("contrastTitle")} body={t("contrastBody")} copy={copy} />

            <Closing
                quote={t("quote")}
                name={t("quoteName")}
                role={t("quoteRole")}
                billing={t("billingTitle")}
                billingBody={t("billingBody")}
                trust={t("trustTitle")}
                trustBody={t("trustBody")}
                cta={t("demoCta")}
                ctaId="close_demo"
                surface="home_close"
            />
        </div>
    );
}
