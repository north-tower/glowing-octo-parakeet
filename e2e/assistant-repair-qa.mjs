import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];

async function qa(page, width, theme, lang) {
  await page.setViewportSize({ width, height: 820 });
  await page.emulateMedia({ colorScheme: theme });
  await page.goto(`${BASE}/app`, { waitUntil: "networkidle", timeout: 60000 });
  if (theme === "dark") {
    await page.evaluate(() =>
      document.documentElement.setAttribute("data-theme", "dark"),
    );
  }
  if (lang === "sw") {
    await page.evaluate(() => {
      try {
        localStorage.setItem("nakuru-lang", "sw");
      } catch {
        /* ignore */
      }
    });
    await page.reload({ waitUntil: "networkidle" });
  }

  await page.evaluate(() =>
    localStorage.removeItem("nakuru-assistant-fab-intro"),
  );

  const product = page.locator(".pc").first();
  await product.locator("a, .pc-hit").first().click();
  await page.waitForSelector(".pd-bar");

  const pd = await page.evaluate(() => {
    const fab = document.getElementById("assistant-fab");
    const cta = document.querySelector(".pd-bar-cta");
    if (!fab || !cta) return { fabClear: false };
    const a = fab.getBoundingClientRect();
    const b = cta.getBoundingClientRect();
    return {
      fabClear: a.bottom <= b.top,
      stickyH: getComputedStyle(document.documentElement).getPropertyValue(
        "--sticky-bar-h",
      ),
    };
  });

  await page.evaluate(() => {
    document
      .querySelector(".assistant-entry-chip")
      ?.scrollIntoView({ block: "nearest", behavior: "instant" });
  });
  await page.waitForTimeout(150);
  const entryOk = await page.evaluate(() => {
    const chip = document.querySelector(".assistant-entry-chip");
    const bar = document.querySelector(".pd-bar");
    if (!chip || !bar) return false;
    const c = chip.getBoundingClientRect();
    const b = bar.getBoundingClientRect();
    return c.top >= 0 && c.bottom <= b.top - 4;
  });

  await page.goto(`${BASE}/app`, { waitUntil: "networkidle" });
  await page.locator(".pc .btn").first().click();
  await page
    .locator("#nav.app-bottom-nav button")
    .filter({ hasText: /Cart|Kikapu/i })
    .first()
    .click();
  await page.waitForSelector(".cart-checkout-bar");

  const cart = await page.evaluate(() => {
    const fab = document.getElementById("assistant-fab");
    const cta = document.querySelector(".cart-checkout-cta");
    if (!fab || !cta) return { fabClear: false };
    return {
      fabClear: fab.getBoundingClientRect().bottom <= cta.getBoundingClientRect().top,
    };
  });

  await page.locator("#assistant-fab").click({ force: true });
  await page.waitForSelector(".assistant-sheet-root");
  const sheet = await page.evaluate(() => {
    const sheet = document.querySelector(".assistant-sheet");
    const title = document.querySelector(".assistant-sheet-title");
    const input = document.querySelector(".assistant-composer-input");
    if (!sheet || !title || !input) return { ok: false };
    const sheetStyle = getComputedStyle(sheet);
    const caret = getComputedStyle(input).caretColor;
    return {
      ok:
        parseFloat(sheetStyle.borderTopLeftRadius) >= 18 &&
        parseFloat(getComputedStyle(title).fontWeight) >= 600 &&
        sheetStyle.borderWidth === "0px",
      caret,
      radius: sheetStyle.borderTopLeftRadius,
    };
  });
  await page.locator(".assistant-close-btn").click();

  return {
    width,
    theme,
    lang,
    pd,
    entryOk,
    cart,
    sheet,
    pass:
      pd.fabClear && entryOk && cart.fabClear && sheet.ok && parseFloat(pd.stickyH) > 40,
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];
for (const width of WIDTHS) {
  for (const theme of ["light", "dark"]) {
    for (const lang of ["en", "sw"]) {
      results.push(await qa(page, width, theme, lang));
    }
  }
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
const n = results.filter((r) => r.pass).length;
console.log(`PASS ${n}/${results.length}`);
process.exit(n === results.length ? 0 : 1);