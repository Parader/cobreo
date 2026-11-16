export type LocaleCopy = "fr" | "en";

export type Person = {
    name: string;
    org: string;
    tag: string;
    status: string;
    next?: string;
    initials: string;
    tone: "slate" | "brand" | "sage";
};

const fr = {
    search: "Rechercher",
    kbd: "⌘K",
    home: "Accueil",
    modules: ["CRM", "Événements", "Réservations"] as const,
    snap: "Activé",
    people: "Personnes",
    activity: "Activité",
    crmRows: [
        { name: "Inès Marchand", org: "Horizon Bois", tag: "Direction", status: "Nouveau", next: "En cours", initials: "IM", tone: "brand" },
        { name: "Marc Pelletier", org: "Studio Marin", tag: "Opérations", status: "Suivi", initials: "MP", tone: "slate" },
        { name: "Sofia Nguyen", org: "Clinique des Érables", tag: "Accueil", status: "Suivi", initials: "SN", tone: "sage" },
        { name: "Groupe Sorel", org: "Groupe Sorel", tag: "Organisation", status: "À relancer", initials: "GS", tone: "brand" },
        { name: "Nadia Khelifi", org: "Atelier Lumen", tag: "Projet", status: "Suivi", initials: "NK", tone: "slate" },
    ] satisfies Person[],
    crmNote: "Dossier ouvert après la visite de mardi.",
    crmNext: "Statut passé à En cours.",
    eventTitle: "Forum d’automne",
    eventMeta: "12 novembre · Salle 2",
    eventSeats: "Places",
    eventPeople: "Inscriptions",
    confirmed: "Confirmé",
    invited: "Invitée",
    waiting: "En attente",
    registrations: [
        { name: "Claire M.", org: "Horizon Bois", status: "Confirmé" },
        { name: "Julien P.", org: "Studio Marin", status: "Confirmé" },
        { name: "Nadia K.", org: "Atelier Lumen", status: "En attente" },
        { name: "Louis A.", org: "Groupe Sorel", status: "Invitée" },
    ],
    days: ["Lun", "Mar", "Mer", "Jeu", "Ven"],
    bookings: [
        { day: 0, time: "09:00", title: "Visite", who: "Horizon Bois" },
        { day: 1, time: "11:30", title: "Point", who: "Studio Marin" },
        { day: 2, time: "14:00", title: "Atelier", who: "Érables" },
        { day: 3, time: "11:00", title: "Revue", who: "Sorel", appear: true },
    ],
    surveyQ: "Comment s’est passée la dernière visite ?",
    bars: [
        { label: "Claire et utile", width: "78%" },
        { label: "Correcte", width: "46%" },
        { label: "Le délai était long", width: "28%" },
    ],
    replies: [
        { name: "Claire M.", text: "L’accueil était clair, et le suivi aussi." },
        { name: "Julien P.", text: "Le délai avant le rendez-vous était long." },
        { name: "Nadia K.", text: "Simple du début à la fin.", appear: true },
    ],
    private: "Privé",
    published: "Publié",
    prompt: "Comment relier les réservations aux fiches ?",
    reply: "Activez Réservations, puis rattachez-le au CRM. Je peux montrer les étapes.",
};

const en = {
    search: "Search",
    kbd: "⌘K",
    home: "Home",
    modules: ["CRM", "Events", "Booking"] as const,
    snap: "On",
    people: "People",
    activity: "Activity",
    crmRows: [
        { name: "Inès Marchand", org: "Horizon Bois", tag: "Leadership", status: "New", next: "In progress", initials: "IM", tone: "brand" },
        { name: "Marc Pelletier", org: "Studio Marin", tag: "Operations", status: "Following", initials: "MP", tone: "slate" },
        { name: "Sofia Nguyen", org: "Clinique des Érables", tag: "Front desk", status: "Following", initials: "SN", tone: "sage" },
        { name: "Groupe Sorel", org: "Groupe Sorel", tag: "Organization", status: "To follow up", initials: "GS", tone: "brand" },
        { name: "Nadia Khelifi", org: "Atelier Lumen", tag: "Project", status: "Following", initials: "NK", tone: "slate" },
    ] satisfies Person[],
    crmNote: "Record opened after Tuesday’s visit.",
    crmNext: "Status moved to In progress.",
    eventTitle: "Autumn forum",
    eventMeta: "12 November · Room 2",
    eventSeats: "Seats",
    eventPeople: "Registrations",
    confirmed: "Confirmed",
    invited: "Invited",
    waiting: "Waiting",
    registrations: [
        { name: "Claire M.", org: "Horizon Bois", status: "Confirmed" },
        { name: "Julien P.", org: "Studio Marin", status: "Confirmed" },
        { name: "Nadia K.", org: "Atelier Lumen", status: "Waiting" },
        { name: "Louis A.", org: "Groupe Sorel", status: "Invited" },
    ],
    days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    bookings: [
        { day: 0, time: "09:00", title: "Visit", who: "Horizon Bois" },
        { day: 1, time: "11:30", title: "Check-in", who: "Studio Marin" },
        { day: 2, time: "14:00", title: "Workshop", who: "Érables" },
        { day: 3, time: "11:00", title: "Review", who: "Sorel", appear: true },
    ],
    surveyQ: "How did the last visit go?",
    bars: [
        { label: "Clear and useful", width: "78%" },
        { label: "Fine", width: "46%" },
        { label: "The wait was long", width: "28%" },
    ],
    replies: [
        { name: "Claire M.", text: "The welcome was clear, and so was the follow-up." },
        { name: "Julien P.", text: "The wait before the appointment was long." },
        { name: "Nadia K.", text: "Straightforward from start to finish.", appear: true },
    ],
    private: "Private",
    published: "Published",
    prompt: "How do I link bookings to records?",
    reply: "Turn on Booking, then attach it to the CRM. I can show the steps.",
};

export function stageCopy(locale: string) {
    return locale === "en" ? en : fr;
}

export type StageCopy = ReturnType<typeof stageCopy>;
