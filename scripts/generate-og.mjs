/**
 * Regenerates public/og/default.png with the real Cobreo wordmark.
 * Usage: node scripts/generate-og.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

async function loadSharp() {
    try {
        const require = createRequire(import.meta.url);
        return require("sharp");
    } catch {
        const { execSync } = await import("node:child_process");
        console.log("Installing sharp temporarily…");
        execSync("npm install --no-save sharp", { cwd: root, stdio: "inherit" });
        const require = createRequire(import.meta.url);
        return require("sharp");
    }
}

const logoRaw = readFileSync(join(root, "public/images/logo.svg"), "utf8");
const logoInner = logoRaw
    .replace(/<\?xml[^>]*>/i, "")
    .replace(/<svg[^>]*>/i, "")
    .replace(/<\/svg>\s*$/i, "")
    .trim();

// Wordmark native viewBox: 75.5669 × 20.4049 → scale to ~520px wide
const logoScale = 520 / 75.5669;
const logoW = 75.5669 * logoScale;
const logoH = 20.4049 * logoScale;
const logoX = 96;
const logoY = 232;

const tagline = "Solutions applicatives pour vos opérations";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#EFEDEA"/>
  <circle cx="1080" cy="420" r="340" stroke="#4D6B97" stroke-opacity="0.14" stroke-width="56" fill="none"/>
  <circle cx="1080" cy="420" r="220" stroke="#4D6B97" stroke-opacity="0.08" stroke-width="40" fill="none"/>
  <g transform="translate(${logoX} ${logoY}) scale(${logoScale})">
    ${logoInner}
  </g>
  <text x="${logoX}" y="${logoY + logoH + 56}" fill="#525252" font-family="SN Pro, Segoe UI, Helvetica Neue, Arial, sans-serif" font-size="34" font-weight="300">${tagline}</text>
</svg>`;

const outSvg = join(root, "public/og/default.svg");
const outPng = join(root, "public/og/default.png");
writeFileSync(outSvg, svg, "utf8");

const sharp = await loadSharp();
await sharp(Buffer.from(svg)).png({ quality: 92, compressionLevel: 9 }).toFile(outPng);

console.log(`Wrote ${outPng}`);
console.log(`Also kept ${outSvg} as source`);
