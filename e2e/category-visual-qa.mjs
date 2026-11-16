import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];
const THEMES = ["light", "dark"];

async function qaCategory(page, width, theme) {
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    if (
      /Failed to load resource|favicon|401|404|hydration|didn't match/i.test(text)
    )
      return;
    consoleErrors.push(text);
  });

  await page.setViewportSize({ width, height: 800 });
  await page.emulateMedia({ colorScheme: theme });
  await page.goto(`${BASE}/app`, { waitUntil: "networkidle", timeout: 60000 });
  const catBtn = page.getByRole("button", { name: "Category", exact: true });
  await catBtn.waitFor({ state: "visible", timeout: 20000 });
  await catBtn.click();
  await page.waitForSelector(".cat-rail", { timeout: 30000 });

  const railBox = await page.locator(".cat-rail").boundingBox();
  const navBox = await page.locator("#nav.app-bottom-nav").boundingBox();

  const railBottomVsNav =
    railBox && navBox
      ? railBox.y + railBox.height <= navBox.y + 2 &&
        navBox.y - (railBox.y + railBox.height) < 16
      : false;

  const swOverflow = await page.evaluate(() => {
    const labels = [...document.querySelectorAll(".cat-rail-label")];
    return labels.some((el) => el.scrollWidth > el.clientWidth + 1);
  });

  const hScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );

  const railItems = page.locator(".cat-rail-item:not(:disabled)");
  await railItems.first().focus();
  await page.keyboard.press("ArrowDown");
  const ariaCurrent = await page.locator(".cat-rail-item[aria-current='true']").count();

  const staysDisabled = await page
    .locator(".cat-rail-item.is-soon")
    .first()
    .getAttribute("aria-disabled");

  return {
    width,
    theme,
    hScroll,
    railOk: Boolean(railBox && railBox.height > 200),
    railBottomVsNav,
    consoleErrors,
    ariaCurrent,
    staysDisabled,
    swOverflow,
    pass:
      !hScroll &&
      railBox &&
      railBottomVsNav &&
      ariaCurrent === 1 &&
      staysDisabled === "true" &&
      !swOverflow &&
      consoleErrors.length === 0,
  };
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const results = [];

for (const width of WIDTHS) {
  for (const theme of THEMES) {
    try {
      results.push(await qaCategory(page, width, theme));
    } catch (e) {
      results.push({
        width,
        theme,
        pass: false,
        error: String(e),
      });
    }
  }
}

await browser.close();

for (const r of results) {
  console.log(
    `${r.pass ? "PASS" : "FAIL"} ${r.width}px ${r.theme}`,
    r.error ?? JSON.stringify(r),
  );
}

process.exit(results.some((r) => !r.pass) ? 1 : 0);