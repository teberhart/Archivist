import { test, expect } from "@playwright/test";
import { seedDatabase } from "../fixtures/db";
import { login } from "../fixtures/flows";

const acceptDialog = (page: any) =>
  page.once("dialog", async (dialog: { accept: () => Promise<void> }) => {
    await dialog.accept();
  });

const dismissDialog = (page: any) =>
  page.once("dialog", async (dialog: { dismiss: () => Promise<void> }) => {
    await dialog.dismiss();
  });

test.describe("Library extras", () => {
  test.beforeEach(async ({ page }) => {
    seedDatabase();
    await login(page);
  });

  test("deletes a shelf after confirmation", async ({ page }) => {
    await page.goto("/library");

    acceptDialog(page);

    const shelfSection = page.locator("section", {
      has: page.getByRole("heading", { name: "Studio Shelf" }),
    });
    await shelfSection.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Shelf deleted.")).toBeVisible();
    await expect(page.getByText("Studio Shelf")).toHaveCount(0);
  });

  test("cancels deleting a shelf", async ({ page }) => {
    await page.goto("/library");

    dismissDialog(page);

    const shelfSection = page.locator("section", {
      has: page.getByRole("heading", { name: "Studio Shelf" }),
    });
    await shelfSection.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Studio Shelf")).toBeVisible();
  });

  test("opens the import modal via query param and closes on backdrop", async ({ page }) => {
    await page.goto("/library?import=1");

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.locator("..").click({ position: { x: 8, y: 8 } });
    await expect(dialog).toHaveCount(0);
  });

  test("shows validation errors for invalid import JSON", async ({ page }) => {
    await page.goto("/library");

    await page.getByRole("button", { name: "Import products" }).first().click();

    const dialog = page.getByRole("dialog");
    await dialog
      .locator("input[type='file']")
      .setInputFiles({
        name: "bad.json",
        mimeType: "application/json",
        buffer: Buffer.from("not json"),
      });

    await expect(dialog.getByText("Issues found")).toBeVisible();
    await expect(dialog.getByText("Invalid JSON")).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: "Import products" }),
    ).toBeDisabled();
  });

  test("prevents deleting a lent item", async ({ page }) => {
    await page.goto("/library");

    const borrowerName = `Alex ${Date.now()}`;

    await page
      .locator("[data-cy='product-card']", { hasText: "Blade Runner" })
      .click();

    const modal = page.locator("[data-cy='product-edit-modal']");
    await expect(modal).toBeVisible();
    await modal.locator("input[name='borrowerName']").fill(borrowerName);
    await modal.locator("[data-cy='product-lend-button']").click();

    await expect(page.getByText("Item lent.")).toBeVisible();

    await page
      .locator("[data-cy='product-card']", { hasText: borrowerName })
      .click();

    await expect(modal).toBeVisible();
    await modal.locator("[data-cy='product-delete-button']").click();

    await expect(
      page.getByText("Return the item before deleting it."),
    ).toBeVisible();
    await expect(page.getByText("Blade Runner")).toBeVisible();
  });
});
