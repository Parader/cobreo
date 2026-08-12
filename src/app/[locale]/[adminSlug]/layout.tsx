import { notFound } from "next/navigation";
import { getAdminSlug } from "@/lib/admin-path";

export default async function AdminGateLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ adminSlug: string; locale: string }>;
}) {
    const { adminSlug } = await params;
    if (adminSlug !== getAdminSlug()) {
        notFound();
    }

    return <div className="min-h-dvh bg-secondary">{children}</div>;
}
