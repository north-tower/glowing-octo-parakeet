// @ts-check
import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${BASE}/app`, { waitUntil: "domcontentloaded" });
  await page.locator("#assistant-fab").click();
  await page.waitForSelector(".assistant-sheet-root");

  await page.fill(".assistant-composer-input", "What is Verified?");
  await page.locator(".assistant-send-btn[type='submit']").click();
  await page.waitForFunction(() =>
    document.body.innerText.match(/Verified means|Verified inamaanisha/i),
  );

  const hasReplies = await page
    .getByRole("button", { name: /Payment options|Chaguo za malipo/i })
    .isVisible();
  if (!hasReplies) {
    throw new Error("Expected quick replies after Verified answer");
  }

  await page.getByRole("button", { name: /How to sell|Jinsi ya kuuza/i }).first().click();
  await page.waitForFunction(() =>
    document.body.innerText.match(/free to join|bure kujiunga/i),
  );

  await page.getByRole("button", { name: /Assistant menu|Menyu ya msaidizi/i }).click();
  await page.getByRole("menuitem", { name: /Clear chat|Futa mazungumzo/i }).click();
  await page.waitForSelector(".assistant-empty-greet");

  await browser.close();
  console.log("assistant-smoke: ok");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});