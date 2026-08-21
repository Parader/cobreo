type LegalSection = {
    title: string;
    body: string;
};

export function LegalDocument({
    title,
    updated,
    intro,
    sections,
}: {
    title: string;
    updated: string;
    intro: string;
    sections: LegalSection[];
}) {
    return (
        <article className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24">
            <p className="text-sm text-[#525252]">{updated}</p>
            <h1 className="mt-3 font-display text-[36px] font-normal tracking-[-0.96px] text-[#171717] md:text-[48px] md:leading-[60px]">
                {title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-[#525252]">{intro}</p>
            <div className="mt-12 flex flex-col gap-10">
                {sections.map((section) => (
                    <section key={section.title}>
                        <h2 className="text-[20px] font-semibold leading-[30px] text-[#171717]">{section.title}</h2>
                        <div className="mt-3 space-y-3 text-[16px] leading-7 text-[#525252]">
                            {section.body.split("\n\n").map((paragraph) => (
                                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </article>
    );
}

export function renderLegalSections(raw: unknown): LegalSection[] {
    if (!Array.isArray(raw)) return [];
    return raw.filter(
        (item): item is LegalSection =>
            typeof item === "object" &&
            item !== null &&
            typeof (item as LegalSection).title === "string" &&
            typeof (item as LegalSection).body === "string",
    );
}
