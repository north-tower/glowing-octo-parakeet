// @ts-check
import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const WIDTHS = [360, 390, 412];

for (const w of WIDTHS) {
  for (const theme of ["light", "dark"]) {
    test(`shell QA ${w}px ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(`${BASE}/app`);

      const nav = page.locator("#nav.app-bottom-nav");
      await expect(nav).toBeVisible();
      await expect(page.locator("#fab")).toHaveCount(0);
      await expect(page.locator("#sb")).toHaveCount(0);

      const navBox = await nav.boundingBox();
      expect(navBox).toBeTruthy();

      const addBtn = page
        .locator(".pc .btn")
        .filter({ hasText: /Add to cart|Ongeza/ })
        .first();
      await addBtn.click();

      const cartTab = page.locator('#nav button:has(.nav-tab-badge)');
      await expect(cartTab).toBeVisible();

      const lastCard = page.locator(".g2 .pc").last();
      await lastCard.scrollIntoViewIfNeeded();
      const cardBox = await lastCard.boundingBox();
      expect(cardBox).toBeTruthy();
      if (navBox && cardBox) {
        expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(navBox.y + 1);
      }

      await page.locator('#nav button:has-text("Cart")').first().click();
      await expect(page.getByRole("heading", { name: /cart/i })).toBeVisible();

      const errors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");
      expect(errors).toEqual([]);
    });
  }
}