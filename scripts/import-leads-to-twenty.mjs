/**
 * One-shot import of Cobreo Supabase leads into the local Twenty workspace.
 * Reads TWENTY_* and SUPABASE_* from .env. Safe to re-run: skips a lead
 * whose opportunity already has the same cobreoLeadId.
 */
import fs from "node:fs";
import https from "node:https";
import { Resolver } from "node:dns/promises";

function loadEnv(file) {
    if (!fs.existsSync(file)) return;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq < 0) continue;
        const key = trimmed.slice(0, eq).trim();
        if (process.env[key]?.trim()) continue;
        let value = trimmed.slice(eq + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }
        process.env[key] = value;
    }
}

loadEnv(new URL("../.env", import.meta.url));

const twentyBase = process.env.TWENTY_API_URL?.trim().replace(/\/$/, "");
const twentyKey = process.env.TWENTY_API_KEY?.trim();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SECRET_KEY?.trim();

if (!twentyBase || !twentyKey || !supabaseUrl || !supabaseKey) {
    console.error("Missing TWENTY_API_URL, TWENTY_API_KEY, NEXT_PUBLIC_SUPABASE_URL, or SUPABASE_SECRET_KEY");
    process.exit(1);
}

const STAGE_BY_STATUS = {
    new: "NEW",
    in_progress: "MEETING",
    won: "CUSTOMER",
    archived: "SCREENING",
};

const twentyHost = new URL(twentyBase).hostname;
let twentyAddress = null;

async function resolveTwenty() {
    try {
        const resolver = new Resolver();
        resolver.setServers(["1.1.1.1", "1.0.0.1"]);
        const addresses = await resolver.resolve4(twentyHost);
        twentyAddress = addresses[0] || null;
    } catch (error) {
        console.error("dns", error instanceof Error ? error.message : error);
    }
    if (!twentyAddress) twentyAddress = "172.64.80.1";
}

function requestJson(url, { method = "GET", headers = {}, body } = {}, pin) {
    return new Promise((resolve, reject) => {
        const target = new URL(url);
        const payload = body == null ? null : Buffer.from(JSON.stringify(body));
        const req = https.request(
            {
                protocol: target.protocol,
                hostname: target.hostname,
                port: target.port || 443,
                path: `${target.pathname}${target.search}`,
                method,
                headers: {
                    ...headers,
                    ...(payload ? { "Content-Length": payload.length } : {}),
                },
                servername: target.hostname,
                lookup: pin
                    ? (hostname, options, callback) => {
                          const done = typeof options === "function" ? options : callback;
                          const opts = typeof options === "function" ? {} : options || {};
                          if (opts.all) done(null, [{ address: twentyAddress, family: 4 }]);
                          else done(null, twentyAddress, 4);
                      }
                    : undefined,
            },
            (res) => {
                const chunks = [];
                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => {
                    const text = Buffer.concat(chunks).toString("utf8");
                    let json = null;
                    try {
                        json = text ? JSON.parse(text) : null;
                    } catch {
                        json = null;
                    }
                    resolve({ status: res.statusCode || 0, json, text });
                });
            },
        );
        req.on("error", reject);
        if (payload) req.write(payload);
        req.end();
    });
}

async function twenty(path, init) {
    return requestJson(`${twentyBase}${path}`, {
        method: init?.method || "GET",
        headers: {
            Authorization: `Bearer ${twentyKey}`,
            "Content-Type": "application/json",
        },
        body: init?.body,
    }, true);
}

async function supabaseGet(path) {
    const res = await requestJson(`${supabaseUrl}/rest/v1/${path}`, {
        headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
        },
    });
    if (res.status >= 300) {
        throw new Error(`supabase ${path} ${res.status} ${res.text.slice(0, 300)}`);
    }
    return res.json;
}

function asId(payload) {
    const data = payload?.data;
    return (
        data?.createOpportunity?.id ||
        data?.createCompany?.id ||
        data?.createPerson?.id ||
        data?.createNote?.id ||
        data?.createTask?.id ||
        data?.id ||
        payload?.id ||
        null
    );
}

function e164(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    if (digits.length > 11) return `+${digits}`;
    return null;
}

function splitName(fullName) {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: "Contact", lastName: "" };
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

async function ensureLeadField() {
    const objectsRes = await twenty("/rest/metadata/objects?limit=100");
    if (objectsRes.status >= 300) {
        throw new Error(`objects ${objectsRes.status} ${objectsRes.text.slice(0, 400)}`);
    }
    const objectList =
        objectsRes.json?.data?.objects ||
        objectsRes.json?.objects ||
        objectsRes.json?.data ||
        [];
    const names = Array.isArray(objectList)
        ? objectList.map((object) => object.nameSingular || object.name || object.id).join(", ")
        : Object.keys(objectsRes.json || {}).join(", ");
    const opportunity = (Array.isArray(objectList) ? objectList : []).find(
        (object) => object.nameSingular === "opportunity",
    );
    if (!opportunity) throw new Error(`opportunity object missing (${objectsRes.status}) [${names.slice(0, 500)}]`);

    const fieldsRes = await twenty(
        `/rest/metadata/fields?limit=200&filter=${encodeURIComponent(`objectMetadataId[eq]:${opportunity.id}`)}`,
    );
    if (fieldsRes.status >= 300) {
        throw new Error(`fields ${fieldsRes.status} ${fieldsRes.text.slice(0, 400)}`);
    }
    if (fieldsRes.json?.data?.fields?.some((field) => field.name === "cobreoLeadId")) return;

    const createRes = await twenty("/rest/metadata/fields", {
        method: "POST",
        body: {
            objectMetadataId: opportunity.id,
            name: "cobreoLeadId",
            label: "Cobreo lead",
            type: "TEXT",
            isNullable: true,
        },
    });
    if (createRes.status >= 300 && !createRes.text.includes("already used")) {
        throw new Error(`create field ${createRes.status} ${createRes.text.slice(0, 400)}`);
    }
}

async function findOpportunity(cobreoLeadId) {
    const res = await twenty(
        `/rest/opportunities?limit=1&filter=${encodeURIComponent(`cobreoLeadId[eq]:${cobreoLeadId}`)}`,
    );
    if (res.status >= 300) return null;
    return res.json?.data?.opportunities?.[0]?.id ?? null;
}

async function createCompany(name) {
    const existing = await twenty(
        `/rest/companies?limit=1&filter=${encodeURIComponent(`name[eq]:${name}`)}`,
    );
    const found = existing.json?.data?.companies?.[0]?.id;
    if (existing.status < 300 && found) return found;

    const res = await twenty("/rest/companies", { method: "POST", body: { name } });
    if (res.status >= 300) throw new Error(`company ${res.status} ${res.text.slice(0, 300)}`);
    const id = asId(res.json);
    if (!id) throw new Error("company id missing");
    return id;
}

async function createPerson({ fullName, email, phone, role, companyId }) {
    const res = await twenty("/rest/people", {
        method: "POST",
        body: {
            name: splitName(fullName),
            emails: email ? { primaryEmail: email } : undefined,
            phones: e164(phone) ? { primaryPhoneNumber: e164(phone), primaryPhoneCallingCode: "+1" } : undefined,
            jobTitle: role || undefined,
            companyId,
        },
    });
    if (res.status >= 300) throw new Error(`person ${res.status} ${res.text.slice(0, 300)}`);
    const id = asId(res.json);
    if (!id) throw new Error("person id missing");
    return id;
}

async function relationField(objectName, preferred) {
    const objectsRes = await twenty("/rest/metadata/objects?limit=100");
    const objectList = objectsRes.json?.data?.objects || [];
    const object = objectList.find((item) => item.nameSingular === objectName);
    if (!object) return preferred[0];
    const fieldsRes = await twenty(
        `/rest/metadata/fields?limit=200&filter=${encodeURIComponent(`objectMetadataId[eq]:${object.id}`)}`,
    );
    const names = (fieldsRes.json?.data?.fields || []).map((field) => field.name);
    console.log(`${objectName} fields: ${names.join(", ")}`);
    return preferred.find((name) => names.includes(name)) || preferred[0];
}

async function attachNote(opportunityId, title, body) {
    if (!body?.trim()) return;
    const noteRes = await twenty("/rest/notes", {
        method: "POST",
        body: { title, bodyV2: { markdown: body } },
    });
    if (noteRes.status >= 300) throw new Error(`note ${noteRes.status} ${noteRes.text.slice(0, 300)}`);
    const noteId = asId(noteRes.json);
    if (!noteId) return;
    const opportunityField = await relationField("noteTarget", [
        "targetOpportunityId",
        "opportunityId",
    ]);
    const targetRes = await twenty("/rest/noteTargets", {
        method: "POST",
        body: { noteId, [opportunityField]: opportunityId },
    });
    if (targetRes.status >= 300) {
        throw new Error(`note target ${targetRes.status} ${targetRes.text.slice(0, 300)}`);
    }
}

async function attachTask(opportunityId, task) {
    const taskRes = await twenty("/rest/tasks", {
        method: "POST",
        body: {
            title: task.title,
            status: task.done ? "DONE" : "TODO",
            dueAt: task.dueAt || undefined,
            bodyV2: task.body ? { markdown: task.body } : undefined,
        },
    });
    if (taskRes.status >= 300) throw new Error(`task ${taskRes.status} ${taskRes.text.slice(0, 300)}`);
    const taskId = asId(taskRes.json);
    if (!taskId) return;
    const opportunityField = await relationField("taskTarget", [
        "targetOpportunityId",
        "opportunityId",
    ]);
    const targetRes = await twenty("/rest/taskTargets", {
        method: "POST",
        body: { taskId, [opportunityField]: opportunityId },
    });
    if (targetRes.status >= 300) {
        throw new Error(`task target ${targetRes.status} ${targetRes.text.slice(0, 300)}`);
    }
}

async function attachLeadActivity(opportunityId, lead, activities, nextSteps, appointments, submissions, diagnostics, bookings) {
    const notes = [{ title: "Origine", body: `Source : ${lead.source}` }];
    if (lead.notes?.trim()) notes.push({ title: "Notes", body: lead.notes });
    for (const submission of submissions) {
        if (submission.message?.trim()) notes.push({ title: "Message", body: submission.message });
    }
    for (const diagnostic of diagnostics) {
        if (diagnostic.summary?.trim()) notes.push({ title: "Résumé", body: diagnostic.summary });
    }
    for (const activity of activities) {
        const when = activity.occurred_at ? activity.occurred_at.slice(0, 16).replace("T", " ") : "";
        const body = [when, activity.details].filter(Boolean).join("\n");
        notes.push({ title: activity.summary || activity.kind, body: body || activity.summary });
    }
    for (const booking of bookings) {
        const body = [booking.starts_at, booking.prospect_name, booking.diagnostic_summary].filter(Boolean).join("\n");
        notes.push({ title: "Rendez-vous", body });
    }

    const seen = new Set();
    for (const note of notes) {
        const key = note.body.trim();
        if (!note.body?.trim() || seen.has(key)) continue;
        seen.add(key);
        await attachNote(opportunityId, note.title, note.body);
    }

    for (const step of nextSteps) {
        if (step.status === "cancelled") continue;
        await attachTask(opportunityId, {
            title: step.title,
            done: step.status === "done",
            dueAt: step.due_at ? `${step.due_at}T12:00:00.000Z` : null,
            body: step.notes,
        });
    }
    for (const appointment of appointments) {
        if (appointment.status === "cancelled") continue;
        await attachTask(opportunityId, {
            title: appointment.title,
            done: appointment.status === "done",
            dueAt: appointment.starts_at,
            body: [appointment.location_or_link, appointment.notes].filter(Boolean).join("\n"),
        });
    }
}

function isTestContact(contact) {
    const company = (contact.company_name || "").trim().toLowerCase();
    const email = (contact.email || "").trim().toLowerCase();
    return company === "test" || company === "asdasd" || email === "derick0232@gmail.com";
}

async function importLead(lead, people, activities, nextSteps, appointments, submissions, diagnostics, bookings) {
    const existing = await findOpportunity(lead.id);
    if (existing) {
        console.log(`skip ${lead.id} already in Twenty`);
        return;
    }

    const companyName = lead.contacts?.company_name?.trim() || lead.title || "Sans entreprise";
    const companyId = await createCompany(companyName);

    const roster = people.length
        ? people
        : lead.contacts
          ? [{
                full_name: lead.contacts.full_name,
                email: lead.contacts.email,
                phone: lead.contacts.phone,
                role: null,
            }]
          : [];

    let pointOfContactId = null;
    for (const person of roster) {
        const personId = await createPerson({
            fullName: person.full_name,
            email: person.email,
            phone: person.phone,
            role: person.role,
            companyId,
        });
        if (!pointOfContactId) pointOfContactId = personId;
    }

    const stage = STAGE_BY_STATUS[lead.status] || "NEW";
    const title = lead.status === "archived" ? `[Archivé] ${lead.title}` : lead.title;
    const opportunityRes = await twenty("/rest/opportunities", {
        method: "POST",
        body: {
            name: title,
            stage,
            companyId,
            pointOfContactId,
            cobreoLeadId: lead.id,
        },
    });
    if (opportunityRes.status >= 300) {
        throw new Error(`opportunity ${opportunityRes.status} ${opportunityRes.text.slice(0, 400)}`);
    }
    const opportunityId = asId(opportunityRes.json);
    if (!opportunityId) throw new Error("opportunity id missing");

    await attachLeadActivity(opportunityId, lead, activities, nextSteps, appointments, submissions, diagnostics, bookings);
    console.log(`imported ${lead.id} → ${opportunityId}`);
}

async function main() {
    await resolveTwenty();
    await ensureLeadField();

    const leads = await supabaseGet(
        "leads?select=id,source,status,title,notes,contact_id,contacts(full_name,email,phone,company_name,notes)",
    );
    const people = await supabaseGet("lead_people?select=lead_id,full_name,role,email,phone,is_primary,notes");
    const activities = await supabaseGet("lead_activities?select=lead_id,kind,occurred_at,summary,details&order=occurred_at.asc");
    const nextSteps = await supabaseGet("lead_next_steps?select=lead_id,title,due_at,status,notes");
    const appointments = await supabaseGet("lead_appointments?select=lead_id,title,starts_at,location_or_link,status,notes");
    const submissions = await supabaseGet("contact_submissions?select=lead_id,message");
    const diagnostics = await supabaseGet("diagnostic_submissions?select=lead_id,summary");
    const bookings = await supabaseGet("bookings?select=lead_id,starts_at,prospect_name,diagnostic_summary,status");
    const contacts = await supabaseGet("contacts?select=id,email,full_name,company_name,phone,notes");

    const byLead = (rows) => {
        const map = new Map();
        for (const row of rows) {
            const list = map.get(row.lead_id) || [];
            list.push(row);
            map.set(row.lead_id, list);
        }
        return map;
    };
    const peopleByLead = byLead(people);
    const activitiesByLead = byLead(activities);
    const stepsByLead = byLead(nextSteps);
    const appointmentsByLead = byLead(appointments);
    const submissionsByLead = byLead(submissions);
    const diagnosticsByLead = byLead(diagnostics);
    const bookingsByLead = byLead(bookings);

    for (const lead of leads) {
        await importLead(
            lead,
            peopleByLead.get(lead.id) || [],
            activitiesByLead.get(lead.id) || [],
            stepsByLead.get(lead.id) || [],
            appointmentsByLead.get(lead.id) || [],
            submissionsByLead.get(lead.id) || [],
            diagnosticsByLead.get(lead.id) || [],
            bookingsByLead.get(lead.id) || [],
        );
    }

    const linkedContactIds = new Set(leads.map((lead) => lead.contact_id));
    let orphanCompanies = 0;
    for (const contact of contacts) {
        if (linkedContactIds.has(contact.id) || isTestContact(contact)) continue;
        const companyId = await createCompany(contact.company_name?.trim() || contact.full_name || "Sans entreprise");
        await createPerson({
            fullName: contact.full_name || contact.email || "Contact",
            email: contact.email,
            phone: contact.phone,
            companyId,
        });
        orphanCompanies += 1;
    }

    console.log(`done leads=${leads.length} extra_contacts=${orphanCompanies}`);
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});
