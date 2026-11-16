import { chromium } from "playwright";

const BASE = process.env.QA_BASE ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];

const report = [];

async function goCart(page) {
  await page.goto(`${BASE}/app`, { waitUntil: "networkidle", timeout: 60000 });
  await page.locator('#nav.app-bottom-nav button').filter({ hasText: /Cart|Kikapu/i }).first().click();
  await page.waitForSelector(".cart-view", { timeout: 15000 });
}

function trackConsole(page, bag) {
  page.on("pageerror", (e) => bag.push(`pageerror: ${e}`));
  page.on("console", (m) => {
    if (m.type() === "error") bag.push(`console: ${m.text()}`);
  });
}

async function segLayout(page) {
  const box = await page.locator(".cart-seg").boundingBox();
  const btns = page.locator(".cart-seg__item");
  const n = await btns.count();
  if (n !== 2 || !box) return { ok: false, reason: "seg structure" };
  const b0 = await btns.nth(0).boundingBox();
  const b1 = await btns.nth(1).boundingBox();
  if (!b0 || !b1) return { ok: false, reason: "btn boxes" };
  const sameRow = Math.abs(b0.y - b1.y) < 4;
  const inOneRow = b0.x < b1.x && b0.width + b1.width <= box.width + 4;
  const tall = box.height <= 48 && box.height >= 40;
  return { ok: sameRow && inOneRow && tall, reason: `row=${sameRow} width=${inOneRow} h=${box.height}` };
}

async function noSdLeak(page) {
  const sd = page.locator(".cart-seg.sd, .cart-view .sd");
  return (await sd.count()) === 0;
}

async function emptyWhiteBlock(page) {
  const panel = page.locator("#cart-seg-panel");
  const seg = page.locator(".cart-seg");
  const sb = await seg.boundingBox();
  const pb = await panel.boundingBox();
  if (!sb || !pb) return { ok: false, gap: -1 };
  const gap = pb.y - (sb.y + sb.height);
  const minH = await panel.evaluate((el) => getComputedStyle(el).minHeight);
  const leak = minH.includes("vh") && parseFloat(minH) > 50;
  const gapOk = gap >= 0 && gap < 40;
  return { ok: gapOk && !leak, gap, minH };
}

async function addFirstProduct(page) {
  await page.locator('#nav.app-bottom-nav button').filter({ hasText: /Shop|Home|Nyumbani/i }).first().click();
  await page.waitForTimeout(400);
  const card = page.locator(".pc").first();
  await card.waitFor({ timeout: 15000 });
  await card.locator(".btn").first().click();
  await page.waitForTimeout(300);
  await goCart(page);
}

async function runCase(name, page, fn) {
  const errors = [];
  trackConsole(page, errors);
  try {
    const detail = await fn(page);
    report.push({ name, pass: detail.pass !== false, detail, consoleErrors: errors });
  } catch (e) {
    report.push({ name, pass: false, error: String(e), consoleErrors: errors });
  }
}

const browser = await chromium.launch({ headless: true });
try {
  for (const w of WIDTHS) {
    for (const theme of ["light", "dark"]) {
      const label = `${w}/${theme}`;
      const page = await browser.newPage({
        viewport: { width: w, height: 800 },
        colorScheme: theme,
      });

      await runCase(`${label} empty cart seg`, page, async (p) => {
        await goCart(p);
        const layout = await segLayout(p);
        const noSd = await noSdLeak(p);
        const panel = await emptyWhiteBlock(p);
        const tablist = await p.locator('.cart-seg[role="tablist"]').count();
        return {
          pass: layout.ok && noSd && panel.ok && tablist === 1,
          layout,
          noSd,
          panel,
        };
      });

      await page.close();

      const page2 = await browser.newPage({
        viewport: { width: w, height: 800 },
        colorScheme: theme,
      });
      await runCase(`${label} with item + bar`, page2, async (p) => {
        await addFirstProduct(p);
        const layout = await segLayout(p);
        const bar = p.locator(".cart-checkout-bar");
        const barBox = await bar.boundingBox();
        const summary = p.locator(".cart-summary-row--total");
        await summary.scrollIntoViewIfNeeded();
        const sumBox = await summary.boundingBox();
        const barTop = barBox?.y ?? 9999;
        const sumBottom = (sumBox?.y ?? 0) + (sumBox?.height ?? 0);
        const visible = sumBottom <= barTop + 2;
        const barH = barBox?.height ?? 0;
        const cta = p.locator(".cart-checkout-cta");
        const isPink = await cta.evaluate((el) => {
          const bg = getComputedStyle(el).backgroundColor;
          return bg;
        });
        return {
          pass: layout.ok && visible && barH <= 72,
          layout,
          summaryAboveBar: visible,
          barH,
          ctaBg: isPink,
        };
      });
      await page2.close();

      const page3 = await browser.newPage({
        viewport: { width: w, height: 800 },
        colorScheme: theme,
      });
      await runCase(`${label} orders chip + keys`, page3, async (p) => {
        await goCart(p);
        await p.locator("#cart-seg-orders").click();
        await p.keyboard.press("ArrowLeft");
        const selected = await p.locator("#cart-seg-cart[aria-selected='true']").count();
        return { pass: selected === 1, selected };
      });
      await page3.close();
    }
  }
} finally {
  await browser.close();
}

const failed = report.filter((r) => !r.pass);
console.log(JSON.stringify({ total: report.length, failed: failed.length, report }, null, 2));
process.exit(failed.length ? 1 : 0);