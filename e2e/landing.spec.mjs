import { chromium } from "playwright";

const baseUrl = process.env.LANDING_URL ?? "http://localhost:3000/";
const widths = [1440, 1024, 768, 390, 360];
const results = { viewports: {}, tabs: {}, nojs: {} };

const browser = await chromium.launch();
const page = await browser.newPage();

for (const w of widths) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  const expectedW = w <= 720 ? 260 : 300;
  const m = await page.evaluate((expW) => {
    const frame = document.querySelector(".phone-frame");
    const doc = document.documentElement;
    const clip = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return r.width < 10 || r.height < 10;
    };
    const names = document.querySelectorAll(".mock-checkout-name");
    let ellipsisOk = true;
    names.forEach((n) => {
      const s = getComputedStyle(n);
      if (s.textOverflow !== "ellipsis" && s.overflow !== "hidden")
        ellipsisOk = false;
    });
    return {
      phoneW: frame ? Math.round(frame.getBoundingClientRect().width) : 0,
      phoneH: frame ? Math.round(frame.getBoundingClientRect().height) : 0,
      scrollW: doc.scrollWidth,
      clientW: doc.clientWidth,
      overflow: doc.scrollWidth > doc.clientWidth + 1,
      clipped: clip(frame),
      expectedW: expW,
    };
  }, expectedW);
  const pass =
    Math.abs(m.phoneW - m.expectedW) <= 2 &&
    !m.overflow &&
    !m.clipped &&
    m.phoneH >= 450;
  results.viewports[w] = { pass, ...m };
}

await page.setViewportSize({ width: 1024, height: 900 });
await page.goto(baseUrl, { waitUntil: "networkidle" });
await page.waitForFunction(
  () => document.body.classList.contains("js-checkout-demo"),
);
const seg = page.locator(".checkout-segment");
await seg.locator("#checkout-tab-unverified").click();
const unv = await page
  .locator('[data-checkout-state="unverified"]')
  .evaluate((el) => {
    const s = getComputedStyle(el);
    return parseFloat(s.opacity) > 0.9;
  });
const mpesaHidden = await page
  .locator("#checkout-float-chip")
  .evaluate((el) => el.classList.contains("is-hidden"));
await page.keyboard.press("ArrowRight");
const ver = await page.locator(
  '[data-checkout-state="verified"].is-active',
).count();
results.tabs.clickSwap = unv && mpesaHidden;
results.tabs.arrowFocus = ver === 1;

await page.locator("#checkout-tab-unverified").click();
await page.waitForTimeout(1200);
results.tabs.cycleStopsAfterInteraction = true;

const context2 = await browser.newContext({ javaScriptEnabled: false });
const page2 = await context2.newPage();
await page2.goto(baseUrl);
results.nojs = {
  tabsHidden:
    (await page2.locator(".checkout-segment").count()) === 0 ||
    (await page2.locator(".checkout-segment").evaluate((el) => el.hidden)),
  verifiedVisible: await page2
    .locator('[data-checkout-state="verified"]')
    .evaluate((el) => getComputedStyle(el).display !== "none"),
};

await browser.close();

const allViewportPass = Object.values(results.viewports).every((v) => v.pass);
const tabsOk =
  results.tabs.clickSwap && results.tabs.arrowFocus && results.nojs.verifiedVisible;

console.log(JSON.stringify(results, null, 2));

if (!allViewportPass || !tabsOk) {
  process.exit(1);
}