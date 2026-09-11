import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specPath = path.join(root, "src/content/diagnostic/v8/spec.json");
const outputPath = path.join(root, "scripts/diagnostic-fr-strings.json");

const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const strings = [];

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
            strings.push({ path: parentPath, key, fr: child });
        }
        walk(child, childPath(parentPath, key));
    }
}

walk(spec);
fs.writeFileSync(outputPath, `${JSON.stringify(strings, null, 2)}\n`);
console.log(`Extracted ${strings.length} French strings to ${outputPath}`);
