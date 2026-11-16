import { Link } from "@/i18n/navigation";
import { cx } from "@/utils/cx";

export type BentoItem = {
    id: string;
    name: string;
    summary: string;
    lead?: boolean;
};

const wash = ["bg-[#f4f7fb]", "bg-[#eef3f8]", "bg-white", "bg-[#f7f9fb]"];

export function ModuleBento({ items, linkLabel, linkHref }: { items: BentoItem[]; linkLabel?: string; linkHref?: string }) {
    const lead = items.filter((item) => item.lead);
    const rest = items.filter((item) => !item.lead);

    return (
        <div>
            <div className="grid gap-3 md:grid-cols-2">
                {lead.map((item, index) => (
                    <article
                        key={item.id}
                        className={cx(
                            "relative min-h-[148px] overflow-hidden rounded-2xl border border-[#1c1c1c]/8 p-5",
                            wash[index % wash.length],
                            index === 0 ? "md:min-h-[180px]" : "",
                        )}
                    >
                        <p className="text-[11px] font-medium tracking-[0.14em] text-[#4d6b97] uppercase">{String(index + 1).padStart(2, "0")}</p>
                        <h3 className="mt-3 font-display text-[1.7rem] leading-none font-medium tracking-[-0.03em]">{item.name}</h3>
                        <p className="mt-2 max-w-sm text-[15px] leading-snug text-[#525252]">{item.summary}</p>
                        <div className="pointer-events-none absolute right-4 bottom-4 hidden sm:block" aria-hidden>
                            {index === 0 ? (
                                <div className="flex -space-x-2">
                                    {["IM", "MP", "SN"].map((initials) => (
                                        <span key={initials} className="grid size-8 place-items-center rounded-full border-2 border-[#f4f7fb] bg-[#d5e0ee] text-[10px] font-semibold text-[#253353]">
                                            {initials}
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                            {index === 1 ? (
                                <div className="grid grid-cols-6 gap-1">
                                    {Array.from({ length: 18 }).map((_, i) => (
                                        <span key={i} className={i % 3 ? "h-2.5 w-3 rounded-[3px] bg-[#4d6b97]" : "h-2.5 w-3 rounded-[3px] bg-[#d5deea]"} />
                                    ))}
                                </div>
                            ) : null}
                            {index === 2 ? (
                                <div className="w-28 space-y-1.5">
                                    <span className="block h-1.5 w-full rounded-full bg-[#4d6b97]" />
                                    <span className="block h-1.5 w-2/3 rounded-full bg-[#4d6b97]/70" />
                                    <span className="block h-1.5 w-1/3 rounded-full bg-[#4d6b97]/40" />
                                </div>
                            ) : null}
                            {index === 3 ? (
                                <div className="grid grid-cols-5 gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <span key={i} className={i === 2 ? "h-8 w-3 rounded bg-[#4d6b97]" : "h-8 w-3 rounded bg-[#d5deea]"} />
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </article>
                ))}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((item) => (
                    <article key={item.id} className="rounded-2xl border border-[#1c1c1c]/8 bg-white px-4 py-4">
                        <h3 className="text-[15px] font-medium tracking-[-0.02em]">{item.name}</h3>
                        <p className="mt-1 text-sm leading-snug text-[#525252]">{item.summary}</p>
                    </article>
                ))}
            </div>
            {linkHref && linkLabel ? (
                <Link href={linkHref} className="mt-5 inline-flex text-sm font-semibold text-[#253353]">
                    {linkLabel}
                </Link>
            ) : null}
        </div>
    );
}
