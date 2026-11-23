/**
 * Downloads Grab3D E-Commerce lite ZIP (CC0) into `.cache/grab3d/`.
 */
import { createWriteStream, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";

const ZIP_URL =
  "https://grab3d.com/dl/3d-icons/e-commerce/3d-icons-e-commerce-lite.zip";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cacheDir = join(root, ".cache", "grab3d");
const zipPath = join(cacheDir, "3d-icons-e-commerce-lite.zip");

mkdirSync(cacheDir, { recursive: true });

if (existsSync(zipPath) && statSync(zipPath).size > 1_000_000) {
  console.log("Grab3D pack already cached:", zipPath);
  process.exit(0);
}

const res = await fetch(ZIP_URL);
if (!res.ok) {
  console.error("Download failed:", res.status, res.statusText);
  process.exit(1);
}

await pipeline(Readable.fromWeb(res.body), createWriteStream(zipPath));
console.log("Downloaded", zipPath);