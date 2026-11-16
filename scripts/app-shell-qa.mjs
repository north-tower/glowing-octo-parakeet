import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];
const results = [];

const browser = await chromium.launch({ headless: true });
try {
  for (const w of WIDTHS) {
    for (const theme of ["light", "dark"]) {
      const name = `${w}px ${theme}`;
      const page = await browser.newPage({
        viewport: { width: w, height: 800 },
        colorScheme: theme,
      });
      const pageErrors = [];
      const consoleErrors = [];
      page.on("pageerror", (e) => pageErrors.push(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error") consoleErrors.push(m.text());
      });

      try {
        await page.goto(`${BASE}/app`, {
          waitUntil: "domcontentloaded",
          timeout: 60_000,
        });
        await page.waitForSelector(".pc .btn", { timeout: 20_000 });

        const fab = await page.locator("#fab").count();
        const sb = await page.locator("#sb").count();
        const nav = page.locator("#nav.app-bottom-nav");
        await nav.waitFor({ state: "visible" });

        await page
          .locator(".pc .btn")
          .filter({ hasText: /Add to cart/ })
          .first()
          .click();
        await page.waitForSelector("#nav .nav-tab-badge", { timeout: 5000 });
        const badgeText = await page
          .locator("#nav .nav-tab-badge")
          .first()
          .innerText();

        await page
          .locator("#nav button")
          .filter({ hasText: /^Cart$/ })
          .first()
          .click();
        await page.waitForSelector("h2", { timeout: 10_000 });

        const navBox = await nav.boundingBox();
        const cards = page.locator(".g2 .pc");
        const n = await cards.count();
        let scrollClear = false;
        if (n > 0 && navBox) {
          const last = cards.nth(n - 1);
          await last.scrollIntoViewIfNeeded();
          await page.waitForTimeout(200);
          const cardBox = await last.boundingBox();
          scrollClear =
            Boolean(cardBox) && cardBox.y + cardBox.height <= navBox.y + 2;
        }

        const focusRing = await page.evaluate(() => {
          const active = document.activeElement;
          if (!active || active === document.body) return false;
          const st = getComputedStyle(active);
          return st.outlineWidth !== "0px" || active.matches(":focus-visible");
        });
        await page.keyboard.press("Tab");

        const pass =
          fab === 0 &&
          sb === 0 &&
          badgeText === "1" &&
          scrollClear &&
          pageErrors.length === 0 &&
          consoleErrors.length === 0;

        results.push({
          name,
          pass,
          fab,
          sb,
          badge: badgeText,
          scrollClear,
          pageErrors,
          consoleErrors,
          focusAfterTab: focusRing,
        });
      } catch (e) {
        results.push({ name, pass: false, error: String(e) });
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => !r.pass);
console.log(JSON.stringify({ failed: failed.length, total: results.length, results }, null, 2));
process.exit(failed.length ? 1 : 0);