/**
 * Builds a light (footer) wordmark from cobreologo.svg.
 * Usage: node scripts/build-logo-footer.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";

const src = readFileSync("public/images/cobreologo.svg", "utf8");

// Flatten brand gradients to the footer's light fill.
const light = src
    .replace(/fill="url\(#paint[^"]+\)"/g, 'fill="#EFEDEA"')
    .replace(/<defs>[\s\S]*?<\/defs>/, "");

writeFileSync("public/images/logo-footer.svg", light);
console.log("Wrote public/images/logo-footer.svg from cobreologo");
