/**
 * Maps Grab3D CC0 e-commerce PNGs into `public/categories/{slug}.png`.
 * Requires: `.cache/grab3d/3d-icons-e-commerce-lite/png/256/` (see npm script).
 */
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packRoot = join(root, ".cache", "grab3d", "3d-icons-e-commerce-lite");
const src256 = join(packRoot, "3d-icons-e-commerce", "png", "256");
const outDir = join(root, "public", "categories");
const zipPath = join(root, ".cache", "grab3d", "3d-icons-e-commerce-lite.zip");
const licenseSrc = join(packRoot, "3d-icons-e-commerce", "LICENSE.txt");

/** @type {Record<string, string>} slug -> filename inside png/256 */
const SLUG_TO_ICON = {
  vehicles: "delivery-truck-pastel-front.png",
  "real-estate": "store-pastel-front.png",
  stays: "ticket-pastel-front.png",
  "mobile-phones-tablets": "barcode-pastel-front.png",
  electronics: "credit-card-pastel-front.png",
  "home-garden": "basket-pastel-front.png",
  "fashion-and-beauty": "shopping-bag-pastel-front.png",
  "health-and-beauty": "parcel-check-pastel-front.png",
  "babies-and-kids": "gift-card-pastel-front.png",
  "animals-and-pets": "shopping-bag-pastel-angle.png",
  "agriculture-and-foodstuff": "basket-pastel-angle.png",
  "hobbies-art-sport": "ticket-pastel-angle.png",
  "office-and-commercial-equipment-tools": "clipboard-pastel-front.png",
  "business-and-industry": "safe-pastel-front.png",
  services: "receipt-pastel-front.png",
  "repair-and-construction": "parcel-open-pastel-front.png",
  taxi: "delivery-truck-pastel-angle.png",
  rider: "delivery-truck-vivid-front.png",
  jobs: "clipboard-pastel-angle.png",
  "seeking-work-cvs": "money-bag-pastel-front.png",
};

if (!existsSync(src256)) {
  if (!existsSync(zipPath)) {
    console.error("Missing Grab3D pack. Run: npm run categories:fetch-grab3d");
    process.exit(1);
  }
  mkdirSync(packRoot, { recursive: true });
  execFileSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${packRoot.replace(/'/g, "''")}' -Force`,
    ],
    { stdio: "inherit" },
  );
}

mkdirSync(outDir, { recursive: true });

const size = 256;
const corner = 56;
const pad = 28;

function tileBackground() {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" rx="${corner}" fill="#ffffff"/>
    </svg>`,
  );
}

for (const slug of Object.keys(SLUG_TO_ICON)) {
  const iconFile = SLUG_TO_ICON[slug];
  if (!iconFile) {
    console.warn(`No icon mapping for ${slug}`);
    continue;
  }
  const iconPath = join(src256, iconFile);
  if (!existsSync(iconPath)) {
    throw new Error(`Missing icon file: ${iconPath}`);
  }

  const icon = await sharp(iconPath)
    .resize(size - pad * 2, size - pad * 2, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  const png = await sharp(tileBackground())
    .composite([{ input: icon, gravity: "centre" }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  writeFileSync(join(outDir, `${slug}.png`), png);
  console.log(`${slug} <- ${iconFile}`);
}

if (existsSync(licenseSrc)) {
  copyFileSync(licenseSrc, join(outDir, "GRAB3D-LICENSE.txt"));
}

const notice = `Category tile images include CC0 1.0 icons from Grab3D E-Commerce pack.
Source: https://grab3d.com/3d-icons/e-commerce/
`;
writeFileSync(join(outDir, "ATTRIBUTION.txt"), notice);