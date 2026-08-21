/**
 * Adds *_en beside every user-facing *_fr string in v6/spec.json.
 * Run: node scripts/apply-diagnostic-en.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specPath = path.join(root, "src/content/diagnostic/v6/spec.json");

/** @type {Record<string, string>} */
const FR_TO_EN = {
    "Votre entreprise": "Your business",
    "Ce qui compte maintenant": "What matters now",
    "Votre réalité": "Your reality",
    "À approfondir": "Going deeper",
    Résultats: "Results",
    "Où en êtes-vous avec votre entreprise aujourd’hui?": "Where are you with your business today?",
    "Je teste encore mon idée ou mon offre": "I’m still testing my idea or offer",
    "J’ai commencé, mais mon activité est encore limitée":
        "I’ve started, but my activity is still limited",
    "Mon activité fonctionne régulièrement": "My activity runs regularly",
    "Mon entreprise est bien établie": "My business is well established",
    "Que fournissez-vous principalement?": "What do you mainly provide?",
    "Des services": "Services",
    "Des produits": "Products",
    "Les deux": "Both",
    Autre: "Other",
    "Comment votre activité se déroule-t-elle généralement?":
        "How does your work usually happen?",
    "Par rendez-vous": "By appointment",
    "Par projets ou mandats": "By projects or mandates",
    "Par commandes": "By orders",
    "En continu ou de façon récurrente": "Ongoing or recurring",
    "Sélectionnez tout ce qui s’applique.": "Select everything that applies.",
    "Qu’est-ce qui correspond le mieux à ce que vous cherchez à faire actuellement?":
        "Which best matches what you’re trying to do right now?",
    "Tester ou améliorer ce que j’offre": "Test or improve what I offer",
    "Trouver des clients ou vendre davantage": "Find clients or sell more",
    "Mieux servir mes clients": "Serve my clients better",
    "Mieux organiser mon travail": "Organize my work better",
    "Gagner du temps dans mes opérations": "Save time in my operations",
    "Mieux suivre ce qui se passe ou préparer une croissance":
        "Track what’s going on better or prepare for growth",
    "Rien de particulier pour l’instant": "Nothing specific for now",
    "Dans vos essais actuels, qu’est-ce qui fait partie de votre réalité?":
        "In your current experiments, what is part of your reality?",
    "J’essaie différentes versions": "I’m trying different versions",
    "Des personnes testent ce que j’offre": "People are testing what I offer",
    "Je recueille leurs réactions": "I collect their feedback",
    "Je modifie mon offre selon ce que j’apprends":
        "I change my offer based on what I learn",
    "Je commence à montrer mon offre à de nouvelles personnes":
        "I’m starting to show my offer to new people",
    "Rien de tout cela": "None of these",
    "Comment gardez-vous une trace de vos essais et de ce que vous apprenez?":
        "How do you keep track of your experiments and what you learn?",
    "Je n’en garde pas vraiment pour l’instant": "I don’t really keep track for now",
    "Je m’en souviens surtout de mémoire": "I mostly remember it",
    "Je prends des notes": "I take notes",
    "J’utilise quelques notes, messages ou documents":
        "I use a few notes, messages, or documents",
    "J’ai déjà une façon claire de suivre tout ça":
        "I already have a clear way to track all of this",
    "Quand vous revenez sur vos essais, arrivez-vous facilement à retrouver les versions testées et les commentaires reçus?":
        "When you look back at your experiments, can you easily find the versions you tested and the feedback you received?",
    "Oui, facilement": "Yes, easily",
    "La plupart du temps": "Most of the time",
    "Pas toujours": "Not always",
    Non: "No",
    "Trop tôt pour le dire": "Too early to say",
    "Si quelqu’un voulait acheter ce que vous offrez aujourd’hui, comment pourrait-il procéder?":
        "If someone wanted to buy what you offer today, how could they proceed?",
    "Me contacter directement": "Contact me directly",
    "Me demander comment procéder": "Ask me how to proceed",
    "Passer une commande d’une façon déjà prévue":
        "Place an order through a process that’s already set up",
    "Commander en ligne": "Order online",
    "Je n’ai pas encore défini comment ça fonctionnerait":
        "I haven’t defined how that would work yet",
    "Je ne prends pas encore de commandes": "I’m not taking orders yet",
    "Ce n’est pas pertinent pour mon activité": "This isn’t relevant to my business",
    "Est-ce quelque chose dont vous pensez avoir besoin prochainement?":
        "Is this something you think you’ll need soon?",
    Oui: "Yes",
    "Peut-être": "Maybe",
    "Je ne sais pas": "I don’t know",
    "Quand quelqu’un veut comprendre ce que vous offrez, où peut-il trouver l’information?":
        "When someone wants to understand what you offer, where can they find the information?",
    "Je lui explique directement": "I explain it directly",
    "Je lui envoie de l’information": "I send them information",
    "Une page ou un profil présente mon offre": "A page or profile presents my offer",
    "Mon site Web présente mon offre": "My website presents my offer",
    "Je n’ai pas encore vraiment prévu ça": "I haven’t really planned for that yet",
    "Les façons dont vous présentez votre offre aujourd’hui répondent-elles bien à vos besoins?":
        "Do the ways you present your offer today meet your needs well?",
    "Oui, tout à fait": "Yes, completely",
    "En bonne partie": "Mostly",
    "Pas vraiment": "Not really",
    "Difficile à dire": "Hard to say",
    "Est-ce important pour vous que de nouvelles personnes puissent comprendre votre offre sans devoir vous parler directement?":
        "Is it important to you that new people can understand your offer without speaking to you directly?",
    "Je ne sais pas encore": "I don’t know yet",
    "Rien d’important pour le moment": "Nothing important for now",
    "Quelque chose à ajouter?": "Anything to add?",
    "Y a-t-il quelque chose d’important que les choix précédents ne vous ont pas permis d’exprimer?":
        "Is there something important the previous choices didn’t let you express?",
    "Y a-t-il autre chose que vous aimeriez préciser?":
        "Is there anything else you’d like to clarify?",
    "Une situation particulière, une façon de travailler ou un irritant que nous n’avons pas abordé.":
        "A particular situation, a way of working, or a friction point we haven’t covered.",
    "À améliorer": "To improve",
    "À préparer": "To prepare",
    "À explorer": "To explore",
    "Fonctionne bien": "Working well",
    "Vous cherchez surtout à {priority_result_phrase}. Voici les pistes qui semblent les plus pertinentes compte tenu de votre réalité actuelle.":
        "You’re mainly looking to {priority_result_phrase}. Here are the paths that seem most relevant given your current reality.",
    "Vous voulez en discuter?": "Want to talk it through?",
    "Si vous le souhaitez, on peut reprendre vos résultats avec vous et regarder quelles pistes valent réellement la peine d’être approfondies.":
        "If you’d like, we can review your results with you and look at which paths are truly worth exploring further.",
    Nom: "Name",
    "Courriel ou téléphone": "Email or phone",
    Entreprise: "Company",
    "Me contacter au sujet de mes résultats": "Contact me about my results",
    "Vos coordonnées serviront à vous contacter au sujet de cette analyse.":
        "Your details will only be used to contact you about this analysis.",
    "Une question sur vos résultats? Parlez-nous.": "A question about your results? Talk to us.",
    "Préparer ces documents": "Preparing these documents",
    "Avant de terminer, regardons rapidement quelques aspects de votre quotidien.":
        "Before we wrap up, let’s quickly look at a few parts of your day-to-day.",
    "Y a-t-il des tâches que vous faites régulièrement à la main et que vous aimeriez rendre plus simples?":
        "Are there tasks you regularly do by hand that you’d like to make simpler?",
    "Oui, plusieurs": "Yes, several",
    "Oui, une ou deux": "Yes, one or two",
    "Non, rien qui me vient en tête": "No, nothing comes to mind",
    "Quelles tâches vous viennent en tête?": "Which tasks come to mind?",
    "Recopier ou transférer de l’information": "Copying or transferring information",
    "Préparer des documents": "Preparing documents",
    "Envoyer des rappels ou suivis": "Sending reminders or follow-ups",
    "Classer ou retrouver de l’information": "Filing or finding information",
    "Mettre à jour des listes ou suivis": "Updating lists or trackers",
    "Préparer des rapports ou résumés": "Preparing reports or summaries",
    "Pour gérer votre activité, sur quoi vous appuyez-vous aujourd’hui?":
        "To run your business, what do you rely on today?",
    "Papier ou notes": "Paper or notes",
    "Tableurs (Excel, Google Sheets, etc.)": "Spreadsheets (Excel, Google Sheets, etc.)",
    Courriels: "Email",
    "Messages ou textos": "Messages or texts",
    Calendrier: "Calendar",
    "Logiciels ou applications spécialisés": "Specialized software or apps",
    "Outils développés pour mon entreprise": "Tools built for my business",
    "Surtout ma mémoire": "Mostly my memory",
    "Je n’ai pas vraiment d’outils pour l’instant": "I don’t really have tools for now",
    "Dans votre travail avec ces outils, est-ce qu’il vous arrive de faire certaines de ces choses?":
        "In your work with these tools, do any of these happen?",
    "Entrer la même information à plus d’un endroit":
        "Entering the same information in more than one place",
    "Passer d’un outil à l’autre pour compléter une tâche":
        "Switching from one tool to another to finish a task",
    "Chercher où se trouve une information": "Looking for where information lives",
    "Faire manuellement une étape entre deux outils":
        "Manually doing a step between two tools",
    "Utiliser des notes ou fichiers en complément de certains outils":
        "Using notes or files alongside some tools",
    "Pour les suivis importants, à quel point devez-vous compter sur votre mémoire ou penser vous-même à la prochaine étape?":
        "For important follow-ups, how much do you rely on your memory or on remembering the next step yourself?",
    "Presque jamais": "Almost never",
    Parfois: "Sometimes",
    Souvent: "Often",
    "Très souvent": "Very often",
    "Ce n’est pas vraiment pertinent pour mon activité":
        "This isn’t really relevant to my business",
    "Quand vous voulez savoir où en sont vos dossiers, commandes ou travaux en cours, est-ce généralement facile?":
        "When you want to know where your files, orders, or work in progress stand, is it usually easy?",
    "suivez-vous les prochaines étapes de mémoire": "do you track next steps from memory",
    "Suivre les prochaines étapes de mémoire": "Tracking next steps from memory",
    "la façon dont vous suivez les prochaines étapes": "how you track next steps",
    "La solution que vous utilisez aujourd’hui répond-elle bien à vos besoins pour {activity_or_goal}?":
        "Does the solution you use today meet your needs well for {activity_or_goal}?",
    "Votre site actuel vous aide-t-il suffisamment à présenter votre offre et à générer des demandes?":
        "Does your current website help you enough to present your offer and generate inquiries?",
    "Qu’aimeriez-vous surtout que votre site fasse mieux?":
        "What would you most like your website to do better?",
    "Choisissez jusqu’à 2 réponses.": "Choose up to 2 answers.",
    "Votre outil actuel vous permet-il de suivre vos clients et vos prochaines actions comme vous le souhaitez?":
        "Does your current tool let you track clients and next actions the way you want?",
};

const MEASUREMENT_ANSWER_EN = {
    rare: "Rarely",
    monthly: "A few times a month",
    weekly: "A few times a week",
    daily: "Almost every day",
    very_little: "Very little",
    some: "A little",
    quite_a_bit: "Quite a bit",
    a_lot: "A lot",
    not_really: "Not really",
    a_little: "A little",
    quite: "Quite",
};

const PRIORITY_PHRASE_EN = {
    test_offer: "test or improve what you offer",
    sell_more: "find clients or sell more",
    serve_clients: "serve your clients better",
    organize_work: "organize your work better",
    save_time: "save time in your operations",
    visibility_growth: "track what’s going on better or prepare for growth",
    nothing_specific: "take stock of how you currently operate",
    other: "move forward on your current priority",
};

function enFor(fr) {
    if (Object.prototype.hasOwnProperty.call(FR_TO_EN, fr)) return FR_TO_EN[fr];
    // Normalize curly/straight apostrophes
    const alt = fr.replaceAll("'", "’");
    if (Object.prototype.hasOwnProperty.call(FR_TO_EN, alt)) return FR_TO_EN[alt];
    const alt2 = fr.replaceAll("’", "'");
    if (Object.prototype.hasOwnProperty.call(FR_TO_EN, alt2)) return FR_TO_EN[alt2];
    return null;
}

function walk(node, missing) {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
        node.forEach((item) => walk(item, missing));
        return;
    }

    for (const [key, value] of Object.entries(node)) {
        if (key === "labels_fr" && value && typeof value === "object" && !Array.isArray(value)) {
            const labelsEn = {};
            for (const [k, v] of Object.entries(value)) {
                if (typeof v !== "string") continue;
                const translated = enFor(v);
                if (!translated) missing.push(`labels_fr.${k}: ${v}`);
                else labelsEn[k] = translated;
            }
            node.labels_en = labelsEn;
            continue;
        }

        if (key.endsWith("_fr") && typeof value === "string") {
            const enKey = `${key.slice(0, -3)}_en`;
            const translated = enFor(value);
            if (!translated) missing.push(`${key}: ${value}`);
            else node[enKey] = translated;
            continue;
        }

        walk(value, missing);
    }
}

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const missing = [];
walk(spec, missing);

// Measurement answer tuples: [id, frLabel, score] → keep FR in place, add parallel en map on model
const mm = spec.measurement_model;
if (mm) {
    for (const scale of ["frequency", "effort", "desire_to_improve"]) {
        const block = mm[scale];
        if (!block?.answers) continue;
        block.answers_en = block.answers.map(([id, , score]) => [
            id,
            MEASUREMENT_ANSWER_EN[id] ?? id,
            score,
        ]);
    }
    if (mm.copy_generation?.templates) {
        mm.copy_generation.templates_en = {
            frequency: "How often {frequency_clause_en}?",
            effort: "How much effort does {effort_subject_en} usually take?",
            desire_to_improve: "How much would you like to improve {improvement_object_en}?",
        };
    }
}

// Priority result phrases (plain FR values without _fr suffix)
const phrases =
    spec.result_generation?.result_intro?.when_priority_known?.priority_result_phrases;
if (phrases) {
    const phrasesEn = {};
    for (const [id, fr] of Object.entries(phrases)) {
        phrasesEn[id] = PRIORITY_PHRASE_EN[id] ?? enFor(fr) ?? fr;
    }
    spec.result_generation.result_intro.when_priority_known.priority_result_phrases_en = phrasesEn;
}

spec.source_language = "fr";
spec.available_languages = ["fr", "en"];

fs.writeFileSync(specPath, `${JSON.stringify(spec, null, 2)}\n`);

if (missing.length) {
    console.error("Missing translations:");
    for (const m of missing) console.error(`  - ${m}`);
    process.exit(1);
}

console.log("Applied EN fields to", specPath);
