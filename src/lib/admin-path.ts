export function getAdminSlug() {
    const slug = process.env.NEXT_PUBLIC_ADMIN_PATH_SECRET || process.env.ADMIN_PATH_SECRET;
    if (!slug?.trim()) {
        throw new Error("Missing NEXT_PUBLIC_ADMIN_PATH_SECRET");
    }
    return slug.trim();
}

export function getAdminBasePath(locale: string) {
    return `/${locale}/${getAdminSlug()}`;
}
