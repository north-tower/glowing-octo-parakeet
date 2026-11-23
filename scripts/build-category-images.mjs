/**
 * Builds `public/categories/{slug}.png` (+ `.webp`) from inline marketplace-style SVG art.
 * Run: npm run categories:images
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "categories");
mkdirSync(outDir, { recursive: true });

const SLUGS = [
  "vehicles",
  "real-estate",
  "stays",
  "mobile-phones-tablets",
  "electronics",
  "home-garden",
  "fashion-and-beauty",
  "health-and-beauty",
  "babies-and-kids",
  "animals-and-pets",
  "agriculture-and-foodstuff",
  "hobbies-art-sport",
  "office-and-commercial-equipment-tools",
  "business-and-industry",
  "services",
  "repair-and-construction",
  "taxi",
  "rider",
  "jobs",
  "seeking-work-cvs",
];

/** @type {Record<string, { bg: string; accent: string; body: string }>} */
const TILES = {
  vehicles: {
    bg: "#FFF5E4",
    accent: "#E8A317",
    body: `<path d="M48 148h160l-22-42H70l-22 42z" fill="#F5E6D3"/><rect x="58" y="148" width="140" height="32" rx="8" fill="#EC5F7B"/><circle cx="88" cy="192" r="18" fill="#3D4543"/><circle cx="168" cy="192" r="18" fill="#3D4543"/>`,
  },
  "real-estate": {
    bg: "#EEF8F0",
    accent: "#2F9E66",
    body: `<path d="M128 52L52 122h24v78h104v-78h24L128 52z" fill="#fff" stroke="#2F9E66" stroke-width="4"/><rect x="106" y="142" width="44" height="58" rx="4" fill="#C8EBD4"/>`,
  },
  stays: {
    bg: "#E8F6F6",
    accent: "#0B7B75",
    body: `<rect x="62" y="88" width="132" height="100" rx="10" fill="#fff" stroke="#0B7B75" stroke-width="3"/><rect x="78" y="72" width="100" height="28" rx="6" fill="#4FC3BB"/><rect x="88" y="118" width="80" height="12" rx="4" fill="#C5E8E5"/>`,
  },
  "mobile-phones-tablets": {
    bg: "#EAF3FC",
    accent: "#3B82D6",
    body: `<rect x="98" y="58" width="60" height="108" rx="12" fill="#fff" stroke="#3B82D6" stroke-width="3"/><circle cx="128" cy="152" r="6" fill="#3B82D6"/><rect x="106" y="68" width="44" height="72" rx="4" fill="#D4E7FA"/>`,
  },
  electronics: {
    bg: "#F0EEFC",
    accent: "#6B5CE6",
    body: `<rect x="56" y="100" width="144" height="88" rx="10" fill="#fff" stroke="#6B5CE6" stroke-width="3"/><rect x="72" y="116" width="112" height="56" rx="4" fill="#D8D2FA"/><rect x="168" y="168" width="24" height="8" rx="2" fill="#6B5CE6"/>`,
  },
  "home-garden": {
    bg: "#FDF4EA",
    accent: "#C9783A",
    body: `<rect x="64" y="130" width="128" height="50" rx="8" fill="#E8B88A"/><rect x="78" y="108" width="32" height="28" rx="4" fill="#D4A574"/><rect x="118" y="108" width="60" height="28" rx="4" fill="#C9A06A"/>`,
  },
  "fashion-and-beauty": {
    bg: "#FCEEF3",
    accent: "#D6457A",
    body: `<path d="M108 58l-28 42h-18l14 96h88l14-96h-18l-28-42c-6-18-34-18-40 0z" fill="#F48AAF"/><path d="M118 68h20v16h-20z" fill="#fff" opacity=".6"/>`,
  },
  "health-and-beauty": {
    bg: "#F3EEFC",
    accent: "#8B5CF6",
    body: `<rect x="108" y="70" width="40" height="110" rx="10" fill="#fff" stroke="#8B5CF6" stroke-width="3"/><rect x="78" y="108" width="100" height="24" rx="8" fill="#C4B5FD"/><ellipse cx="128" cy="88" rx="22" ry="10" fill="#DDD6FE"/>`,
  },
  "babies-and-kids": {
    bg: "#FFF0F5",
    accent: "#F472B6",
    body: `<ellipse cx="128" cy="118" rx="52" ry="28" fill="#FBCFE8"/><rect x="88" y="138" width="80" height="44" rx="12" fill="#fff" stroke="#F472B6" stroke-width="3"/><circle cx="108" cy="108" r="8" fill="#F9A8D4"/><circle cx="148" cy="108" r="8" fill="#F9A8D4"/>`,
  },
  "animals-and-pets": {
    bg: "#F2F9EE",
    accent: "#65A30D",
    body: `<ellipse cx="128" cy="148" rx="58" ry="44" fill="#D9F99D"/><circle cx="96" cy="108" r="16" fill="#BEF264"/><circle cx="160" cy="108" r="16" fill="#BEF264"/><circle cx="116" cy="138" r="5" fill="#3F6212"/><circle cx="140" cy="138" r="5" fill="#3F6212"/>`,
  },
  "agriculture-and-foodstuff": {
    bg: "#F3FBEF",
    accent: "#4D7C0F",
    body: `<ellipse cx="108" cy="148" rx="36" ry="28" fill="#86EFAC"/><ellipse cx="148" cy="138" rx="32" ry="36" fill="#FDE047"/><path d="M88 108c0-16 12-28 40-28s40 12 40 28" fill="none" stroke="#4D7C0F" stroke-width="4"/>`,
  },
  "hobbies-art-sport": {
    bg: "#EEF6FC",
    accent: "#0284C7",
    body: `<circle cx="128" cy="128" r="52" fill="none" stroke="#0284C7" stroke-width="4"/><path d="M128 76v52l36 36" stroke="#0284C7" stroke-width="5" stroke-linecap="round"/><circle cx="128" cy="128" r="6" fill="#0284C7"/>`,
  },
  "office-and-commercial-equipment-tools": {
    bg: "#F4F4F5",
    accent: "#52525B",
    body: `<rect x="72" y="118" width="112" height="56" rx="8" fill="#E4E4E7"/><rect x="88" y="102" width="80" height="24" rx="4" fill="#A1A1AA"/><rect x="96" y="78" width="64" height="28" rx="4" fill="#D4D4D8"/>`,
  },
  "business-and-industry": {
    bg: "#EDF2F7",
    accent: "#475569",
    body: `<rect x="88" y="68" width="80" height="124" rx="4" fill="#fff" stroke="#475569" stroke-width="3"/><rect x="102" y="88" width="20" height="16" fill="#CBD5E1"/><rect x="102" y="112" width="20" height="16" fill="#CBD5E1"/><rect x="134" y="88" width="20" height="16" fill="#CBD5E1"/><rect x="134" y="112" width="20" height="16" fill="#CBD5E1"/>`,
  },
  services: {
    bg: "#FDF2F8",
    accent: "#DB2777",
    body: `<path d="M88 88l-16 48h112l-16-48H88z" fill="#F9A8D4"/><rect x="96" y="136" width="64" height="48" rx="8" fill="#fff" stroke="#DB2777" stroke-width="3"/><circle cx="128" cy="160" r="12" fill="#FBCFE8"/>`,
  },
  "repair-and-construction": {
    bg: "#FFF7ED",
    accent: "#EA580C",
    body: `<path d="M72 148l36-56 28 28-36 56-28-28z" fill="#FDBA74"/><rect x="132" y="118" width="56" height="20" rx="4" transform="rotate(45 160 128)" fill="#FED7AA"/><rect x="100" y="168" width="80" height="16" rx="4" fill="#EA580C"/>`,
  },
  taxi: {
    bg: "#FEF9C3",
    accent: "#CA8A04",
    body: `<path d="M52 148h152l-20-38H72l-20 38z" fill="#FDE047"/><rect x="62" y="148" width="132" height="28" rx="6" fill="#FACC15"/><rect x="108" y="122" width="40" height="14" rx="3" fill="#1F2937"/><text x="128" y="136" text-anchor="middle" font-size="10" font-family="system-ui" fill="#1F2937">TAXI</text>`,
  },
  rider: {
    bg: "#ECFEFF",
    accent: "#0891B2",
    body: `<circle cx="88" cy="168" r="22" fill="#3F3F46"/><circle cx="168" cy="168" r="22" fill="#3F3F46"/><path d="M72 120h32l20 48H80l-8-48z" fill="#22D3EE"/><path d="M104 120h48l12 48h-40l-20-48z" fill="#06B6D4"/>`,
  },
  jobs: {
    bg: "#EFF6FF",
    accent: "#2563EB",
    body: `<rect x="80" y="72" width="96" height="120" rx="10" fill="#fff" stroke="#2563EB" stroke-width="3"/><rect x="96" y="92" width="64" height="8" rx="2" fill="#BFDBFE"/><rect x="96" y="110" width="48" height="6" rx="2" fill="#DBEAFE"/><rect x="96" y="128" width="56" height="6" rx="2" fill="#DBEAFE"/><circle cx="152" cy="156" r="20" fill="#2563EB"/><path d="M144 156h16M152 148v16" stroke="#fff" stroke-width="3"/>`,
  },
  "seeking-work-cvs": {
    bg: "#F0FDFA",
    accent: "#0D9488",
    body: `<rect x="88" y="68" width="80" height="112" rx="8" fill="#fff" stroke="#0D9488" stroke-width="3"/><circle cx="128" cy="96" r="16" fill="#99F6E4"/><rect x="104" y="120" width="48" height="6" rx="2" fill="#CCFBF1"/><rect x="98" y="134" width="60" height="5" rx="2" fill="#CCFBF1"/><rect x="98" y="148" width="52" height="5" rx="2" fill="#CCFBF1"/>`,
  },
};

function svgFor(slug) {
  const t = TILES[slug];
  if (!t) throw new Error(`Missing art for ${slug}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img">
  <rect width="256" height="256" rx="56" fill="${t.bg}"/>
  ${t.body}
</svg>`;
}

for (const slug of SLUGS) {
  const svg = svgFor(slug);
  const raster = sharp(Buffer.from(svg)).resize(256, 256);
  const [png, webp] = await Promise.all([
    raster.clone().png({ compressionLevel: 9 }).toBuffer(),
    raster.clone().webp({ quality: 88 }).toBuffer(),
  ]);
  writeFileSync(join(outDir, `${slug}.png`), png);
  writeFileSync(join(outDir, `${slug}.webp`), webp);
  console.log(`wrote ${slug}.png`);
}