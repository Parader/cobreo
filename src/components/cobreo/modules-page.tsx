import dynamic from "next/dynamic";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowNarrowRight } from "@untitledui/icons";
import { DemoButton } from "@/components/cobreo/marketing/demo-button";
import { ModuleBento, type BentoItem } from "@/components/cobreo/marketing/module-bento";
import { ContrastBand } from "@/components/cobreo/marketing/contrast-band";
import { stageCopy } from "@/components/cobreo/marketing/stage-copy";
import { DiagnosticEntryButton } from "@/components/cobreo/diagnostic/diagnostic-entry-button";

const ModuleSwitcher = dynamic(
    () => import("@/components/cobreo/marketing/module-switcher").then((mod) => mod.ModuleSwitcher),
    { loading: () => <div className="min-h-[480px]" /> },
);

const leadIds = new Set(["crm", "events", "satisfaction", "booking"]);

export async function ModulesPage() {
    const t = await getTranslations("modules");
    const home = await getTranslations("home");
    const locale = await getLocale();
    const copy = stageCopy(locale);
    const items = (t.raw("items") as BentoItem[]).map((item) => ({ ...item, lead: leadIds.has(item.id) }));
    const tabs = items.filter((item) => item.lead).map((item) => item.name);

    return (
        <div className="bg-[#f3f1ec] text-[#171717]">
            <section className="mx-auto max-w-[1200px] px-4 pt-8 md:px-8 md:pt-14">
                <p className="text-[11px] font-medium tracking-[0.16em] text-[#4d6b97] uppercase">{home("catalogEyebrow")}</p>
                <h1 className="mt-3 max-w-[14ch] font-display text-[clamp(2.7rem,6vw,4.4rem)] leading-[0.98] font-medium tracking-[-0.034em] text-balance">
                    {t("title")}
                </h1>
                <p className="mt-4 max-w-md text-lg text-[#5c5954]">{t("body")}</p>
                <div className="mt-10">
                    <ModuleBento items={items} />
                </div>
            </section>

            <section className="mx-auto max-w-[1200px] px-4 py-20 md:px-8 md:py-28">
                <h2 className="max-w-[16ch] font-display text-[clamp(2rem,4vw,3.1rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance">
                    {home("stageTitle")}
                </h2>
                <p className="mt-4 mb-8 max-w-md text-lg text-[#5c5954]">{home("stageBody")}</p>
                <ModuleSwitcher copy={copy} label={home("stageTitle")} tabs={tabs} />
            </section>

            <ContrastBand eyebrow={home("contrastEyebrow")} title={t("extendTitle")} body={t("extendBody")} copy={copy} />

            <section className="mx-auto max-w-[1200px] px-4 py-20 md:px-8 md:py-28">
                <h2 className="max-w-[16ch] font-display text-[clamp(2rem,4vw,3.1rem)] leading-[1.05] font-medium tracking-[-0.03em] text-balance">
                    {home("closeTitle")}
                </h2>
                <p className="mt-4 max-w-md text-lg text-[#5c5954]">{home("closeBody")}</p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <DemoButton ctaId="modules_demo" surface="modules_close">
                        {home("demoCta")}
                    </DemoButton>
                    <DiagnosticEntryButton
                        variant="ghost"
                        size="xl"
                        surface="modules_close"
                        ctaId="modules_diagnostic"
                        glaze={false}
                        idleLabel={home("diagnosticCta")}
                        iconTrailing={<ArrowNarrowRight className="size-5 opacity-60" />}
                    />
                </div>
            </section>
        </div>
    );
}
