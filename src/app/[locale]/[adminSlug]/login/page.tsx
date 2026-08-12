import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AdminLoginForm } from "@/components/cobreo/admin-login-form";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
            <AdminLoginForm />
        </div>
    );
}
