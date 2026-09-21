import { ensureServerEnv } from "@/lib/server-env";

export type TwentyPersonInput = {
    fullName: string;
    email?: string | null;
    phone?: string | null;
    role?: string | null;
};

export type TwentyNoteInput = {
    title: string;
    body: string;
};

export type TwentyTaskInput = {
    title: string;
    dueAt?: string | null;
    done?: boolean;
    body?: string | null;
};

export type TwentyLeadInput = {
    cobreoLeadId: string;
    title: string;
    status: string;
    source: string;
    companyName?: string | null;
    people: TwentyPersonInput[];
    notes: TwentyNoteInput[];
    tasks: TwentyTaskInput[];
};

const STAGE_BY_STATUS: Record<string, string> = {
    new: "NEW",
    in_progress: "MEETING",
    won: "CUSTOMER",
    archived: "SCREENING",
};

function configured(): { base: string; headers: Record<string, string> } | null {
    ensureServerEnv();
    const base = process.env.TWENTY_API_URL?.trim().replace(/\/$/, "");
    const key = process.env.TWENTY_API_KEY?.trim();
    if (!base || !key) return null;
    const headers: Record<string, string> = {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
    };
    const accessId = process.env.TWENTY_CF_ACCESS_CLIENT_ID?.trim();
    const accessSecret = process.env.TWENTY_CF_ACCESS_CLIENT_SECRET?.trim();
    if (accessId && accessSecret) {
        headers["CF-Access-Client-Id"] = accessId;
        headers["CF-Access-Client-Secret"] = accessSecret;
    }
    return { base, headers };
}

async function twentyFetch(path: string, init?: RequestInit): Promise<Response | null> {
    const cfg = configured();
    if (!cfg) return null;
    return fetch(`${cfg.base}${path}`, {
        ...init,
        headers: { ...cfg.headers, ...(init?.headers || {}) },
    });
}

function e164(phone: string | null | undefined): string | null {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
    return null;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return { firstName: "Contact", lastName: "" };
    if (parts.length === 1) return { firstName: parts[0]!, lastName: "" };
    return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

function asId(payload: unknown): string | null {
    if (!payload || typeof payload !== "object") return null;
    const record = payload as { data?: { createCompany?: { id?: string }; createPerson?: { id?: string }; createOpportunity?: { id?: string }; createNote?: { id?: string }; createTask?: { id?: string }; id?: string }; id?: string };
    const data = record.data;
    return (
        data?.createOpportunity?.id ||
        data?.createCompany?.id ||
        data?.createPerson?.id ||
        data?.createNote?.id ||
        data?.createTask?.id ||
        data?.id ||
        record.id ||
        null
    );
}

let fieldReady: Promise<boolean> | null = null;

async function ensureLeadField(): Promise<boolean> {
    if (!fieldReady) {
        fieldReady = (async () => {
            const objectsRes = await twentyFetch("/rest/metadata/objects?limit=100");
            if (!objectsRes?.ok) {
                console.error("[twenty] objects", objectsRes?.status, await objectsRes?.text());
                return false;
            }
            const objects = (await objectsRes.json()) as {
                data?: { objects?: Array<{ id: string; nameSingular: string }> } | Array<{ id: string; nameSingular: string }>;
            };
            const objectList = Array.isArray(objects.data) ? objects.data : objects.data?.objects;
            const opportunity = objectList?.find((o) => o.nameSingular === "opportunity");
            if (!opportunity) return false;

            const fieldsRes = await twentyFetch(
                `/rest/metadata/fields?limit=200&filter=${encodeURIComponent(`objectMetadataId[eq]:${opportunity.id}`)}`,
            );
            if (!fieldsRes?.ok) return false;
            const fields = (await fieldsRes.json()) as {
                data?: { fields?: Array<{ name: string }> };
            };
            if (fields.data?.fields?.some((f) => f.name === "cobreoLeadId")) return true;

            const createRes = await twentyFetch("/rest/metadata/fields", {
                method: "POST",
                body: JSON.stringify({
                    objectMetadataId: opportunity.id,
                    name: "cobreoLeadId",
                    label: "Cobreo lead",
                    type: "TEXT",
                    isNullable: true,
                }),
            });
            if (!createRes?.ok) {
                const detail = await createRes?.text();
                if (detail?.includes("already used")) return true;
                console.error("[twenty] create field", createRes?.status, detail);
                return false;
            }
            return true;
        })().catch((error) => {
            console.error("[twenty] ensure field", error);
            fieldReady = null;
            return false;
        });
    }
    return fieldReady;
}

async function findOpportunity(cobreoLeadId: string): Promise<string | null> {
    const res = await twentyFetch(
        `/rest/opportunities?limit=1&filter=${encodeURIComponent(`cobreoLeadId[eq]:${cobreoLeadId}`)}`,
    );
    if (!res?.ok) return null;
    const body = (await res.json()) as { data?: { opportunities?: Array<{ id: string }> } };
    return body.data?.opportunities?.[0]?.id ?? null;
}

/** Mirror a Cobreo lead into Twenty. Never throws. */
export async function syncLeadToTwenty(input: TwentyLeadInput): Promise<void> {
    try {
        if (!configured()) return;
        const ready = await ensureLeadField();
        if (!ready) {
            console.warn("[twenty] cobreoLeadId field unavailable");
            return;
        }
        if (await findOpportunity(input.cobreoLeadId)) return;

        const companyName = input.companyName?.trim() || input.title;
        const companyRes = await twentyFetch("/rest/companies", {
            method: "POST",
            body: JSON.stringify({ name: companyName }),
        });
        const companyId = companyRes?.ok ? asId(await companyRes.json()) : null;

        let pointOfContactId: string | null = null;
        for (const person of input.people) {
            const personRes = await twentyFetch("/rest/people", {
                method: "POST",
                body: JSON.stringify({
                    name: splitName(person.fullName),
                    emails: person.email ? { primaryEmail: person.email } : undefined,
                    phones: e164(person.phone)
                        ? { primaryPhoneNumber: e164(person.phone), primaryPhoneCallingCode: "+1" }
                        : undefined,
                    jobTitle: person.role || undefined,
                    companyId,
                }),
            });
            const personId = personRes?.ok ? asId(await personRes.json()) : null;
            if (!pointOfContactId && personId) pointOfContactId = personId;
        }

        const stage = STAGE_BY_STATUS[input.status] || "NEW";
        const title = input.status === "archived" ? `[Archivé] ${input.title}` : input.title;
        const opportunityRes = await twentyFetch("/rest/opportunities", {
            method: "POST",
            body: JSON.stringify({
                name: title,
                stage,
                companyId,
                pointOfContactId,
                cobreoLeadId: input.cobreoLeadId,
            }),
        });
        if (!opportunityRes?.ok) {
            console.error("[twenty] opportunity", opportunityRes?.status, await opportunityRes?.text());
            return;
        }
        const opportunityId = asId(await opportunityRes.json());
        if (!opportunityId) return;

        for (const note of [{ title: "Origine", body: `Source : ${input.source}` }, ...input.notes]) {
            if (!note.body.trim()) continue;
            const noteRes = await twentyFetch("/rest/notes", {
                method: "POST",
                body: JSON.stringify({
                    title: note.title,
                    bodyV2: { markdown: note.body },
                }),
            });
            const noteId = noteRes?.ok ? asId(await noteRes.json()) : null;
            if (!noteId) continue;
            await twentyFetch("/rest/noteTargets", {
                method: "POST",
                body: JSON.stringify({ noteId, targetOpportunityId: opportunityId }),
            });
        }

        for (const task of input.tasks) {
            const taskRes = await twentyFetch("/rest/tasks", {
                method: "POST",
                body: JSON.stringify({
                    title: task.title,
                    status: task.done ? "DONE" : "TODO",
                    dueAt: task.dueAt || undefined,
                    bodyV2: task.body ? { markdown: task.body } : undefined,
                }),
            });
            const taskId = taskRes?.ok ? asId(await taskRes.json()) : null;
            if (!taskId) continue;
            await twentyFetch("/rest/taskTargets", {
                method: "POST",
                body: JSON.stringify({ taskId, targetOpportunityId: opportunityId }),
            });
        }
    } catch (error) {
        console.error("[twenty] sync", error);
    }
}
