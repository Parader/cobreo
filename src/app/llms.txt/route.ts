import { LLMS_TXT } from "@/lib/llms-txt";

export function GET() {
    return new Response(LLMS_TXT, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
    });
}
