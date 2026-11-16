/**
 * Playwright collision guard: FAB must not intersect primary sticky CTAs.
 * Run: node e2e/assistant-sticky-collision.spec.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];

/** @param {DOMRect} a @param {DOMRect} b */
function disjoint(a, b) {
  return (
    a.right <= b.left ||
    a.left >= b.right ||
    a.bottom <= b.top ||
    a.top >= b.bottom
  );
}

async function assertNoCollision(page, ctaSelector) {
  return page.evaluate((sel) => {
    const fab = document.getElementById("assistant-fab");
    const cta = document.querySelector(sel);
    if (!fab || !cta) return { ok: false, reason: "missing nodes" };
    const a = fab.getBoundingClientRect();
    const b = cta.getBoundingClientRect();
  const disjoint =
      a.right <= b.left ||
      a.left >= b.right ||
      a.bottom <= b.top ||
      a.top >= b.bottom;
    return {
      ok: disjoint,
      fab: { top: a.top, bottom: a.bottom },
      cta: { top: b.top, bottom: b.bottom },
    };
  }, ctaSelector);
}

async function runWidth(page, width) {
  await page.setViewportSize({ width, height: 820 });
  await page.goto(`${BASE}/app`, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() =>
    localStorage.removeItem("nakuru-assistant-fab-intro"),
  );

  const productLink = page
    .locator("body.app .pc a, body.app .pc-hit")
    .first();
  await productLink.click();
  await page.waitForURL(/\/app\/p\//, { timeout: 30000 });
  await page.waitForSelector(".pd-bar", { timeout: 20000 });

  const stickyPd = await page.evaluate(() =>
    parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--sticky-bar-h")
        .trim(),
    ),
  );

  const pdHit = await assertNoCollision(page, ".pd-bar-cta");

  await page.evaluate(() => {
    document
      .querySelector(".assistant-entry-chip")
      ?.scrollIntoView({ block: "nearest", behavior: "instant" });
  });
  await page.waitForTimeout(200);
  const entryBottom = await page.evaluate(() => {
    const chip = document.querySelector(".assistant-entry-chip");
    const bar = document.querySelector(".pd-bar");
    if (!chip || !bar) return { ok: false };
    const c = chip.getBoundingClientRect();
    const b = bar.getBoundingClientRect();
    const inView = c.top >= 0 && c.height > 0;
    const clearOfBar = c.bottom <= b.top - 4;
    return {
      ok: inView && clearOfBar,
      chipBottom: c.bottom,
      barTop: b.top,
      chipTop: c.top,
    };
  });

  await page.goto(`${BASE}/app`, { waitUntil: "networkidle" });
  const card = page.locator(".pc").first();
  await card.waitFor({ timeout: 20000 });
  await card.locator(".btn").first().click();
  await page
    .locator("#nav.app-bottom-nav button")
    .filter({ hasText: /Cart|Kikapu/i })
    .first()
    .click();
  await page.waitForSelector(".cart-checkout-bar", { timeout: 20000 });

  const stickyCart = await page.evaluate(() =>
    parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue("--sticky-bar-h")
        .trim(),
    ),
  );

  const cartHit = await assertNoCollision(page, ".cart-checkout-cta");

  return {
    width,
    stickyPd,
    pdHit,
    entryBottom,
    stickyCart,
    cartHit,
    pass:
      stickyPd > 40 &&
      stickyCart > 40 &&
      pdHit.ok &&
      cartHit.ok &&
      entryBottom.ok,
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];
for (const w of WIDTHS) {
  results.push(await runWidth(page, w));
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
const allPass = results.every((r) => r.pass);
process.exit(allPass ? 0 : 1);