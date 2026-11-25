import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [1024, 1280, 1440];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  await page.goto(`${BASE}/app`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("#hd .search");

  const layout = await page.evaluate(() => {
    const input = document.querySelector("#hd .search input");
    const search = document.querySelector("#hd .search");
    const nav =
      document.querySelector(".public-app-nav") ||
      document.querySelector(".app-top-nav");
    const ib = input?.getBoundingClientRect();
    const sb = search?.getBoundingClientRect();
    const nb = nav?.getBoundingClientRect();
    const overlap =
      sb && nb
        ? !(sb.right <= nb.left + 1 || nb.right <= sb.left + 1 ||
            sb.bottom <= nb.top + 1 || nb.bottom <= sb.top + 1)
        : false;
    const hd = document.querySelector("#hd");
    return {
      inputW: Math.round(ib?.width || 0),
      searchW: Math.round(sb?.width || 0),
      overlap,
      headerOverflow: hd ? hd.scrollWidth > hd.clientWidth + 1 : true,
    };
  });

  const pass =
    layout.inputW >= 160 &&
    layout.searchW >= 240 &&
    !layout.overlap &&
    !layout.headerOverflow;

  results.push({ width, ...layout, pass });
  await page.close();
}

await browser.close();

for (const r of results) {
  console.log(
    `${r.pass ? "PASS" : "FAIL"} ${r.width}px input=${r.inputW} search=${r.searchW} overlap=${r.overlap} headerOverflow=${r.headerOverflow}`,
  );
}

process.exit(results.some((r) => !r.pass) ? 1 : 0);
