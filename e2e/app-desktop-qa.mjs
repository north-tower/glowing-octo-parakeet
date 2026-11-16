import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [768, 1024, 1280, 1440, 1920];

async function run() {
  const browser = await chromium.launch();
  const results = [];

  for (const theme of ["light", "dark"]) {
    for (const width of WIDTHS) {
      const page = await browser.newPage();
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(`${BASE}/app`, { waitUntil: "networkidle" });
      if (theme === "dark") {
        await page.evaluate(() =>
          document.documentElement.setAttribute("data-theme", "dark"),
        );
      }

      const layout = await page.evaluate(() => {
        const search = document.querySelector(".app-hd-search-wrap .search");
        const bar = document.querySelector(".app-hd-bar");
        const bg = getComputedStyle(document.body).backgroundColor;
        const scrollW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        const sideNav = document.querySelector("#nav.app-bottom-nav");
        return {
          noHorizontalScroll: scrollW <= clientW + 1,
          searchWidth: search?.getBoundingClientRect().width ?? 0,
          barHeight: bar?.getBoundingClientRect().height ?? 0,
          bg,
          bottomNavDisplayed: sideNav
            ? getComputedStyle(sideNav).display !== "none"
            : true,
        };
      });

      let zonePopover = null;
      if (width >= 768) {
        await page.locator(".app-hd-zone-wrap .zone-pill").click();
        zonePopover = await page.locator(".zone-popover").isVisible();
        await page.keyboard.press("Escape");
      }

      const navOn = await page
        .locator(".app-top-nav-btn.on")
        .getAttribute("aria-current");

      results.push({
        width,
        theme,
        noHorizontalScroll: layout.noHorizontalScroll,
        searchWithin640:
          width < 1024 ? true : layout.searchWidth <= 640 + 2,
        topBarNoWrap: layout.barHeight <= 148,
        pageBgConsistent: Boolean(layout.bg),
        bottomNavHidden: !layout.bottomNavDisplayed,
        homeNavActive: navOn === "page",
        zonePopoverOpens: width >= 768 ? zonePopover : null,
        consoleClean: consoleErrors.length === 0,
      });
      await page.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

run();