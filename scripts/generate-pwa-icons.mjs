/**
 * pnpm icons:pwa
 * Master: lib/nakuru/flamingo-mark-source.png (512×512; crop from public/images/flamingo-banner-photo.jpg)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const iconsDir = path.join(root, "public", "icons");
const srcPng = path.join(root, "lib", "nakuru", "flamingo-mark-source.png");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("Missing sharp. Install with: pnpm add -D sharp");
    process.exit(1);
  }

  if (!fs.existsSync(srcPng)) {
    console.error("Source PNG not found:", srcPng);
    process.exit(1);
  }

  fs.mkdirSync(iconsDir, { recursive: true });
  const pngBuf = fs.readFileSync(srcPng);

  const sizes = [
    { name: "logo-mark.png", size: 96, maskable: false },
    { name: "icon-192.png", size: 192, maskable: false },
    { name: "icon-512.png", size: 512, maskable: false },
    { name: "icon-512-maskable.png", size: 512, maskable: true },
    { name: "apple-touch-icon.png", size: 180, maskable: false },
    { name: "favicon-32.png", size: 32, maskable: false },
  ];

  for (const { name, size, maskable } of sizes) {
    let pipeline;
    if (maskable) {
      const inner = Math.round(size * 0.8);
      const resized = await sharp(pngBuf)
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
      pipeline = sharp(pngBuf).resize(size, size, { fit: "cover" }).png();
    }
    const out = path.join(iconsDir, name);
    await pipeline.toFile(out);
    console.log("Wrote", path.relative(root, out));
  }

  const appIcon = path.join(root, "app", "icon.png");
  await sharp(pngBuf).resize(512, 512).png().toFile(appIcon);
  console.log("Wrote", path.relative(root, appIcon));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});