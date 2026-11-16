/**
 * Manual QA harness: light/dark × widths × EN/SW for assistant UI repair.
 * Run: node e2e/assistant-ui-qa.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];

async function setTheme(page, theme) {
  await page.emulateMedia({ colorScheme: theme });
  if (theme === "dark") {
    await page.evaluate(() =>
      document.documentElement.setAttribute("data-theme", "dark"),
    );
  } else {
    await page.evaluate(() =>
      document.documentElement.removeAttribute("data-theme"),
    );
  }
}

async function setLang(page, lang) {
  await page.goto(`${BASE}/app?tab=acc`, { waitUntil: "networkidle" });
  const btn = page.getByRole("button", {
    name: lang === "sw" ? /Kiswahili/i : /English/i,
  });
  if (await btn.count()) await btn.click();
  await page.waitForTimeout(300);
}

async function checkSheet(page, lang) {
  await page.evaluate(() => localStorage.removeItem("nakuru-assistant-fab-intro"));
  await page.locator("#assistant-fab").click({ force: true });
  await page.waitForSelector(".assistant-sheet-root");
  const head = await page.evaluate(() => {
    const sheet = document.querySelector(".assistant-sheet");
    const title = document.querySelector(".assistant-sheet-title");
    const demo = document.querySelector(".assistant-demo-chip");
    const mark = document.querySelector(".assistant-sheet-mark");
    if (!sheet || !title || !demo || !mark) return { ok: false };
    const sheetStyle = getComputedStyle(sheet);
    const titleStyle = getComputedStyle(title);
    const radius = parseFloat(sheetStyle.borderTopLeftRadius);
    const titleWeight = parseFloat(titleStyle.fontWeight);
    const hasBorder = sheetStyle.borderWidth !== "0px";
    const composer = document.querySelector(".assistant-composer-input");
    const caret =
      composer && getComputedStyle(composer).caretColor;
    return {
      ok:
        radius >= 18 &&
        titleWeight >= 600 &&
        demo.textContent &&
        !hasBorder &&
        caret,
      radius,
      titleWeight,
      demo: demo.textContent?.trim(),
    };
  });
  await page.locator(".assistant-close-btn").click();
  await page.waitForTimeout(300);
  return { ...head, lang };
}

async function runCase(page, width, theme, lang) {
  await page.setViewportSize({ width, height: 820 });
  await setLang(page, lang);
  await setTheme(page, theme);
  await page.goto(`${BASE}/app`, { waitUntil: "networkidle" });

  const sheet = await checkSheet(page, lang);

  const product = page.locator(".pc").first();
  await product.locator("a, .pc-hit").first().click();
  await page.waitForSelector(".pd-bar");
  const pdFab = await page.evaluate(() => {
    const fab = document.getElementById("assistant-fab");
    const cta = document.querySelector(".pd-bar-cta");
    if (!fab || !cta) return false;
    const a = fab.getBoundingClientRect();
    const b = cta.getBoundingClientRect();
    return a.bottom <= b.top + 2;
  });

  await page.goto(`${BASE}/app?tab=cart`, { waitUntil: "networkidle" });
  let cartFab = false;
  if ((await page.locator(".cart-checkout-bar").count()) > 0) {
    cartFab = await page.evaluate(() => {
      const fab = document.getElementById("assistant-fab");
      const cta = document.querySelector(".cart-checkout-cta");
      if (!fab || !cta) return false;
      return fab.getBoundingClientRect().bottom <= cta.getBoundingClientRect().top + 2;
    });
  } else {
    await page.locator(".pc .btn").first().click();
    await page.waitForTimeout(400);
    cartFab = await page.evaluate(() => {
      const fab = document.getElementById("assistant-fab");
      const cta = document.querySelector(".cart-checkout-cta");
      if (!fab || !cta) return false;
      return fab.getBoundingClientRect().bottom <= cta.getBoundingClientRect().top + 2;
    });
  }

  return {
    width,
    theme,
    lang,
    sheet,
    pdFabAboveBar: pdFab,
    cartFabAboveBar: cartFab,
    pass: sheet.ok && pdFab && cartFab,
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];
for (const width of WIDTHS) {
  for (const theme of ["light", "dark"]) {
    for (const lang of ["en", "sw"]) {
      results.push(await runCase(page, width, theme, lang));
    }
  }
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
console.log(
  "SUMMARY pass:",
  results.filter((r) => r.pass).length,
  "/",
  results.length,
);
process.exit(results.every((r) => r.pass) ? 0 : 1);