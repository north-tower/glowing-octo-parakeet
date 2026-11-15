import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(
  "C:",
  "Users",
  "mhki",
  "nakuruhub",
  "nakuruhub",
  "landing.html",
);
const outDir = path.join(__dirname, "..", "components", "landing", "sections");

const html = fs.readFileSync(htmlPath, "utf8");
const mainMatch = html.match(/<main[^>]*>([\s\S]*)<\/main>/);
if (!mainMatch) throw new Error("no main");
const main = mainMatch[1];

const chunks = [
  { file: "HeroSection.tsx", marker: '<section class="hero">' },
  { file: "CategoriesSection.tsx", marker: '<section id="categories"' },
  { file: "WhySection.tsx", marker: '<section id="why"' },
  { file: "DashboardSection.tsx", marker: '<section id="dashboard"' },
  { file: "HowSection.tsx", marker: '<section id="how"' },
  { file: "FaqSection.tsx", marker: '<section id="faq"' },
  { file: "CtaBandSection.tsx", marker: '<section class="cta-band' },
];

function toJsx(chunk) {
  let s = chunk;
  s = s.replace(/\sclass=/g, " className=");
  s = s.replace(/href="index\.html\?start=vendor"/g, 'href="/app?start=vendor"');
  s = s.replace(/href="index\.html"/g, 'href="/app"');
  s = s.replace(/\bopen\b(?=\s*>)|(\s)open(?=\s)/g, "$1defaultOpen");
  return s;
}

function extract(marker, nextMarker) {
  const start = main.indexOf(marker);
  if (start === -1) throw new Error("missing " + marker);
  const end = nextMarker ? main.indexOf(nextMarker, start) : main.length;
  const slice = end === -1 ? main.slice(start) : main.slice(start, end);
  const close = slice.lastIndexOf("</section>");
  return slice.slice(0, close + "</section>".length);
}

for (let i = 0; i < chunks.length; i++) {
  const next = chunks[i + 1]?.marker;
  const raw = extract(chunks[i].marker, next);
  const jsxBody = toJsx(raw);
  const base = chunks[i].file.replace(".tsx", "");
  const usesDash = base === "DashboardSection";
  const usesCheckout = base === "HeroSection";
  const content = `"use client";

import Link from "next/link";
${usesCheckout || usesDash ? `import { useEffect } from "react";` : ""}
${usesCheckout ? `import { useCheckoutDemo } from "@/components/landing/hooks/useCheckoutDemo";` : ""}
${usesDash ? `import { useDashboardTabs } from "@/components/landing/hooks/useDashboardTabs";` : ""}

export function ${base}() {
${usesCheckout ? "  useCheckoutDemo();\n" : ""}${usesDash ? "  useDashboardTabs();\n" : ""}  return (
    <>
${jsxBody
  .split("\n")
  .map((line) => {
    let l = line;
    l = l.replace(/<a className=/g, "<Link className=");
    l = l.replace(/<\/a>/g, "</Link>").replace(/href="\/app/g, 'href="/app');
    return "      " + l;
  })
  .join("\n")}
    </>
  );
}
`;
  fs.writeFileSync(path.join(outDir, chunks[i].file), content);
  console.log("wrote", chunks[i].file, raw.length);
}

// Proof band between hero and categories
const proofStart = main.indexOf('<div class="proof-band"');
const proofEnd = main.indexOf("</div>", proofStart);
let depth = 0;
let i = proofStart;
for (; i < main.length; i++) {
  if (main.slice(i, i + 4) === "<div") depth++;
  if (main.slice(i, i + 6) === "</div>") {
    depth--;
    if (depth === 0) {
      i += 6;
      break;
    }
  }
}
const proof = main.slice(proofStart, i);
console.log("proof-band in hero extract?", proofStart < main.indexOf(chunks[1].marker));