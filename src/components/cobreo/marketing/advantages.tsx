import { MarkMotif } from "@/components/cobreo/marketing/mark-motif";

export type AdvantageItem = {
    title: string;
    body: string;
};

/**
 * Three commitments, set as statements rather than cards. Sage is the band's
 * colour: it carries the "trust" notes (billing, continuity, Canadian hosting).
 */
export function Advantages({ title, items }: { title: string; items: AdvantageItem[] }) {
    return (
        <section className="relative overflow-hidden bg-white py-20 md:py-28">
            <MarkMotif
                variant="pattern"
                opacity={0.06}
                className="inset-0 [mask-image:radial-gradient(ellipse_70%_80%_at_40%_55%,rgba(0,0,0,0.35)_15%,#000_75%)] [-webkit-mask-image:radial-gradient(ellipse_70%_80%_at_40%_55%,rgba(0,0,0,0.35)_15%,#000_75%)]"
            />
            <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
                <h2 className="max-w-[20ch] font-display text-[clamp(1.85rem,3.4vw,2.75rem)] leading-[1.08] font-normal tracking-[-0.03em] text-balance text-[#090a24]">
                    {title}
                </h2>
                <ul className="mt-12 grid gap-10 md:mt-16 md:grid-cols-3 md:gap-10 lg:gap-14">
                    {items.map((item) => (
                        <li key={item.title} className="border-t-2 border-[#4d6b97] pt-6">
                            <h3 className="font-display text-[clamp(1.3rem,1.9vw,1.6rem)] leading-[1.2] font-normal tracking-[-0.025em] text-balance text-[#090a24]">
                                {item.title}
                            </h3>
                            <p className="mt-3 text-[16px] leading-7 text-pretty text-[#525252]">{item.body}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
