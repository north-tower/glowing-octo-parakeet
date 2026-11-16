import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];
const THEMES = ["light", "dark"];

async function qaViewport(page, width, theme) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (/Failed to load resource|favicon|401|404/.test(text)) return;
    errors.push(text);
  });

  await page.setViewportSize({ width, height: 800 });
  await page.emulateMedia({ colorScheme: theme });
  await page.goto(`${BASE}/app`, { waitUntil: "networkidle" });

  if (theme === "dark") {
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
  }

  const scrollW = await page.evaluate(
    () => document.documentElement.scrollWidth,
  );
  const clientW = await page.evaluate(
    () => document.documentElement.clientWidth,
  );
  const hScroll = scrollW > clientW + 1;

  const headerOk = await page.locator("#hd .logo").isVisible();
  const cats = await page.locator(".home-cat-grid .ct").count();
  const cards = await page.locator("body.app .pc").count();
  const headerOverlap = await page.evaluate(() => {
    const hd = document.querySelector("#hd");
    const main = document.querySelector("main");
    if (!hd || !main) return false;
    const hb = hd.getBoundingClientRect();
    const first = main.querySelector(".trust, .qa-scroll, .car");
    if (!first) return false;
    const fb = first.getBoundingClientRect();
    return fb.top < hb.bottom - 2;
  });

  await page.keyboard.press("Tab");
  const focusRing = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return false;
    const s = getComputedStyle(el);
    return s.outlineWidth !== "0px" || s.outlineStyle !== "none";
  });

  return {
    width,
    theme,
    hScroll,
    headerOk,
    cats,
    cards,
    consoleErrors: errors,
    headerOverlap,
    focusRing,
    pass:
      !hScroll &&
      headerOk &&
      !headerOverlap &&
      cats >= 9 &&
      cards >= 2 &&
      focusRing &&
      errors.length === 0,
  };
}

const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];

for (const width of WIDTHS) {
  for (const theme of THEMES) {
    results.push(await qaViewport(page, width, theme));
  }
}

await browser.close();

for (const r of results) {
  const status = r.pass ? "PASS" : "FAIL";
  console.log(
    `${status} ${r.width}px ${r.theme}: hScroll=${r.hScroll} overlap=${r.headerOverlap} cats=${r.cats} cards=${r.cards} focus=${r.focusRing} console=${r.consoleErrors.length}`,
  );
  if (r.consoleErrors.length) {
    r.consoleErrors.forEach((e) => console.log(`  console: ${e}`));
  }
}

const failed = results.filter((r) => !r.pass).length;
process.exit(failed ? 1 : 0);