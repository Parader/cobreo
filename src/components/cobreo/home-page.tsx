import { getLocale, getTranslations } from "next-intl/server";
import { DemoButton } from "@/components/cobreo/marketing/demo-button";
import { HeroAssistant, type HeroChrome, type HeroScenario } from "@/components/cobreo/marketing/hero-assistant";
import { ModuleBento, type BentoItem } from "@/components/cobreo/marketing/module-bento";
import { ContrastBand } from "@/components/cobreo/marketing/contrast-band";
import { Advantages, type AdvantageItem } from "@/components/cobreo/marketing/advantages";
import { PlatformFeatures, type PlatformFeatureItem } from "@/components/cobreo/marketing/platform-features";
import { Integrations, type IntegrationItem } from "@/components/cobreo/marketing/integrations";
import { HeroMark } from "@/components/cobreo/marketing/hero-mark";
import { Rise } from "@/components/cobreo/marketing/rise";
import { Closing } from "@/components/cobreo/marketing/closing";
import { FaqSection, type FaqSectionItem } from "@/components/cobreo/marketing/faq-section";
import { faqPageJsonLd } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";

export async function HomePage() {
    const t = await getTranslations("home");
    const modules = await getTranslations("modules");
    const locale = await getLocale();
    const items = (modules.raw("items") as BentoItem[]).filter((item) => item.id !== "tasks");
    const advantages = t.raw("advantages") as AdvantageItem[];
    const platformFeatures = t.raw("platformFeatures") as PlatformFeatureItem[];
    const integrations = t.raw("integrations") as IntegrationItem[];
    const faq = t.raw("faq") as FaqSectionItem[];

    return (
        <div className="bg-white text-[#171717]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(locale as Locale, faq)) }}
            />
            {/* Pulled under the fixed header so the hero wash reaches the top edge (no seam while the header is transparent). */}
            <section className="relative -mt-20 overflow-hidden bg-white pt-20 md:-mt-24 md:pt-24">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[min(90vh,920px)] bg-[radial-gradient(ellipse_78%_58%_at_12%_-8%,rgba(77,107,151,0.18),transparent_58%),radial-gradient(ellipse_64%_46%_at_96%_8%,rgba(177,182,166,0.28),transparent_54%)]"
                />
                <HeroMark className="-right-[48%] top-[34%] h-[300px] w-[510px] md:-right-[7%] md:top-[10%] md:h-[600px] md:w-[1020px]" />
                <div className="relative isolate mx-auto max-w-[1200px] px-4 pt-8 pb-20 md:px-8 md:pt-14 md:pb-28">
                    {/* Phones: a soft light veil behind the copy pales the symbol where it crosses the text. */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -inset-x-4 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_95%_75%_at_30%_42%,rgba(255,255,255,0.92),rgba(255,255,255,0.6)_55%,transparent_85%)] md:hidden"
                    />
                    <Rise>
                        <h1 className="max-w-[11.5em] font-display text-[clamp(2.6rem,5.4vw,4.6rem)] leading-[1.02] font-normal tracking-[-0.036em] text-[#090a24] md:max-w-[18.5em]">
                            <span className="md:whitespace-nowrap">{t("heroTitleLine1")}</span>
                            <br className="hidden md:block" />
                            <span className="md:whitespace-nowrap"> {t("heroTitleLine2")}</span>
                        </h1>
                    </Rise>
                    <Rise delay={0.08}>
                        <p className="mt-6 max-w-[36rem] text-[clamp(1.05rem,1.7vw,1.2rem)] leading-[1.55] font-normal tracking-[-0.01em] text-[#525252]">
                            {t("heroSubtitle")}
                        </p>
                    </Rise>
                    <Rise delay={0.16} className="mt-9">
                        <DemoButton ctaId="hero_demo" surface="home_hero">
                            {t("demoCta")}
                        </DemoButton>
                    </Rise>
                    <div className="mt-12 md:mt-14">
                        <HeroAssistant
                            chrome={t.raw("heroChrome") as HeroChrome}
                            sendLabel={t("heroAssistantSend")}
                            scenariosLabel={t("heroScenariosLabel")}
                            scenarios={t.raw("heroScenarios") as HeroScenario[]}
                            moduleNames={Object.fromEntries(items.map(({ id, name }) => [id, name]))}
                        />
                    </div>
                </div>
            </section>

            <section id="modules" className="relative scroll-mt-28 overflow-x-clip bg-white py-16 sm:py-20 md:scroll-mt-32 md:py-24 lg:py-28 xl:py-[120px]">
                <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
                    <div className="mb-8 flex max-w-4xl flex-col gap-4 sm:mb-10 md:mb-12 lg:mb-14">
                        <h2 className="max-w-[22ch] font-display text-[clamp(2rem,4.4vw,3rem)] leading-[1.08] font-normal tracking-[-0.03em] text-balance text-[#090a24] md:leading-[1.15]">
                            {t("modulesTitle")}
                        </h2>
                        <p className="max-w-[40rem] text-[clamp(1.05rem,1.9vw,1.25rem)] leading-[1.5] text-pretty text-[#525252]">
                            {t("modulesLede")}
                        </p>
                    </div>
                </div>
                {/* Full-bleed shell so the illustration can anchor to the viewport edge */}
                <ModuleBento items={items} demoLabel={modules("demoLink")} />
            </section>

            <PlatformFeatures
                title={t("platformFeaturesTitle")}
                lede={t("platformFeaturesLede")}
                items={platformFeatures}
            />

            <Integrations title={t("integrationsTitle")} lede={t("integrationsLede")} items={integrations} />

            <ContrastBand
                title={t("contrastTitle")}
                body={t("contrastBody")}
                body2={t("contrastBody2")}
                cta={{ label: t("contrastCta"), href: "/contact" }}
                modules={items.map(({ id, name }) => ({ id, name }))}
                customLabel={t("contrastCustomTile")}
            />

            <Advantages title={t("advantagesTitle")} items={advantages} />

            <FaqSection title={t("faqTitle")} lede={t("faqLede")} items={faq} />

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
