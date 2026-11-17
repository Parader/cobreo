import { cx } from "@/utils/cx";

type Variant = "crop" | "contour" | "outline" | "pattern";

const sources: Record<Exclude<Variant, "pattern">, string> = {
    crop: "/images/cobreomark.svg",
    contour: "/images/mark-contour.svg",
    outline: "/images/mark-outline.svg",
};

/**
 * Decorative Cobreo mark motifs — outline, contour, cropped fill, or tiled pattern.
 * Always aria-hidden; keep opacity low so copy stays primary.
 */
export function MarkMotif({
    variant = "contour",
    className,
    opacity = 0.14,
}: {
    variant?: Variant;
    className?: string;
    opacity?: number;
}) {
    if (variant === "pattern") {
        return (
            <div
                aria-hidden
                className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}
                style={{ opacity }}
            >
                <div
                    className="absolute inset-[-8%] rotate-[-8deg]"
                    style={{
                        backgroundImage: "url(/images/mark-outline.svg)",
                        backgroundSize: "140px auto",
                        backgroundRepeat: "repeat",
                    }}
                />
            </div>
        );
    }

    return (
        <div
            aria-hidden
            className={cx("pointer-events-none absolute overflow-hidden", className)}
            style={{ opacity }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sources[variant]} alt="" className="h-full w-full object-contain" />
        </div>
    );
}
