import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];
const THEMES = ["light", "dark"];

async function fabShown(page) {
  return page.locator("#assistant-fab").evaluate((el) => {
    const s = getComputedStyle(el);
    return s.visibility !== "hidden" && s.opacity !== "0";
  });
}

async function runCase(page, width, theme) {
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (/Failed to load resource|favicon|404|401/.test(text)) return;
    errors.push(text);
  });

  await page.setViewportSize({ width, height: 820 });
  await page.emulateMedia({ colorScheme: theme });
  await page.goto(`${BASE}/app`, { waitUntil: "networkidle" });
  if (theme === "dark") {
    await page.evaluate(() =>
      document.documentElement.setAttribute("data-theme", "dark"),
    );
  }

  await page.evaluate(() => localStorage.removeItem("nakuru-assistant-fab-intro"));
  await page.reload({ waitUntil: "networkidle" });

  const noHeaderSparkle = (await page.locator("#hd .hd-assistant-btn").count()) === 0;
  const fabOk = await fabShown(page);
  const navH = await page.evaluate(() =>
    getComputedStyle(document.body).getPropertyValue("--nav-h").trim(),
  );

  await page.locator("#assistant-fab").click();
  await page.waitForSelector(".assistant-sheet-root");
  const fabHiddenWithSheet = !(await fabShown(page));

  const hasEllipsis = (await page.locator(".assistant-menu-btn svg").count()) >= 1;
  const hasClose = (await page.locator(".assistant-close-btn").count()) === 1;

  await page.fill(".assistant-composer-input", "hello test");
  await page.locator(".assistant-send-btn[type='submit']").click();
  await page.waitForTimeout(400);
  const composerEmpty =
    (await page.locator(".assistant-composer-input").inputValue()) === "";

  await page.locator(".assistant-close-btn").click();
  await page.waitForTimeout(400);
  const fabBack = await fabShown(page);

  await page.getByRole("button", { name: /^(Home|Nyumbani)$/i }).click();
  const msgInactiveColor = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("#nav button")].find((b) =>
      /^(Message|Ujumbe)$/i.test(b.querySelector(".nav-tab-label")?.textContent?.trim() ?? ""),
    );
    const label = btn?.querySelector(".nav-tab-label");
    return label ? getComputedStyle(label).color : null;
  });

  await page.getByRole("button", { name: /Message|Ujumbe/i }).click();
  let fabHiddenInThread = false;
  const threadCard = page.locator(".card.li").first();
  if ((await threadCard.count()) > 0) {
    await threadCard.click();
    await page.waitForSelector(".msg-thread");
    await page.waitForTimeout(350);
    fabHiddenInThread = !(await fabShown(page));
  }

  await page.getByRole("button", { name: /^(Home|Nyumbani)$/i }).click();
  let fabScrollHides = false;
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(100);
  fabScrollHides = !(await fabShown(page));
  await page.waitForTimeout(450);
  const fabAfterStop = await fabShown(page);

  await page.goto(`${BASE}/app`, { waitUntil: "networkidle" });
  await page.locator("body.app .pc a, body.app .pc[role='button']").first().click();
  await page.waitForURL(/\/app\/p\//);
  await page.waitForSelector(".pd-bar", { timeout: 15000 });
  const fabRect = await page.locator("#assistant-fab").boundingBox();
  const barRect = await page.locator(".pd-bar").boundingBox();
  const fabAbovePdBar =
    fabRect && barRect ? fabRect.y + fabRect.height <= barRect.y + 2 : false;

  return {
    width,
    theme,
    noHeaderSparkle,
    fabOk,
    navH,
    fabHiddenWithSheet,
    hasEllipsis,
    hasClose,
    composerEmpty,
    fabBack,
    msgInactiveColor,
    fabHiddenInThread,
    fabScrollHides,
    fabAfterStop,
    fabAbovePdBar,
    consoleErrors: errors,
    pass:
      noHeaderSparkle &&
      fabOk &&
      navH.length > 0 &&
      fabHiddenWithSheet &&
      hasClose &&
      composerEmpty &&
      fabHiddenInThread &&
      fabScrollHides &&
      fabAfterStop &&
      fabAbovePdBar &&
      errors.length === 0,
  };
}

const browser = await chromium.launch();
const page = await browser.newPage();
const results = [];

for (const width of WIDTHS) {
  for (const theme of THEMES) {
    results.push(await runCase(page, width, theme));
  }
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
const allPass = results.every((r) => r.pass);
process.exit(allPass ? 0 : 1);