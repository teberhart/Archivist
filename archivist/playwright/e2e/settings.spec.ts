import { test, expect } from "@playwright/test";
import { seedDatabase } from "../fixtures/db";
import { login } from "../fixtures/flows";

test.describe("Settings", () => {
  test.beforeEach(async ({ page }) => {
    seedDatabase();
    await login(page);
  });

  test("updates the library name", async ({ page }) => {
    const updatedName = `Playwright Library ${Date.now()}`;

    await page.goto("/settings");
    await page.locator("input[name='libraryName']").fill(updatedName);
    await page.getByRole("button", { name: "Save library" }).click();

    await expect(page.getByText("Library name updated.")).toBeVisible();
    await expect(page.locator("input[name='libraryName']")).toHaveValue(
      updatedName,
    );

    await page.goto("/library");
    await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();
  });

  test("hides the shelf pulse when preferences are updated", async ({ page }) => {
    await page.goto("/settings");

    await page.locator("input[name='showShelfPulse']").uncheck({ force: true });
    await page.getByRole("button", { name: "Save preferences" }).click();

    await expect(page.getByText("Preferences saved.")).toBeVisible();

    await page.goto("/");
    await expect(page.getByText("Shelf pulse is hidden.")).toBeVisible();
    await expect(page.getByText("Enable it in settings")).toBeVisible();
  });

  test("re-enables the shelf pulse", async ({ page }) => {
    await page.goto("/settings");

    await page.locator("input[name='showShelfPulse']").uncheck({ force: true });
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByText("Preferences saved.")).toBeVisible();

    await page.locator("input[name='showShelfPulse']").check({ force: true });
    await page.getByRole("button", { name: "Save preferences" }).click();
    await expect(page.getByText("Preferences saved.")).toBeVisible();

    await page.goto("/");
    await expect(page.getByText("Shelf pulse is hidden.")).toHaveCount(0);
    await expect(page.getByText("items tracked")).toBeVisible();
  });
});
