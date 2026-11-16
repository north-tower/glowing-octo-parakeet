import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];
const THEMES = ["light", "dark"];

async function qaViewport(page, width, theme) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
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

  return {
    width,
    theme,
    hScroll,
    headerOk,
    cats,
    cards,
    consoleErrors: errors,
    pass:
      !hScroll &&
      headerOk &&
      cats >= 9 &&
      cards >= 4 &&
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
    `${status} ${r.width}px ${r.theme}: hScroll=${r.hScroll} cats=${r.cats} cards=${r.cards} console=${r.consoleErrors.length}`,
  );
  if (r.consoleErrors.length) {
    r.consoleErrors.forEach((e) => console.log(`  console: ${e}`));
  }
}

const failed = results.filter((r) => !r.pass).length;
process.exit(failed ? 1 : 0);