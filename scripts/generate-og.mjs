/**
 * Regenerates public/og/default.png with the real Cobreo wordmark
 * and the site mark (cobreomark), filled like cobreo-logo-mark.
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

function stripSvgShell(raw) {
    return raw
        .replace(/<\?xml[^>]*>/i, "")
        .replace(/<!DOCTYPE[^>]*>/i, "")
        .replace(/<svg[^>]*>/i, "")
        .replace(/<\/svg>\s*$/i, "")
        .trim();
}

function readViewBox(raw) {
    const match = /viewBox=["']([^"']+)["']/.exec(raw);
    if (!match) return null;
    const parts = match[1].split(/\s+/).map(Number);
    return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
}

const logoRaw = readFileSync(join(root, "public/images/cobreologo.svg"), "utf8");
const markRaw = readFileSync(join(root, "public/images/cobreomark.svg"), "utf8");
const logoInner = stripSvgShell(logoRaw);
const logoBox = readViewBox(logoRaw) || { x: 41, y: 52, w: 1366, h: 371 };

// Mark path only — paint with site gradient (ignore embedded fills).
const markPathMatch = /<path\b[^>]*\sd="([^"]+)"[^>]*>/i.exec(markRaw);
if (!markPathMatch) throw new Error("Could not extract cobreomark path");
const markPathD = markPathMatch[1];
const markBox = readViewBox(markRaw) || { x: 41, y: 132, w: 494, h: 290 };

// Wordmark → ~520px wide (same on-screen presence as before)
const logoScale = 520 / logoBox.w;
const logoH = logoBox.h * logoScale;
const logoX = 96;
const logoY = 232;

// Site mark — vertically centered, nudged 20px right of previous X
const markTargetW = 780;
const markScale = markTargetW / markBox.w;
const markH = markBox.h * markScale;
const markX = 700 - markBox.x * markScale + 20;
const markY = (630 - markH) / 2 - markBox.y * markScale;

const tagline = "Solutions applicatives pour vos opérations";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="og_mark_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#CAD3E0"/>
      <stop offset="38%" stop-color="#4D6B97"/>
      <stop offset="68%" stop-color="#253353"/>
      <stop offset="100%" stop-color="#B1B6A6"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#EFEDEA"/>
  <g transform="translate(${markX} ${markY}) scale(${markScale})" opacity="0.32" aria-hidden="true">
    <path d="${markPathD}" fill="url(#og_mark_grad)"/>
  </g>
  <g transform="translate(${logoX - logoBox.x * logoScale} ${logoY - logoBox.y * logoScale}) scale(${logoScale})">
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
