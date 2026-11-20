import fs from "node:fs";
import path from "node:path";

const htmlPath = path.join(process.cwd(), "flamingo-banner.html");
const html = fs.readFileSync(htmlPath, "utf8");
const re = /url\(data:image\/jpeg;base64,([^)]+)\)/g;
const outDir = path.join(process.cwd(), "public", "images");
fs.mkdirSync(outDir, { recursive: true });

const names = ["flamingo-banner-fill.jpg", "flamingo-banner-photo.jpg"];
let i = 0;
for (const m of html.matchAll(re)) {
  const name = names[i] ?? `flamingo-banner-${i}.jpg`;
  const out = path.join(outDir, name);
  fs.writeFileSync(out, Buffer.from(m[1], "base64"));
  console.log(name, fs.statSync(out).size);
  i++;
}
console.log("found", i, "images");