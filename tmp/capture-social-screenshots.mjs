import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = process.env.SHOT_BASE ?? "http://localhost:3333";
const OUT = "tmp/social-screenshots";

const pages = [
  { slug: "home", path: "/" },
  { slug: "pos", path: "/pos" },
  { slug: "directory", path: "/nakuru" },
  { slug: "app", path: "/app" },
  { slug: "sign-in", path: "/auth/sign-in" },
];

const viewports = [
  { name: "phone-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1440", width: 1440, height: 900 },
  { name: "desktop-1920", width: 1920, height: 1080 },
  { name: "story-1080x1920", width: 1080, height: 1920 },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  deviceScaleFactor: 2,
  locale: "en-KE",
});
const page = await context.newPage();

for (const viewport of viewports) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  for (const route of pages) {
    await page.goto(`${BASE}${route.path}`, { waitUntil: "networkidle", timeout: 60000 });
    await page.waitForTimeout(600);
    const prefix = `${OUT}/${route.slug}--${viewport.name}`;
    await page.screenshot({ path: `${prefix}--fold.png`, fullPage: false });
    await page.screenshot({ path: `${prefix}--full.png`, fullPage: true });
    console.log(`ok ${prefix}`);
  }
}

await browser.close();
console.log(`wrote screenshots to ${OUT}`);
