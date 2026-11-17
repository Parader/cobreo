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
    trustBody?: string;
    cta: string;
    ctaId: string;
    surface: string;
}) {
    return (
        <section className="mx-auto max-w-[920px] px-4 py-24 md:px-8 md:py-32">
            <blockquote className="mx-auto max-w-[760px]">
                <p className="font-display text-[clamp(1.7rem,3.2vw,2.5rem)] leading-[1.2] font-medium tracking-[-0.03em] text-pretty text-[#121212]">
                    « {quote} »
                </p>
            </blockquote>
            <div className="mt-6">
                <p className="text-sm font-semibold text-[#171717]">{name}</p>
                <p className="text-sm text-[#5c6168]">{role}</p>
            </div>

            <div className="mx-auto mt-14 max-w-[520px] border-t border-[#1c1c1c]/10 pt-10 text-center">
                <div className="space-y-3 text-[15px] leading-7 text-[#5c6168]">
                    <p className="font-medium text-[#253353]">{billing}</p>
                    <p className="font-medium text-[#253353]">
                        {trust}
                        {trustBody ? <> {trustBody}</> : null}
                    </p>
                </div>
                <div className="mt-8 flex justify-center">
                    <DemoButton ctaId={ctaId} surface={surface}>
                        {cta}
                    </DemoButton>
                </div>
            </div>
        </section>
    );
}
