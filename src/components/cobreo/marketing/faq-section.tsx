import { cx } from "@/utils/cx";

export type FaqSectionItem = {
    question: string;
    answer: string;
};

/**
 * Server-rendered FAQ. Uses native details/summary so answers stay in the HTML
 * for crawlers without relying on client JS.
 */
export function FaqSection({
    title,
    lede,
    items,
}: {
    title: string;
    lede?: string;
    items: FaqSectionItem[];
}) {
    if (!items.length) return null;

    return (
        <section id="faq" className="relative scroll-mt-28 bg-white py-16 md:scroll-mt-32 md:py-20" aria-labelledby="faq-heading">
            <div className="mx-auto max-w-[720px] px-4 md:px-8">
                <h2
                    id="faq-heading"
                    className="font-display text-[clamp(1.45rem,2.6vw,2rem)] font-normal tracking-[-0.03em] text-[#090a24]"
                >
                    {title}
                </h2>
                {lede ? <p className="mt-3 text-[15px] leading-7 text-[#525252] md:text-[16px]">{lede}</p> : null}

                <div className="mt-8 divide-y divide-[#4d6b97]/15 border-y border-[#4d6b97]/15">
                    {items.map((item) => (
                        <details
                            key={item.question}
                            className="group py-4 open:pb-5 md:py-5"
                        >
                            <summary
                                className={cx(
                                    "flex cursor-pointer list-none items-start justify-between gap-4",
                                    "text-left text-[15px] font-semibold leading-snug tracking-[-0.01em] text-[#090a24] md:text-[16px]",
                                    "transition-colors duration-100 ease-linear hover:text-[#253353]",
                                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4d6b97]",
                                    "[&::-webkit-details-marker]:hidden",
                                )}
                            >
                                <span>{item.question}</span>
                                <span
                                    aria-hidden
                                    className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center text-[#4d6b97] transition-transform duration-200 group-open:rotate-45"
                                >
                                    <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75">
                                        <path d="M8 3v10M3 8h10" strokeLinecap="round" />
                                    </svg>
                                </span>
                            </summary>
                            <p className="mt-3 max-w-[38rem] pr-8 text-[15px] leading-7 text-[#525252] md:text-[16px]">
                                {item.answer}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}
