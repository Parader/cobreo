export function getAdminSlug() {
    return process.env.NEXT_PUBLIC_ADMIN_PATH_SECRET || process.env.ADMIN_PATH_SECRET || "ops-cobreo";
}

export function getAdminBasePath(locale: string) {
    return `/${locale}/${getAdminSlug()}`;
}
