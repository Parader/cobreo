import { getTranslations } from "next-intl/server";
import { ArrowNarrowRight } from "@untitledui/icons";
import { DemoButton } from "@/components/cobreo/marketing/demo-button";
import { Enter } from "@/components/cobreo/marketing/enter";
import { CopyBlock, Section } from "@/components/cobreo/marketing/section";
import {
    CalendarScene,
    EventListScene,
    RecordScene,
    SurveyScene,
    type SceneRow,
} from "@/components/cobreo/marketing/scenes";
import { DiagnosticEntryButton } from "@/components/cobreo/diagnostic/diagnostic-entry-button";

type ModuleItem = {
    id: string;
    name: string;
    summary: string;
    scene: "crm" | "events" | "survey" | "calendar" | "records";
};

function rows(value: unknown): SceneRow[] {
    if (!Array.isArray(value)) return [];
    return value.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const row = item as SceneRow;
        if (typeof row.title !== "string") return [];
        return [row];
    });
}

function SceneFor({ item, scene }: { item: ModuleItem; scene: Awaited<ReturnType<typeof getTranslations>> }) {
    const nav = [{ label: item.name, current: true }];
    if (item.scene === "crm") {
        return (
            <RecordScene
                label={item.name}
                nav={nav}
                columns={scene.raw("columns") as [string, string, string]}
                rows={rows(scene.raw("crm"))}
                search={scene("search")}
            />
        );
    }
    if (item.scene === "events") {
        return <EventListScene label={item.name} rows={rows(scene.raw("events"))} search={scene("search")} />;
    }
    if (item.scene === "survey") {
        return (
            <SurveyScene
                label={item.name}
                question={scene("surveyQuestion")}
                rows={scene.raw("survey") as Array<{ name: string; text: string; appear?: boolean }>}
                search={scene("search")}
            />
        );
    }
    if (item.scene === "calendar") {
        return (
            <CalendarScene
                label={item.name}
                days={scene.raw("days") as string[]}
                items={scene.raw("calendar") as Array<{ day: number; time: string; title: string; appear?: boolean }>}
                search={scene("search")}
            />
        );
    }
    const block = scene.raw(`records.${item.id}`) as { columns: [string, string, string]; rows: SceneRow[] };
    return <RecordScene label={item.name} nav={nav} columns={block.columns} rows={rows(block.rows)} search={scene("search")} />;
}

export async function ModulesPage() {
    const t = await getTranslations("modules");
    const scene = await getTranslations("scenes");
    const home = await getTranslations("home");
    const items = t.raw("items") as ModuleItem[];
    const lead = items.filter((item) => ["crm", "events", "satisfaction", "booking"].includes(item.id));
    const rest = items.filter((item) => !["crm", "events", "satisfaction", "booking"].includes(item.id));

    return (
        <div className="bg-[#efedea] text-[#171717]">
            <section className="mx-auto w-full max-w-container px-4 pt-8 pb-4 md:px-8 md:pt-14">
                <CopyBlock as="h1" title={t("title")} body={t("body")} />
            </section>

            {lead.map((item) => (
                <Section key={item.id} title={item.name} body={item.summary}>
                    <SceneFor item={item} scene={scene} />
                </Section>
            ))}

            <Enter className="mx-auto w-full max-w-container px-4 py-16 md:px-8 md:py-24">
                <section>
                    <CopyBlock title={t("restTitle")} body={t("restBody")} />
                    <div className="mt-10 grid gap-10 lg:grid-cols-2">
                        {rest.map((item) => (
                            <article key={item.id} className="min-w-0">
                                <h3 className="font-display text-2xl font-normal tracking-[-0.02em] text-balance">{item.name}</h3>
                                <p className="mt-2 text-base leading-relaxed font-light text-pretty text-[#404040]">{item.summary}</p>
                                <div className="mt-5">
                                    <SceneFor item={item} scene={scene} />
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </Enter>

            <Section title={t("extendTitle")} body={t("extendBody")} />

            <Enter className="mx-auto w-full max-w-container px-4 pt-4 pb-24 md:px-8 md:pb-32">
                <section className="border-t border-[#171717]/10 pt-16">
                    <CopyBlock title={home("closeTitle")} body={home("closeBody")} />
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
            </Enter>
        </div>
    );
}
