import { DemoButton } from "@/components/cobreo/marketing/demo-button";
import { HeroMark } from "@/components/cobreo/marketing/hero-mark";

export function Closing({
    quote,
    name,
    role,
    cta,
    ctaId,
    surface,
}: {
    quote: string;
    name: string;
    role: string;
    cta: string;
    ctaId: string;
    surface: string;
}) {
    return (
        <section className="relative overflow-x-clip px-4 py-24 md:px-8 md:py-36">
            {/* Bookend to the hero: the engraved mark straddles this section and the footer.
                z-[5] sits above the footer background but under its content (z-10). */}
            <HeroMark
                edgeColor="#8ea4c6"
                edgeOpacity={0.4}
                halo={false}
                className="-right-[30%] -bottom-[130px] z-[5] h-[260px] w-[440px] md:-right-[4%] md:-bottom-[230px] md:h-[460px] md:w-[780px] lg:right-[4%]"
            />
            <figure className="relative z-10 mx-auto max-w-[760px]">
                <blockquote>
                    <p className="font-display text-[clamp(1.7rem,3.2vw,2.5rem)] leading-[1.2] font-medium tracking-[-0.03em] text-pretty text-[#090a24]">
                        «{" "}
                        {quote}
                        {" "}»
                    </p>
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                    <span className="h-px w-8 bg-[#4d6b97]" aria-hidden />
                    <span>
                        <span className="block text-[16px] font-semibold text-[#090a24]">{name}</span>
                        <span className="block text-[15px] text-[#525252]">{role}</span>
                    </span>
                </figcaption>
                <div className="mt-12 md:mt-14">
                    <DemoButton ctaId={ctaId} surface={surface}>
                        {cta}
                    </DemoButton>
                </div>
            </figure>
        </section>
    );
}
