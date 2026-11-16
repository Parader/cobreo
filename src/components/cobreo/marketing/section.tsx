import type { ReactNode } from "react";
import { Enter } from "@/components/cobreo/marketing/enter";

export function CopyBlock({
    title,
    body,
    children,
    as = "h2",
}: {
    title: string;
    body: string;
    children?: ReactNode;
    as?: "h1" | "h2";
}) {
    const Title = as;
    return (
        <div className="max-w-2xl min-w-0">
            <Title className="font-display text-[clamp(1.75rem,3.2vw,2.5rem)] font-normal leading-[1.2] tracking-[-0.02em] text-balance text-[#171717]">
                {title}
            </Title>
            <p className="mt-4 text-lg leading-relaxed font-light text-pretty text-[#404040]">{body}</p>
            {children}
        </div>
    );
}

export function Section({
    title,
    body,
    children,
    id,
}: {
    title: string;
    body: string;
    children?: ReactNode;
    id?: string;
}) {
    return (
        <Enter className="mx-auto w-full max-w-container px-4 py-16 md:px-8 md:py-24">
            <section id={id}>
                <CopyBlock title={title} body={body} />
                {children ? <div className="mt-10">{children}</div> : null}
            </section>
        </Enter>
    );
}
