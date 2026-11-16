/**
 * One-off: pnpm exec node scripts/generate-pwa-icons.mjs
 * Requires: sharp (devDependency)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const iconsDir = path.join(root, "public", "icons");
const srcSvg = path.join(iconsDir, "flamingo-mark.svg");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error(
      "Missing sharp. Install with: pnpm add -D sharp",
    );
    process.exit(1);
  }

  if (!fs.existsSync(srcSvg)) {
    console.error("Source SVG not found:", srcSvg);
    process.exit(1);
  }

  fs.mkdirSync(iconsDir, { recursive: true });
  const svgBuf = fs.readFileSync(srcSvg);

  const sizes = [
    { name: "icon-192.png", size: 192, maskable: false },
    { name: "icon-512.png", size: 512, maskable: false },
    { name: "icon-512-maskable.png", size: 512, maskable: true },
    { name: "apple-touch-icon.png", size: 180, maskable: false },
  ];

  for (const { name, size, maskable } of sizes) {
    let pipeline;
    if (maskable) {
      /** Android maskable safe zone ~80% diameter */
      const inner = Math.round(size * 0.62);
      const resized = await sharp(svgBuf)
        .resize(inner, inner, { fit: "contain", background: "#0d5c58" })
        .png()
        .toBuffer();
      pipeline = sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: "#0d5c58",
        },
      })
        .composite([{ input: resized, gravity: "centre" }])
        .png();
    } else {
      pipeline = sharp(svgBuf).resize(size, size).png();
    }
    const out = path.join(iconsDir, name);
    await pipeline.toFile(out);
    console.log("Wrote", path.relative(root, out));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});