/**
 * Baseline / compare mobile screenshots for app routes (360 + 390).
 * Usage:
 *   node e2e/app-mobile-pixel-regression.mjs capture [dir]
 *   node e2e/app-mobile-pixel-regression.mjs compare baseline after
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { PNG } from "pngjs";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390];
const TOLERANCE = 0.02; // max fraction of pixels differing

const VIEWS = [
  {
    name: "home",
    path: "/app",
    ready: (page) => page.locator("#hd .logo").waitFor(),
  },
  {
    name: "category",
    path: "/app",
    ready: async (page) => {
      await page.goto(`${BASE}/app`, { waitUntil: "networkidle" });
      await page.locator('#nav button:has-text("Category"), #nav button:has-text("Aina")').first().click();
      await page.locator(".cat-rail, .cat-panel").first().waitFor({ timeout: 8000 });
    },
  },
  {
    name: "product",
    path: "/app",
    ready: async (page) => {
      await page.goto(`${BASE}/app`, { waitUntil: "networkidle" });
      await page.locator("body.app .pc-hit, body.app .pc .btn").first().click({ timeout: 8000 });
      await page.locator(".pd-title, .pd-gallery").first().waitFor({ timeout: 8000 });
    },
  },
  {
    name: "cart",
    path: "/app?tab=cart",
    ready: (page) => page.getByRole("heading", { name: /cart|kikapu/i }).waitFor(),
  },
  {
    name: "account",
    path: "/app?tab=acc",
    ready: (page) => page.locator(".acc-identity, .sign-in-card").first().waitFor(),
  },
];

function diffRatio(a, b) {
  if (a.width !== b.width || a.height !== b.height) return 1;
  let diff = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const dr = Math.abs(a.data[i] - b.data[i]);
    const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
    const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
    if (dr > 8 || dg > 8 || db > 8) diff += 1;
  }
  return diff / (a.width * a.height);
}

async function captureAll(outDir) {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await context.newPage();

  for (const view of VIEWS) {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`${BASE}${view.path}`, { waitUntil: "networkidle" });
      await view.ready(page);
      await page.waitForTimeout(300);
      const file = path.join(outDir, `${view.name}-${width}.png`);
      await page.screenshot({ path: file, fullPage: false });
      console.log("captured", file);
    }
  }

  await browser.close();
}

async function compareDirs(baselineDir, afterDir) {
  const results = [];
  for (const view of VIEWS) {
    for (const width of WIDTHS) {
      const a = path.join(baselineDir, `${view.name}-${width}.png`);
      const b = path.join(afterDir, `${view.name}-${width}.png`);
      if (!fs.existsSync(a) || !fs.existsSync(b)) {
        results.push({ view: view.name, width, ok: false, reason: "missing file" });
        continue;
      }
      const imgA = PNG.sync.read(fs.readFileSync(a));
      const imgB = PNG.sync.read(fs.readFileSync(b));
      const ratio = diffRatio(imgA, imgB);
      results.push({
        view: view.name,
        width,
        ok: ratio <= TOLERANCE,
        diffRatio: ratio.toFixed(4),
      });
    }
  }
  return results;
}

const [cmd, arg1, arg2] = process.argv.slice(2);
if (cmd === "capture") {
  const dir = arg1 ?? "test-results/mobile-baseline";
  await captureAll(path.resolve(dir));
} else if (cmd === "compare") {
  const results = await compareDirs(
    path.resolve(arg1 ?? "test-results/mobile-baseline"),
    path.resolve(arg2 ?? "test-results/mobile-after"),
  );
  console.log(JSON.stringify(results, null, 2));
  if (results.some((r) => !r.ok)) process.exitCode = 1;
} else {
  console.error("Usage: capture [dir] | compare baseline after");
  process.exitCode = 1;
}