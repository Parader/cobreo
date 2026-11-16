import { getTranslations } from "next-intl/server";
import { ArrowNarrowRight } from "@untitledui/icons";
import { Link } from "@/i18n/navigation";
import { DemoButton } from "@/components/cobreo/marketing/demo-button";
import { Enter } from "@/components/cobreo/marketing/enter";
import { CopyBlock, Section } from "@/components/cobreo/marketing/section";
import {
    CalendarScene,
    ModulePickerScene,
    RecordScene,
    ThreadScene,
    type SceneRow,
} from "@/components/cobreo/marketing/scenes";
import { DiagnosticEntryButton } from "@/components/cobreo/diagnostic/diagnostic-entry-button";

function rows(value: unknown): SceneRow[] {
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const row = item as SceneRow;
        if (typeof row.title !== "string") return [];
        return [row];
    });
}

export async function HomePage() {
    const t = await getTranslations("home");
    const scene = await getTranslations("scenes");
    const columns = scene.raw("columns") as [string, string, string];
    const nav = (scene.raw("nav") as string[]).map((label, index) => ({ label, current: index === 0 }));

    return (
        <div className="bg-[#efedea] text-[#171717]">
            <section className="mx-auto grid w-full max-w-container items-center gap-12 px-4 pt-8 pb-16 md:px-8 md:pt-14 md:pb-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
                <div className="max-w-xl min-w-0">
                    <h1 className="font-display text-[clamp(2rem,4.6vw,3.25rem)] font-normal leading-[1.15] tracking-[-0.03em] text-balance text-[#171717]">
                        {t("heroTitle")}
                    </h1>
                    <p className="mt-5 text-lg leading-relaxed font-light text-pretty text-[#404040] md:text-xl">
                        {t("heroSubtitle")}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
                    </div>
                </div>
                <div className="cobreo-live">
                    <RecordScene label={scene("crmLabel")} nav={nav} columns={columns} rows={rows(scene.raw("crm"))} search={scene("search")} />
                </div>
            </section>

            <Section title={t("catalogTitle")} body={t("catalogBody")}>
                <ModulePickerScene
                    label={scene("catalogLabel")}
                    onLabel={scene("on")}
                    offLabel={scene("off")}
                    items={scene.raw("picker") as Array<{ name: string; state: "on" | "off" | "turn-on" }>}
                    search={scene("search")}
                />
                <Link
                    href="/modules"
                    className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-[#253353] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]"
                >
                    {t("catalogLink")}
                    <ArrowNarrowRight className="size-5" aria-hidden />
                </Link>
            </Section>

            <Section title={t("depthTitle")} body={t("depthBody")}>
                <CalendarScene
                    label={scene("calendarLabel")}
                    days={scene.raw("days") as string[]}
                    items={scene.raw("calendar") as Array<{ day: number; time: string; title: string; appear?: boolean }>}
                    search={scene("search")}
                />
            </Section>

            <Section title={t("customTitle")} body={t("customBody")}>
                <RecordScene
                    label={scene("customLabel")}
                    columns={scene.raw("customColumns") as [string, string, string]}
                    rows={rows(scene.raw("custom"))}
                    search={scene("search")}
                />
            </Section>

            <Section title={t("storeTitle")} body={t("storeBody")}>
                <RecordScene
                    label={scene("storeLabel")}
                    columns={scene.raw("storeColumns") as [string, string, string]}
                    rows={rows(scene.raw("store"))}
                    search={scene("search")}
                />
            </Section>

            <Section title={t("assistantTitle")} body={t("assistantBody")}>
                <ThreadScene label={scene("assistantLabel")} prompt={scene("assistantPrompt")} reply={scene("assistantReply")} search={scene("search")} />
            </Section>

            <Section title={t("billingTitle")} body={t("billingBody")}>
                <RecordScene
                    label={scene("billingLabel")}
                    columns={scene.raw("billingColumns") as [string, string, string]}
                    rows={rows(scene.raw("billing"))}
                    search={scene("search")}
                />
            </Section>

            <Enter className="mx-auto w-full max-w-container px-4 py-8 md:px-8 md:py-12">
                <section className="max-w-2xl min-w-0 border-t border-[#171717]/10 pt-10">
                    <h2 className="font-display text-[clamp(1.75rem,3.2vw,2.5rem)] font-normal leading-[1.2] tracking-[-0.02em] text-balance">
                        {t("trustTitle")}
                    </h2>
                    <p className="mt-4 text-lg leading-relaxed font-light text-pretty text-[#404040]">{t("trustBody")}</p>
                </section>
            </Enter>

            <Enter className="mx-auto w-full max-w-container px-4 py-16 md:px-8 md:py-24">
                <figure className="max-w-3xl min-w-0">
                    <blockquote>
                        <p className="font-display text-[clamp(1.35rem,2.6vw,1.85rem)] leading-[1.35] font-light text-pretty text-[#171717]">
                            « {t("quote")} »
                        </p>
                    </blockquote>
                    <figcaption className="mt-6">
                        <p className="text-base font-semibold">{t("quoteName")}</p>
                        <p className="text-base text-[#525252]">{t("quoteRole")}</p>
                    </figcaption>
                </figure>
            </Enter>

            <Enter className="mx-auto w-full max-w-container px-4 pt-4 pb-24 md:px-8 md:pb-32">
                <section className="border-t border-[#171717]/10 pt-16">
                    <CopyBlock title={t("closeTitle")} body={t("closeBody")} />
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
            </Enter>
        </div>
    );
}
