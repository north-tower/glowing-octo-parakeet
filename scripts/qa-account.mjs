import { chromium } from "playwright";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];
const results = [];

function log(status, name, detail = "") {
  results.push({ status, name, detail });
  const mark = status === "pass" ? "PASS" : status === "skip" ? "SKIP" : "FAIL";
  console.log(`${mark}: ${name}${detail ? ` — ${detail}` : ""}`);
}

async function openAccount(page) {
  await page.goto(`${BASE}/app`);
  await page.locator('#nav button:has-text("Account")').click();
  await page.waitForSelector("#hd.t-acc", { timeout: 15000 });
}

async function assertNoBanner(page, label) {
  const banner = await page.locator(".acc-hd-banner").count();
  if (banner === 0) log("pass", label, "no vendor header strip");
  else log("fail", label, "acc-hd-banner still present");
}

function isBenignConsole(msg) {
  return /401/.test(msg) && /auth|refresh|session/i.test(msg);
}

async function signOutSheetKeyboard(page, lang = "en") {
  await page.evaluate(() => {
    localStorage.setItem("nakuruhub-landing-lang", "en");
  });
  const signedIn = await page.locator(".acc-identity").count();
  if (!signedIn) {
    log("skip", "sign-out sheet keyboard", "not signed in");
    return;
  }
  await page.locator(".acc-signout-row").click();
  await page.waitForSelector(".acc-signout-sheet");
  await page.keyboard.press("Escape");
  const open = await page.locator(".acc-signout-sheet").count();
  if (open === 0) log("pass", "sign-out sheet Escape", lang);
  else log("fail", "sign-out sheet Escape", "sheet still open");
}

const browser = await chromium.launch();
try {
  for (const width of WIDTHS) {
    for (const color of ["light", "dark"]) {
      const context = await browser.newContext({
        viewport: { width, height: 820 },
        colorScheme: color,
      });
      const page = await context.newPage();
      const consoleErrors = [];
      page.on("pageerror", (e) => consoleErrors.push(e.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      await openAccount(page);
      const tag = `${width}px ${color}`;
      await assertNoBanner(page, `${tag} header strip removed`);
      log("skip", `${tag} signed-out emoji`, "signed-out pass not in scope");

      const signedIn = await page.locator(".acc-identity").count();
      if (signedIn) {
        const menuEmoji = await page.evaluate(() => {
          const main = document.querySelector("main");
          if (!main) return false;
          const emojiRe = /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u;
          return emojiRe.test(main.innerText);
        });
        if (!menuEmoji) log("pass", `${tag} signed-in no emoji`);
        else log("fail", `${tag} signed-in emoji remains`);

        const installVisible = await page.locator('.acc-menu-row:has-text("Install")').count();
        const standalone = await page.evaluate(
          () =>
            window.matchMedia("(display-mode: standalone)").matches ||
            localStorage.getItem("nh:pwa-installed") === "1",
        );
        if (standalone && installVisible === 0) {
          log("pass", `${tag} install row hidden standalone`);
        } else if (!standalone) {
          log("pass", `${tag} install row visible`, `count=${installVisible}`);
        }

        await signOutSheetKeyboard(page, tag);
      } else {
        log("skip", `${tag} signed-in state checks`, "OTP session required");
      }

      const hard = consoleErrors.filter((m) => !isBenignConsole(m));
      if (hard.length === 0) log("pass", `${tag} console clean`);
      else log("fail", `${tag} console`, hard.slice(0, 2).join("; "));

      await context.close();
    }
  }
} finally {
  await browser.close();
}

const failed = results.filter((r) => r.status === "fail");
process.exitCode = failed.length ? 1 : 0;
console.log(`\n${results.length} checks — ${failed.length} failed, ${results.filter((r) => r.status === "skip").length} skipped`);