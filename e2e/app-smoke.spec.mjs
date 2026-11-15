// @ts-check
import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("NakuruHub /app smoke", () => {
  test("add to cart, place order, see order card", async ({ page }) => {
    await page.goto(`${BASE}/app`);

    await expect(page.locator("#hd .logo")).toContainText("NakuruHub");

    const addBtn = page
      .locator(".pc .btn")
      .filter({ hasText: "Add to cart" })
      .first();
    await addBtn.click();
    await expect(page.locator("#toast")).toBeVisible();
    await expect(page.locator("#toast")).toContainText("Added to cart");

    await page.locator('#nav button:has-text("Cart")').click();
    await expect(page.getByRole("heading", { name: "Your cart" })).toBeVisible();

    await page.getByRole("button", { name: /Place order/ }).click();
    await expect(page.locator("#toast")).toContainText("Order placed");

    await expect(page.getByText(/Order #/)).toBeVisible();
  });

  test("?start=vendor opens vendor signup", async ({ page }) => {
    await page.goto(`${BASE}/app?start=vendor`);
    await expect(page.getByRole("heading", { name: "Sell on NakuruHub" })).toBeVisible();
    await expect(page.locator("#vn")).toBeVisible();
  });
});