import { getLocale, getTranslations } from "next-intl/server";
import { ModuleBento, type BentoItem } from "@/components/cobreo/marketing/module-bento";
import { ContrastBand } from "@/components/cobreo/marketing/contrast-band";
import { stageCopy } from "@/components/cobreo/marketing/stage-copy";
import { Closing } from "@/components/cobreo/marketing/closing";

const leadIds = new Set(["crm", "events", "satisfaction", "booking"]);

export async function ModulesPage() {
    const t = await getTranslations("modules");
    const home = await getTranslations("home");
    const locale = await getLocale();
    const copy = stageCopy(locale);
    const items = (t.raw("items") as BentoItem[]).map((item) => ({ ...item, lead: leadIds.has(item.id) }));

    return (
        <div className="bg-[#f4f6f8] text-[#171717]">
            <section className="mx-auto max-w-[1200px] px-4 pt-8 md:px-8 md:pt-14">
                <p className="text-[11px] font-medium tracking-[0.16em] text-[#4d6b97] uppercase">{home("modulesEyebrow")}</p>
                <h1 className="mt-3 max-w-[14ch] font-display text-[clamp(2.7rem,6vw,4.4rem)] leading-[0.98] font-medium tracking-[-0.034em] text-balance">
                    {t("title")}
                </h1>
                <p className="mt-4 max-w-md text-lg text-[#5c6168]">{t("body")}</p>
                <div className="mt-10">
                    <ModuleBento items={items} />
                </div>
            </section>

            <div className="mt-16 md:mt-24">
                <ContrastBand eyebrow={home("contrastEyebrow")} title={t("extendTitle")} body={t("extendBody")} copy={copy} />
            </div>

            <Closing
                quote={home("quote")}
                name={home("quoteName")}
                role={home("quoteRole")}
                billing={home("billingTitle")}
                billingBody={home("billingBody")}
                trust={home("trustTitle")}
                trustBody={home("trustBody")}
                cta={home("demoCta")}
                ctaId="modules_demo"
                surface="modules_close"
            />
        </div>
    );
}
