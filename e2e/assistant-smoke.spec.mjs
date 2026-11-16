// @ts-check
import { test, expect } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("In-app assistant", () => {
  test("header open, verified answer, navigate, clear chat", async ({ page }) => {
    await page.goto(`${BASE}/app`);

    await page.getByRole("button", { name: "Ask the assistant" }).click();
    await expect(
      page.getByRole("dialog", { name: /NakuruHub Assistant/ }),
    ).toBeVisible();
    await expect(page.getByText("Demo", { exact: true })).toBeVisible();

    const input = page.getByRole("textbox", { name: /Ask a question/i });
    await input.fill("What is Verified?");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByText(/Verified means|Verified inamaanisha/i)).toBeVisible({
      timeout: 8000,
    });
    await expect(page.getByRole("button", { name: /Payment options|Chaguo za malipo/i })).toBeVisible();

    const sellChip = page
      .getByRole("button", { name: /How to sell|Jinsi ya kuuza/i })
      .first();
    await sellChip.click();

    await expect(page.getByText(/free to join|bure kujiunga/i)).toBeVisible({
      timeout: 8000,
    });

    await page.getByRole("button", { name: /Assistant menu/i }).click();
    await page.getByRole("button", { name: /Clear chat|Futa mazungumzo/i }).click();
    await expect(page.getByText(/Demo assistant/)).toBeVisible();
  });
});