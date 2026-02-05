import { test, expect } from "@playwright/experimental-ct-react";
import ImportProductsModal from "@/app/library/ImportProductsModal";
import { __setImportProductsHandler } from "@/cypress/mocks/library-actions";
import { __setRouter } from "@/cypress/mocks/next-navigation";

test.describe("ImportProductsModal", () => {
  test.beforeEach(() => {
    __setImportProductsHandler(async () => ({
      status: "success",
      message: "Import complete.",
      summary: {
        shelvesCreated: 1,
        shelvesMatched: 0,
        productsCreated: 2,
        productsUpdated: 0,
      },
    }));
    __setRouter({ refresh: () => {} });
  });

  test("opens and closes the modal", async ({ mount, page }) => {
    await mount(<ImportProductsModal />);

    await page.getByRole("button", { name: "Import products" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();

    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("closes with Escape and resets the preview", async ({ mount, page }) => {
    await mount(<ImportProductsModal initialOpen />);

    await page
      .locator("input[type='file']")
      .setInputFiles({
        name: "import.json",
        mimeType: "application/json",
        buffer: Buffer.from(
          JSON.stringify({
            "Living Room": [
              {
                Name: "Blade Runner",
                Artist: "Ridley Scott",
                Type: "Tape",
                Year: 1982,
              },
            ],
          }),
        ),
      });

    await expect(page.getByText("Preview for import.json")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await page.getByRole("button", { name: "Import products" }).click();
    await expect(page.getByText("Preview for import.json")).toHaveCount(0);
  });

  test("shows validation errors for invalid files", async ({ mount, page }) => {
    await mount(<ImportProductsModal initialOpen />);

    await page
      .locator("input[type='file']")
      .setInputFiles({
        name: "bad.json",
        mimeType: "application/json",
        buffer: Buffer.from("not json"),
      });

    await expect(page.getByText("Issues found")).toBeVisible();
    await expect(page.getByText("Invalid JSON")).toBeVisible();
  });

  test("previews a valid import and submits", async ({ mount, page }) => {
    let refreshCalled = false;
    __setRouter({ refresh: () => {
      refreshCalled = true;
    } });

    await mount(<ImportProductsModal initialOpen />);

    await page
      .locator("input[type='file']")
      .setInputFiles({
        name: "import.json",
        mimeType: "application/json",
        buffer: Buffer.from(
          JSON.stringify({
            "Living Room": [
              {
                Name: "Chicken Run",
                Artist: "Peter Lord",
                Type: "DVD",
                Year: 2003,
              },
              {
                Name: "Heat",
                Artist: "Michael Mann",
                Type: "DVD",
                Year: 1995,
              },
            ],
          }),
        ),
      });

    await expect(page.getByText("Preview for import.json")).toBeVisible();
    await expect(page.getByText("2 products.")).toBeVisible();

    const dialog = page.getByRole("dialog");
    const submitButton = dialog.getByRole("button", { name: "Import products" });
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    await expect(page.getByText("Import complete.")).toBeVisible();
    await expect(page.getByText("Shelves created: 1")).toBeVisible();
    expect(refreshCalled).toBe(true);
  });
});
