import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specPath = path.join(root, "src/content/diagnostic/v8/spec.json");
const translationsPath = path.join(root, "scripts/diagnostic-en-translations.json");

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const translations = JSON.parse(fs.readFileSync(translationsPath, "utf8"));
const used = new Set();
const missing = [];
let added = 0;

function childPath(parentPath, key) {
    return parentPath ? `${parentPath}.${key}` : key;
}

function walk(value, parentPath = "") {
    if (Array.isArray(value)) {
        value.forEach((item, index) => walk(item, `${parentPath}[${index}]`));
        return;
    }
    if (!value || typeof value !== "object") return;

    for (const [key, child] of Object.entries(value)) {
        if (key.endsWith("_fr") && typeof child === "string") {
            const enKey = `${key.slice(0, -3)}_en`;
            const translationKey = childPath(parentPath, key);
            if (typeof value[enKey] !== "string") {
                const translation = translations[translationKey];
                if (typeof translation !== "string") {
                    missing.push(translationKey);
                } else {
                    value[enKey] = translation;
                    added += 1;
                }
            }
            used.add(translationKey);
        }
        walk(child, childPath(parentPath, key));
    }
}

walk(spec);

const unused = Object.keys(translations).filter((key) => !used.has(key));
if (missing.length || unused.length) {
    if (missing.length) console.error("Missing translations:", missing);
    if (unused.length) console.error("Unused translations:", unused);
    process.exit(1);
}

fs.writeFileSync(specPath, `${JSON.stringify(spec, null, 2)}\n`);
console.log(`Added ${added} English strings to ${specPath}`);
