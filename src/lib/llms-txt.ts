import en from "@/messages/en.json";
import fr from "@/messages/fr.json";

const SITE = "https://cobreo.ca";

type ModuleCopy = { id: string; name: string; tagline: string; points: { title: string; body?: string }[] };

/** Module copy comes from the same messages as the landing page, so AI summaries never drift from the site. */
const clean = (text: string) => text.replace(/[\u00a0\u202f]/g, " ");
const visible = (items: ModuleCopy[]) => items.filter((item) => item.id !== "tasks");
const frModules = visible(fr.modules.items as ModuleCopy[]);
const enModules = visible(en.modules.items as ModuleCopy[]);

const moduleList = (items: ModuleCopy[]) => items.map((m) => `- ${clean(m.name)} — ${clean(m.tagline)}`).join("\n");

const moduleDetail = () =>
    enModules
        .map((m) => {
            const frItem = frModules.find((f) => f.id === m.id);
            const heading = frItem && clean(frItem.name) !== clean(m.name) ? `${clean(m.name)} / ${clean(frItem.name)}` : clean(m.name);
            const points = m.points.map((p) => `- ${clean(p.title)}: ${clean(p.body ?? "")}`).join("\n");
            const frLine = frItem ? `\n\nEn français : ${clean(frItem.tagline)}` : "";
            return `### ${heading}\n${clean(m.tagline)}\n\n${points}${frLine}`;
        })
        .join("\n\n");

/**
 * Plain-Markdown summaries for AI crawlers (/llms.txt, /llms-full.txt).
 * Factual tone only — no prices, no hype.
 */
export const LLMS_TXT = `# Cobreo

> Cobreo is a modular business software platform. Organizations activate the modules they need. Application data is hosted in Canada.

- Site: ${SITE}
- Contact / demo: ${SITE}/fr/contact · ${SITE}/en/contact
- Email: contact@cobreo.ca
- LinkedIn: https://www.linkedin.com/company/cobreo
- Full summary: ${SITE}/llms-full.txt
- Sitemap: ${SITE}/sitemap.xml

## Français

Cobreo est une plateforme logicielle composée de modules. Une organisation active les modules dont elle a besoin, puis peut en ajouter d’autres plus tard. L’application et les données sont hébergées au Canada.

### Modules

${moduleList(frModules)}

### Fonctions de plateforme

Tâches, paiements, calendrier, import et export, analyse IA — disponibles d’un module à l’autre.

### Intégrations

Google, Microsoft, Stripe.

### Démonstration

Demander une démo : ${SITE}/fr/contact

## English

Cobreo is a software platform composed of modules. An organization turns on the modules it needs, then can add more later. The application and data are hosted in Canada.

### Modules

${moduleList(enModules)}

### Platform capabilities

Tasks, payments, calendar, import and export, AI analysis — available across modules.

### Integrations

Google, Microsoft, Stripe.

### Demo

Request a demo: ${SITE}/en/contact
`;

export const LLMS_FULL_TXT = `# Cobreo — full summary

> Modular business software. Activate the modules you need. Data hosted in Canada. No public pricing on this page — details are shared in a demo.

- Site: ${SITE}
- Français: ${SITE}/fr
- English: ${SITE}/en
- Contact: ${SITE}/fr/contact · ${SITE}/en/contact
- Analysis tool: ${SITE}/fr/diagnostic · ${SITE}/en/diagnostic
- About: ${SITE}/fr/a-propos · ${SITE}/en/a-propos
- Email: contact@cobreo.ca
- LinkedIn: https://www.linkedin.com/company/cobreo
- Short summary: ${SITE}/llms.txt

## What Cobreo is

Cobreo is a web application for organizations that want tools shaped to how they work. The platform is assembled from modules. Cross-cutting capabilities (tasks, payments, calendar, import/export, AI analysis) stay available when moving between modules.

Custom work is possible: a private module for one organization, or a plugin that other organizations can add.

## Who it serves

Organizations that need CRM, events, satisfaction, booking, automation, public pages, user portals, HR, or finances — alone or combined. French and English.

## Data residency

The application and customer data are hosted in Canada.

## Modules (detail)

${moduleDetail()}

## Platform capabilities

- Tasks — Assign work and track where each item stands
- Payments — Collect and track payments tied to activity
- Calendar — Appointments and deadlines in one place
- Import and export — Bring data in or export it
- AI analysis — Readings from existing data

## Integrations

- Google — Calendar, email, and files according to what is turned on
- Microsoft — Microsoft 365 accounts and tools when relevant
- Stripe — Online payments processed with Stripe

## Pricing (high level)

Organizations pay only for modules activated for them. Exact figures are not published here; they are discussed in a demonstration according to needs.

## How to get a demo

Use the contact form (${SITE}/fr/contact or ${SITE}/en/contact) or email contact@cobreo.ca.

## Optional analysis tool

An on-site analysis tool helps choose where to begin: ${SITE}/fr/diagnostic

## Languages

Public site and product copy: French (Canada) and English (Canada).
`;
