/**
 * pnpm icons:pwa
 * Master lockup: lib/nakuru/logo-lockup-source.jpg
 * Writes the square flamingo mark, PNG lockup, favicons, PWA icons, and OG image.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const iconsDir = path.join(root, "public", "icons");
const imagesDir = path.join(root, "public", "images");
const srcJpg = path.join(root, "lib", "nakuru", "logo-lockup-source.jpg");
const markSource = path.join(root, "lib", "nakuru", "flamingo-mark-source.png");
const lockupPng = path.join(imagesDir, "nakuruhub-logo.png");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error("Missing sharp. Install with: pnpm add -D sharp");
    process.exit(1);
  }

  if (!fs.existsSync(srcJpg)) {
    console.error("Source lockup not found:", srcJpg);
    process.exit(1);
  }

  fs.mkdirSync(iconsDir, { recursive: true });
  fs.mkdirSync(imagesDir, { recursive: true });
  fs.mkdirSync(path.join(root, "app"), { recursive: true });

  const trimmed = await sharp(srcJpg)
    .trim({ background: "#ffffff", threshold: 18 })
    .png()
    .toBuffer();
  await sharp(trimmed).png().toFile(lockupPng);
  console.log("Wrote", path.relative(root, lockupPng));

  const tmeta = await sharp(trimmed).metadata();
  const cropH = Math.round((tmeta.height ?? 617) * 0.78);
  const emblem = await sharp(trimmed)
    .extract({ left: 0, top: 0, width: tmeta.width ?? 899, height: cropH })
    .trim({ background: "#ffffff", threshold: 12 })
    .toBuffer();

  await sharp(emblem)
    .resize(512, 512, { fit: "contain", background: "#ffffff" })
    .png()
    .toFile(markSource);
  console.log("Wrote", path.relative(root, markSource));

  const pngBuf = fs.readFileSync(markSource);
  const white = "#ffffff";
  const maskableBg = "#14532d";

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
      const inner = Math.round(size * 0.72);
      const resized = await sharp(pngBuf)
        .resize(inner, inner, { fit: "contain", background: maskableBg })
        .png()
        .toBuffer();
      pipeline = sharp({
        create: {
          width: size,
          height: size,
          channels: 4,
          background: maskableBg,
        },
      })
        .composite([{ input: resized, gravity: "centre" }])
        .png();
    } else {
      pipeline = sharp(pngBuf)
        .resize(size, size, { fit: "contain", background: white })
        .png();
    }
    const out = path.join(iconsDir, name);
    await pipeline.toFile(out);
    console.log("Wrote", path.relative(root, out));
  }

  function pngToIco(pngBytes, size) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(1, 4);
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size, 0);
    entry.writeUInt8(size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(pngBytes.length, 8);
    entry.writeUInt32LE(22, 12);
    return Buffer.concat([header, entry, pngBytes]);
  }

  const faviconPng = await sharp(pngBuf)
    .resize(48, 48, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .ensureAlpha()
    .png()
    .toBuffer();
  const icoBuf = pngToIco(faviconPng, 48);
  const appFavicon = path.join(root, "app", "favicon.ico");
  const publicFavicon = path.join(root, "public", "favicon.ico");
  fs.writeFileSync(appFavicon, icoBuf);
  fs.writeFileSync(publicFavicon, icoBuf);
  console.log("Wrote", path.relative(root, appFavicon));
  console.log("Wrote", path.relative(root, publicFavicon));

  const appIcon = path.join(root, "app", "icon.png");
  await sharp(pngBuf)
    .resize(512, 512, { fit: "contain", background: white })
    .png()
    .toFile(appIcon);
  console.log("Wrote", path.relative(root, appIcon));

  const appleIcon = path.join(root, "app", "apple-icon.png");
  await sharp(pngBuf)
    .resize(180, 180, { fit: "contain", background: white })
    .png()
    .toFile(appleIcon);
  console.log("Wrote", path.relative(root, appleIcon));

  const og = path.join(root, "app", "opengraph-image.png");
  const lockupForOg = await sharp(trimmed)
    .resize(920, 480, { fit: "contain", background: white })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 3,
      background: white,
    },
  })
    .composite([{ input: lockupForOg, gravity: "centre" }])
    .png()
    .toFile(og);
  console.log("Wrote", path.relative(root, og));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
