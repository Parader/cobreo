import { DemoButton } from "@/components/cobreo/marketing/demo-button";

export function Closing({
    quote,
    name,
    role,
    billing,
    trust,
    trustBody,
    cta,
    ctaId,
    surface,
}: {
    quote: string;
    name: string;
    role: string;
    billing: string;
    trust: string;
    trustBody: string;
    cta: string;
    ctaId: string;
    surface: string;
}) {
    return (
        <section className="mx-auto max-w-[760px] px-4 py-20 md:px-8 md:py-28">
            <blockquote>
                <p className="font-display text-[clamp(1.6rem,3vw,2.25rem)] leading-[1.25] font-medium tracking-[-0.03em] text-pretty text-[#121212]">
                    « {quote} »
                </p>
            </blockquote>
            <p className="mt-5 text-sm font-semibold">{name}</p>
            <p className="text-sm text-[#5c6168]">{role}</p>
            <div className="mt-10 space-y-3 border-t border-[#1c1c1c]/10 pt-6 text-[15px] leading-6 text-[#5c6168]">
                <p className="font-medium text-[#253353]">{billing}</p>
                <p>
                    <span className="font-medium text-[#253353]">{trust}</span> {trustBody}
                </p>
            </div>
            <div className="mt-8">
                <DemoButton ctaId={ctaId} surface={surface}>
                    {cta}
                </DemoButton>
            </div>
        </section>
    );
}
