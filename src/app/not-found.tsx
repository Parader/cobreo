import Link from "next/link";

const copy = {
    fr: {
        code: "404",
        title: "Cette page n’existe pas.",
        body: "Le lien est peut-être ancien, ou l’adresse a été saisie de façon inexacte.",
        home: "Retour à l’accueil",
    },
    en: {
        code: "404",
        title: "This page does not exist.",
        body: "The link may be out of date, or the address may have been typed incorrectly.",
        home: "Back to home",
    },
} as const;

export default function NotFound() {
    const t = copy.fr;

    return (
        <html lang="fr">
            <body
                style={{
                    margin: 0,
                    background: "#ffffff",
                    color: "#171717",
                    fontFamily: '"SN Pro Variable", ui-sans-serif, sans-serif',
                }}
            >
                <main style={{ maxWidth: 640, margin: "0 auto", padding: "96px 24px" }}>
                    <p style={{ color: "#4d6b97", fontWeight: 600 }}>{t.code}</p>
                    <h1 style={{ fontSize: 40, fontWeight: 400, letterSpacing: "-0.03em", lineHeight: 1.15 }}>{t.title}</h1>
                    <p style={{ fontSize: 18, lineHeight: 1.5, color: "#404040" }}>{t.body}</p>
                    <p style={{ marginTop: 28 }}>
                        <Link href="/fr" style={{ color: "#253353", fontWeight: 600 }}>
                            {t.home}
                        </Link>
                        <span style={{ color: "#a3a3a3" }}> · </span>
                        <Link href="/en" style={{ color: "#253353", fontWeight: 600 }}>
                            {copy.en.home}
                        </Link>
                    </p>
                </main>
            </body>
        </html>
    );
}
