import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];
const results = [];

function log(status, name, detail = "") {
  results.push({ status, name, detail });
  const mark = status === "pass" ? "PASS" : "FAIL";
  console.log(`${mark}: ${name}${detail ? ` — ${detail}` : ""}`);
}

async function navActive(page) {
  return page.evaluate(() => {
    const labels = ["Home", "Category", "Message", "Cart", "Account"];
    return labels.map((label) => {
      const btn = [...document.querySelectorAll("#nav button")].find((b) =>
        b.textContent?.includes(label),
      );
      return { label, on: btn?.classList.contains("on") ?? false };
    });
  });
}

const browser = await chromium.launch();
try {
  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 800 },
    });
    const page = await context.newPage();

    await page.goto(`${BASE}/app`);
    await page.locator('#nav button:has-text("Message")').click();
    await page.goto(`${BASE}/app/p/2`);
    await page.waitForURL(/\/app\/p\/2/);
    await page.waitForSelector(".pd-title, .pd-card", { timeout: 15000 });

    const nav1 = await navActive(page);
    if (
      nav1.find((x) => x.label === "Home")?.on &&
      !nav1.find((x) => x.label === "Message")?.on
    ) {
      log("pass", `${width}px unverified nav after msg-then-home browse`, "Home active");
    } else {
      log("fail", `${width}px unverified nav`, JSON.stringify(nav1));
    }

    const promo = await page.locator(".pd-promo-row").textContent();
    if (
      promo?.includes("Free delivery on your first order") &&
      promo?.includes("Pay on delivery · Nakuru")
    ) {
      log("pass", `${width}px promo copy`);
    } else {
      log("fail", `${width}px promo copy`, promo ?? "missing");
    }

  const trustDup = await page.getByText("Pay on delivery only").count();
    if (trustDup === 0) {
      log("pass", `${width}px no duplicate POD-only line`);
    } else {
      log("fail", `${width}px duplicate POD-only`, String(trustDup));
    }

    const back = page.locator(".pd-overlay .pd-icon-btn").first();
    const box = await back.boundingBox();
    if (box && box.x >= 4 && box.width >= 40) {
      log("pass", `${width}px back button box`);
    } else {
      log("fail", `${width}px back clipped`, JSON.stringify(box));
    }

    await page.goto(`${BASE}/app?tab=cat`);
    await page.evaluate(() => sessionStorage.setItem("nh-detail-nav-tab", "cat"));
    await page.goto(`${BASE}/app/p/16`);
    await page.waitForURL(/\/app\/p\/16/);
    const nav2 = await navActive(page);
    if (nav2.find((x) => x.label === "Category")?.on) {
      log("pass", `${width}px verified nav from category`);
    } else {
      log("fail", `${width}px verified nav`, JSON.stringify(nav2));
    }

    await page.goto(`${BASE}/app/p/16`);
    const nav3 = await navActive(page);
    if (nav3.find((x) => x.label === "Home")?.on) {
      log("pass", `${width}px direct link nav`);
    } else {
      log("fail", `${width}px direct link nav`, JSON.stringify(nav3));
    }

    await context.close();
  }

  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(`${BASE}/app`);
  await page.locator('#nav button:has-text("Cart")').click();
  const nav = await navActive(page);
  if (nav.find((x) => x.label === "Cart")?.on) {
    log("pass", "cart tab on /app");
  } else {
    log("fail", "cart tab", JSON.stringify(nav));
  }
  await ctx.close();
} finally {
  await browser.close();
}

const failed = results.filter((r) => r.status === "fail").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);