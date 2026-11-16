import dynamic from "next/dynamic";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowNarrowRight } from "@untitledui/icons";
import { DemoButton } from "@/components/cobreo/marketing/demo-button";
import { HeroComposition } from "@/components/cobreo/marketing/hero-composition";
import { ModuleBento, type BentoItem } from "@/components/cobreo/marketing/module-bento";
import { ContrastBand } from "@/components/cobreo/marketing/contrast-band";
import { Rise } from "@/components/cobreo/marketing/rise";
import { stageCopy } from "@/components/cobreo/marketing/stage-copy";
import { DiagnosticEntryButton } from "@/components/cobreo/diagnostic/diagnostic-entry-button";

const ModuleSwitcher = dynamic(
    () => import("@/components/cobreo/marketing/module-switcher").then((mod) => mod.ModuleSwitcher),
    { loading: () => <div className="min-h-[480px]" /> },
);

const leadIds = new Set(["crm", "events", "satisfaction", "booking"]);

export async function HomePage() {
    const t = await getTranslations("home");
    const modules = await getTranslations("modules");
    const locale = await getLocale();
    const copy = stageCopy(locale);
    const items = (modules.raw("items") as BentoItem[]).map((item) => ({ ...item, lead: leadIds.has(item.id) }));
    const tabs = items.filter((item) => item.lead).map((item) => item.name);

    return (
        <div className="bg-[#f3f1ec] text-[#171717]">
            <section className="relative">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[780px] bg-[radial-gradient(ellipse_70%_50%_at_75%_30%,rgba(77,107,151,0.22),transparent_60%),radial-gradient(ellipse_40%_40%_at_10%_80%,rgba(177,182,166,0.28),transparent_60%)]"
                />
                <div className="relative mx-auto max-w-[1200px] px-4 pt-6 md:px-8 md:pt-10">
                    <Rise>
                        <h1 className="max-w-[16ch] font-display text-[clamp(2.7rem,6.4vw,4.6rem)] leading-[0.98] font-medium tracking-[-0.034em] text-balance text-[#121212]">
                            {t("heroTitle")}
                        </h1>
                    </Rise>
                    <Rise delay={0.08}>
                        <p className="mt-5 max-w-[34rem] text-[clamp(1.15rem,2vw,1.45rem)] leading-snug font-normal tracking-[-0.02em] text-[#8a8680]">
                            {t("heroSubtitle")}
                        </p>
                    </Rise>
                    <Rise delay={0.16} className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <DemoButton ctaId="hero_demo" surface="home_hero">
                            {t("demoCta")}
                        </DemoButton>
                        <DiagnosticEntryButton
                            variant="ghost"
                            size="xl"
                            surface="home_hero"
                            ctaId="hero_diagnostic"
                            glaze={false}
                            idleLabel={t("diagnosticCta")}
                            iconTrailing={<ArrowNarrowRight className="size-5 opacity-60" />}
                        />
                    </Rise>
                    <HeroComposition copy={copy} />
                </div>
            </section>

            <section className="mx-auto max-w-[1200px] px-4 py-20 md:px-8 md:py-28">
                <p className="text-[11px] font-medium tracking-[0.16em] text-[#4d6b97] uppercase">{t("catalogEyebrow")}</p>
                <h2 className="mt-3 max-w-[16ch] font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance">
                    {t("catalogTitle")}
                </h2>
                <p className="mt-4 max-w-md text-lg text-[#5c5954]">{t("catalogBody")}</p>
                <div className="mt-10">
                    <ModuleBento items={items} linkLabel={t("catalogLink")} linkHref="/modules" />
                </div>
            </section>

            <section className="mx-auto max-w-[1200px] px-4 pb-20 md:px-8 md:pb-28">
                <p className="text-[11px] font-medium tracking-[0.16em] text-[#4d6b97] uppercase">{t("stageEyebrow")}</p>
                <h2 className="mt-3 max-w-[18ch] font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance">
                    {t("stageTitle")}
                </h2>
                <p className="mt-4 mb-8 max-w-md text-lg text-[#5c5954]">{t("stageBody")}</p>
                <ModuleSwitcher copy={copy} label={t("stageTitle")} tabs={tabs} />
            </section>

            <ContrastBand eyebrow={t("contrastEyebrow")} title={t("contrastTitle")} body={t("contrastBody")} copy={copy} />

            <section className="mx-auto grid max-w-[1200px] gap-10 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-2">
                <div>
                    <h2 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.03em] text-balance">
                        {t("billingTitle")}
                    </h2>
                    <p className="mt-3 max-w-md text-lg text-[#5c5954]">{t("billingBody")}</p>
                </div>
                <div className="flex flex-col justify-end">
                    <p className="text-[11px] font-medium tracking-[0.16em] text-[#4d6b97] uppercase">{t("trustTitle")}</p>
                    <p className="mt-3 font-display text-[clamp(1.8rem,3vw,2.5rem)] leading-[1.1] font-medium tracking-[-0.03em]">
                        {t("trustBody")}
                    </p>
                </div>
            </section>

            <section className="mx-auto max-w-[900px] px-4 pb-8 md:px-8">
                <blockquote>
                    <p className="font-display text-[clamp(1.5rem,3vw,2.15rem)] leading-[1.25] font-medium tracking-[-0.03em] text-pretty">
                        « {t("quote")} »
                    </p>
                </blockquote>
                <p className="mt-6 text-sm font-semibold">{t("quoteName")}</p>
                <p className="text-sm text-[#6d6a64]">{t("quoteRole")}</p>
            </section>

            <section className="mx-auto max-w-[1200px] px-4 py-20 md:px-8 md:py-28">
                <h2 className="max-w-[16ch] font-display text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance">
                    {t("closeTitle")}
                </h2>
                <p className="mt-4 max-w-md text-lg text-[#5c5954]">{t("closeBody")}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <DemoButton ctaId="close_demo" surface="home_close">
                        {t("demoCta")}
                    </DemoButton>
                    <DiagnosticEntryButton
                        variant="ghost"
                        size="xl"
                        surface="home_close"
                        ctaId="close_diagnostic"
                        glaze={false}
                        idleLabel={t("diagnosticCta")}
                        iconTrailing={<ArrowNarrowRight className="size-5 opacity-60" />}
                    />
                </div>
            </section>
        </div>
    );
}
