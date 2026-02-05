import { test, expect } from "@playwright/test";
import { seedDatabase } from "../fixtures/db";
import { login } from "../fixtures/flows";

test.describe("Lending page", () => {
  test.beforeEach(async ({ page }) => {
    seedDatabase();
    await login(page);
  });

  test("lists active loans and allows returning", async ({ page }) => {
    const borrowerName = `Alex ${Date.now()}`;
    const dueDate = "2026-02-10";
    const notes = "Bring it to the studio.";

    await page.goto("/library");
    await page
      .locator("[data-cy='product-card']", { hasText: "Blade Runner" })
      .click();
    const modal = page.locator("[data-cy='product-edit-modal']");
    await expect(modal).toBeVisible();
    await modal.locator("input[name='borrowerName']").fill(borrowerName);
    await modal.locator("input[name='dueAt']").fill(dueDate);
    await modal.locator("textarea[name='borrowerNotes']").fill(notes);
    await modal.locator("[data-cy='product-lend-button']").click();
    await expect(page.getByText("Item lent.")).toBeVisible();

    await page.goto("/lending");
    await expect(page.getByText("Blade Runner")).toBeVisible();
    await expect(page.getByText("Ridley Scott")).toBeVisible();
    await expect(page.getByText(borrowerName)).toBeVisible();
    await expect(page.getByText(notes)).toBeVisible();

    const loanCard = page.locator("[data-cy='loan-card']", {
      hasText: "Blade Runner",
    });
    await loanCard
      .locator("[data-cy='loan-return-button']")
      .click();

    await expect(page.getByText("Item returned.")).toBeVisible();
    await expect(page.getByText("Blade Runner")).toHaveCount(0);
  });
});
