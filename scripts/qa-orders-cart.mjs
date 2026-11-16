import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];
const out = [];

async function goCart(page) {
  await page.goto(`${BASE}/app?tab=cart`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForSelector(".cart-view", { timeout: 20000 });
}

async function runCase(page, label, fn) {
  const consoleErr = [];
  const pageErr = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErr.push(m.text());
  });
  page.on("pageerror", (e) => pageErr.push(String(e)));
  try {
    await fn(page);
    const bad = [...consoleErr, ...pageErr].filter(
      (t) => !t.includes("favicon"),
    );
    out.push({
      label,
      pass: bad.length === 0,
      console: bad.slice(0, 3),
    });
  } catch (e) {
    out.push({ label, pass: false, error: String(e) });
  }
}

const browser = await chromium.launch({ headless: true });
try {
  for (const w of WIDTHS) {
    for (const theme of ["light", "dark"]) {
      const page = await browser.newPage({
        viewport: { width: w, height: 860 },
        colorScheme: theme,
      });
      const tag = `${w}px ${theme}`;

      await runCase(page, `${tag} — empty orders`, async (p) => {
        await goCart(p);
        await p.click("#cart-seg-orders");
        await p.waitForSelector(".cart-empty-title", { timeout: 5000 });
      });

      await runCase(page, `${tag} — place + track demo`, async (p) => {
        await goCart(p);
        await p.getByRole("tab", { name: /Cart/i }).click();
        await p.locator(".pc-add").first().click();
        await p.click("#cart-seg-orders");
        await p.waitForTimeout(300);
        await p.getByRole("tab", { name: /Cart/i }).click();
        const place = p.locator(".cart-checkout-cta");
        if (await place.isEnabled()) {
          await place.click();
          await p.waitForSelector(".order-placed", { timeout: 8000 });
          await p.locator(".order-placed__primary").click();
          await p.waitForSelector(".order-track", { timeout: 5000 });
          const nav = p.locator("nav.app-bottom-nav");
          const navBox = await nav.boundingBox();
          const trackBox = await p.locator(".order-track").boundingBox();
          if (navBox && trackBox) {
            if (trackBox.y + trackBox.height > navBox.y + 2) {
              throw new Error("Track view may sit under bottom nav");
            }
          }
        }
      });

      await page.close();
    }
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(out, null, 2));
const failed = out.filter((r) => !r.pass);
process.exit(failed.length ? 1 : 0);