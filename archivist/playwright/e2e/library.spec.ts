import { test, expect } from "@playwright/test";
import { seedDatabase } from "../fixtures/db";
import { login } from "../fixtures/flows";

const getShelfMetricValue = async (page: any, label: string) => {
  return page.getByText(label).locator("..").locator("span").nth(1);
};

test.describe("Library flow", () => {
  test.beforeEach(() => {
    seedDatabase();
  });

  test("shows import CTAs on the home page", async ({ page }) => {
    await login(page);
    await page.goto("/");

    await expect(
      page.getByRole("button", { name: "Import products" }).first(),
    ).toBeVisible();
    await expect(page.getByText("Add item")).toHaveCount(0);
    await expect(page.getByText("Add new item")).toHaveCount(0);

    const itemsTracked = page.getByText("items tracked").locator("..").locator("p").first();
    await expect(itemsTracked).toHaveText("4");

    const mostActiveShelf = await getShelfMetricValue(page, "Most active shelf");
    await expect(mostActiveShelf).toHaveText("Living Room");

    const addedThisWeek = await getShelfMetricValue(page, "Added this week");
    await expect(addedThisWeek).toHaveText("4 this week");
  });

  test("logs in, loads the library, and adds a shelf", async ({ page }) => {
    await login(page);
    await page.goto("/library");
    await expect(
      page.getByRole("heading", { name: "Thibaut's Library" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Living Room" })).toBeVisible();

    const shelfName = `Playwright Shelf ${Date.now()}`;

    await page.getByRole("link", { name: "Add shelf" }).click();
    await expect(page).toHaveURL(/\/library\/add-shelf/);
    await page.locator("input[name='name']").fill(shelfName);
    await page.getByRole("button", { name: "Add shelf" }).click();

    await expect(page).toHaveURL(/\/library/);
    await expect(page.getByRole("heading", { name: shelfName })).toBeVisible();
  });

  test("edits a shelf name inline", async ({ page }) => {
    await login(page);
    await page.goto("/library");

    const updatedName = `Living Room ${Date.now()}`;

    await expect(page.getByRole("heading", { name: "Living Room" })).toBeVisible();
    await page.locator("[data-cy='shelf-edit-button']").first().click();
    const input = page.locator("[data-cy='shelf-edit-input']");
    await expect(input).toBeVisible();
    await input.fill(updatedName);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByRole("heading", { name: updatedName })).toBeVisible();
  });

  test("adds an item to a shelf", async ({ page }) => {
    await login(page);
    await page.goto("/library");

    const itemName = `Playwright Item ${Date.now()}`;
    const shelfSection = page.locator("section", {
      has: page.getByRole("heading", { name: "Living Room" }),
    });

    await shelfSection.getByRole("button", { name: "Add item" }).click();
    await shelfSection.locator("input[name='name']").fill(itemName);
    await shelfSection.locator("input[name='artist']").fill("Wachowski");
    await shelfSection.locator("select[name='type']").selectOption("DVD");
    await shelfSection.locator("input[name='year']").fill("1999");
    await shelfSection.getByRole("button", { name: "Save item" }).click();

    await expect(page.getByText(itemName)).toBeVisible();
    await expect(shelfSection.getByText("Wachowski")).toBeVisible();
  });

  test("edits an item in a modal and closes with Escape", async ({ page }) => {
    await login(page);
    await page.goto("/library");

    const productList = page.locator("[data-cy='product-card']");
    await expect(productList.getByText("Blade Runner").first()).toBeVisible();
    await page.locator("[data-cy='product-card']").first().click();

    const modal = page.locator("[data-cy='product-edit-modal']");
    await expect(modal).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
  });

  test("updates an item from the modal", async ({ page }) => {
    await login(page);
    await page.goto("/library");

    const newName = `Blade Runner ${Date.now()}`;

    const productList = page.locator("[data-cy='product-card']");
    await expect(productList.getByText("Blade Runner").first()).toBeVisible();
    await page.locator("[data-cy='product-card']").first().click();

    const modal = page.locator("[data-cy='product-edit-modal']");
    await expect(modal).toBeVisible();

    await modal.locator("input[name='name']").fill(newName);
    await modal.locator("input[name='artist']").fill("Ridley Scott");
    await modal.locator("select[name='type']").selectOption("DVD");
    const saveButton = modal.getByRole("button", { name: "Save changes" });
    const formId = await saveButton.getAttribute("form");
    if (!formId) {
      throw new Error("Save changes form id not found.");
    }
    await page.evaluate((id) => {
      const form = document.getElementById(id) as HTMLFormElement | null;
      if (!form) {
        throw new Error(`Missing form ${id}`);
      }
      form.requestSubmit();
    }, formId);

    await expect(page.getByText("Item updated.")).toBeVisible();
    await expect(page.getByText(newName)).toBeVisible();
    await expect(page.getByText("Ridley Scott")).toBeVisible();
  });

  test("lends and returns an item", async ({ page }) => {
    await login(page);
    await page.goto("/library");

    const borrowerName = `Alex ${Date.now()}`;
    const dueDate = "2026-02-10";
    const notes = "Meet at the studio next weekend.";

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
    await expect(page.getByText(`Lent to ${borrowerName}`)).toBeVisible();
    await expect(page.getByText("Due")).toBeVisible();

    await page
      .locator("[data-cy='product-card']", { hasText: borrowerName })
      .click();

    await expect(modal).toBeVisible();
    await expect(page.getByText("Lending history")).toBeVisible();
    await expect(modal.getByText(borrowerName).first()).toBeVisible();
    await expect(modal.getByText(notes).first()).toBeVisible();
    await modal.locator("[data-cy='product-return-button']").click();

    await expect(page.getByText("Item returned.")).toBeVisible();
    await expect(page.getByText(`Lent to ${borrowerName}`)).toHaveCount(0);
  });

  test("imports products from JSON", async ({ page }) => {
    await login(page);
    await page.goto("/library");

    await page.getByRole("button", { name: "Import products" }).first().click();

    const dialog = page.getByRole("dialog");
    await dialog
      .locator("input[type='file']")
      .setInputFiles("cypress/fixtures/import-products.json");

    await dialog.getByRole("button", { name: "Import products" }).click();
    await expect(page.getByText("Import completed")).toBeVisible();

    await expect(page.getByText("Chicken Run")).toBeVisible();
    await expect(page.getByText("Heat")).toBeVisible();
    const productList = page.locator("[data-cy='product-card']");
    await expect(productList.getByText("Blade Runner").first()).toBeVisible();
    await expect(page.getByText("Peter Lord")).toBeVisible();
    await expect(page.getByText("Michael Mann")).toBeVisible();
  });
});
