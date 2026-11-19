import type { FC } from "react";
import { Calendar, CheckDone01, CreditCard01, Download01, Stars01 } from "@untitledui/icons";

export type PlatformFeatureItem = {
    id: string;
    name: string;
    body: string;
};

const icons: Record<string, FC<{ className?: string }>> = {
    tasks: CheckDone01,
    payments: CreditCard01,
    calendar: Calendar,
    importExport: Download01,
    ai: Stars01,
};

/**
 * Shared platform capabilities on the light band.
 * No cards: hairlines group the items so the band reads as one section.
 */
export function PlatformFeatures({
    title,
    lede,
    items,
}: {
    title: string;
    lede: string;
    items: PlatformFeatureItem[];
}) {
    return (
        <section className="relative overflow-hidden bg-[#eef3f9] py-20 md:py-24">
            <div className="relative z-10 mx-auto max-w-[1200px] px-4 md:px-8">
                <div className="max-w-2xl">
                    <h2 className="font-display text-[clamp(1.85rem,3.4vw,2.75rem)] leading-[1.08] font-normal tracking-[-0.03em] text-balance text-[#090a24]">
                        {title}
                    </h2>
                    <p className="mt-4 text-[17px] leading-7 text-pretty text-[#525252] md:text-[18px] md:leading-8">{lede}</p>
                </div>

                <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2 md:mt-14 md:gap-y-10 lg:grid-cols-5">
                    {items.map((item) => {
                        const Icon = icons[item.id] ?? CheckDone01;
                        return (
                            <li key={item.id} className="border-t border-[#4d6b97]/25 pt-4 md:pt-5">
                                <div className="flex items-center gap-2.5">
                                    <Icon className="size-5 shrink-0 text-[#4d6b97]" aria-hidden />
                                    <h3 className="text-[16px] leading-snug font-semibold tracking-[-0.015em] text-[#090a24]">
                                        {item.name}
                                    </h3>
                                </div>
                                <p className="mt-1.5 text-[15px] leading-6 text-pretty text-[#525252]">{item.body}</p>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
