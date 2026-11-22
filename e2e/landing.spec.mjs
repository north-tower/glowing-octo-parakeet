import { chromium } from "playwright";

const baseUrl = process.env.LANDING_URL ?? "http://localhost:3000/";
const widths = [1440, 1024, 768, 390, 360];
const results = { viewports: {}, hero: {} };

const browser = await chromium.launch();
const page = await browser.newPage();

for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const m = await page.evaluate(() => {
    const doc = document.documentElement;
    const h1 = document.querySelector(".hero h1");
    const search = document.querySelector(".hero-search");
    const featured = document.querySelector(".featured-card");
    return {
      scrollW: doc.scrollWidth,
      clientW: doc.clientWidth,
      overflow: doc.scrollWidth > doc.clientWidth + 1,
      h1: h1 ? h1.textContent?.replace(/\s+/g, " ").trim() : "",
      hasSearch: Boolean(search),
      hasFeatured: Boolean(featured),
    };
  });
  const pass = !m.overflow && m.hasSearch && m.hasFeatured && m.h1.includes("Find what you need");
  results.viewports[w] = { pass, ...m };
}

await page.setViewportSize({ width: 1024, height: 900 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
results.hero.hasPostCta = (await page.locator('a[href="/app?start=vendor"]').count()) > 0;
results.hero.hasExplore = (await page.locator('a[href="/app"]').count()) > 0;

await browser.close();

const allViewportPass = Object.values(results.viewports).every((v) => v.pass);
const heroOk = results.hero.hasPostCta && results.hero.hasExplore;

console.log(JSON.stringify(results, null, 2));

if (!allViewportPass || !heroOk) {
  process.exit(1);
}
