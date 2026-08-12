import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminSlug } from "@/lib/admin-path";
import { AdminDashboard } from "@/components/cobreo/admin-dashboard";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function AdminHomePage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("admin");

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/${locale}/${getAdminSlug()}/login`);
    }

    const { data: leads } = await supabase
        .from("leads")
        .select("id, title, source, status, created_at, contacts(full_name, email, company_name)")
        .order("created_at", { ascending: false })
        .limit(50);

    return (
        <div className="mx-auto max-w-container px-4 py-10 md:px-8">
            <AdminDashboard leads={leads || []} labels={{ leads: t("leads"), empty: t("empty"), logout: t("logout") }} />
        </div>
    );
}
