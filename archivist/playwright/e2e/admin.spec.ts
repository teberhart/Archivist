import { test, expect } from "@playwright/test";
import { seedDatabase } from "../fixtures/db";
import { login } from "../fixtures/flows";
import { getShelfItemCount } from "../fixtures/library";

const blankStorageState = { cookies: [], origins: [] };

const acceptDialog = (page: any) =>
  page.once("dialog", async (dialog: { accept: () => Promise<void> }) => {
    await dialog.accept();
  });

test.describe("Admin access", () => {
  test.use({ storageState: blankStorageState });

  test.beforeEach(() => {
    seedDatabase();
  });

  test("allows the admin user to view the directory", async ({ page }) => {
    await login(page);
    await page.goto("/admin");

    await expect(page.getByText("User directory")).toBeVisible();
    await expect(
      page.getByText("thibaut.eberhart@gmail.com"),
    ).toBeVisible();
    const adminCard = page.locator("article", {
      hasText: "thibaut.eberhart@gmail.com",
    });
    await expect(adminCard.getByText("Admin", { exact: true })).toBeVisible();
  });

  test("promotes and demotes a user to VIP", async ({ page }) => {
    const timestamp = Date.now();
    const email = `playwright.vip.${timestamp}@example.com`;

    await page.goto("/signup");
    await page.locator("input[name='name']").fill("VIP Candidate");
    await page.locator("input[name='email']").fill(email);
    await page.locator("input[name='password']").fill("strong-pass-123");
    await page.getByRole("button", { name: "Create account" }).click();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();

    await login(page);
    await page.goto("/admin");

    const userCard = page.locator("article", { hasText: email });
    await userCard.getByRole("button", { name: "Make VIP" }).click();

    await expect(page.getByText("User promoted to VIP.")).toBeVisible();
    await expect(userCard.getByText(/^VIP$/)).toBeVisible();

    await userCard.getByRole("button", { name: "Remove VIP" }).click();

    await expect(page.getByText("User returned to Standard.")).toBeVisible();
    await expect(userCard.getByText(/^Standard$/)).toBeVisible();
  });

  test("deletes a user account", async ({ page }) => {
    const timestamp = Date.now();
    const email = `playwright.delete.${timestamp}@example.com`;

    await page.goto("/signup");
    await page.locator("input[name='name']").fill("Delete Me");
    await page.locator("input[name='email']").fill(email);
    await page.locator("input[name='password']").fill("strong-pass-123");
    await page.getByRole("button", { name: "Create account" }).click();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();

    await login(page);
    await page.goto("/admin");

    acceptDialog(page);

    const userCard = page.locator("article", { hasText: email });
    await userCard.getByRole("button", { name: "Delete user" }).click();

    await expect(page.getByText("User account deleted.")).toBeVisible();
    await expect(page.getByText(email)).toHaveCount(0);
  });

  test("redirects non-admin users", async ({ page }) => {
    const timestamp = Date.now();
    const email = `playwright.nonadmin.${timestamp}@example.com`;
    const password = "strong-pass-123";

    await page.goto("/signup");
    await page.locator("input[name='name']").fill("Non Admin");
    await page.locator("input[name='email']").fill(email);
    await page.locator("input[name='password']").fill(password);
    await page.getByRole("button", { name: "Create account" }).click();

    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();

    await login(page, { email, password });

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/$/);
  });

  test("manages product types and uses them in products", async ({ page }) => {
    const typeName = `LaserDisc ${Date.now()}`;
    const itemName = `LaserDisc Item ${Date.now()}`;

    await login(page);
    await page.goto("/admin?tab=types");

    await page.locator("input[name='name']").fill(typeName);
    await page.getByRole("button", { name: "Add type" }).click();
    await expect(page.getByText("Product type added.")).toBeVisible();
    await expect(page.getByText(typeName)).toBeVisible();

    await page.goto("/library");
    const countBeforeAdd = await getShelfItemCount(page, "Living Room", {
      minCount: 1,
    });

    const shelfSection = page.locator("section", {
      has: page.getByRole("heading", { name: "Living Room" }),
    });

    await shelfSection.getByRole("button", { name: "Add item" }).click();
    await shelfSection.locator("input[name='name']").fill(itemName);
    await shelfSection.locator("input[name='artist']").fill("Pioneer");
    await shelfSection.locator("select[name='type']").selectOption(typeName);
    await shelfSection.locator("input[name='year']").fill("1994");
    await shelfSection.getByRole("button", { name: "Save item" }).click();

    await expect(page.getByText(itemName)).toBeVisible();
    await expect(page.getByText("Pioneer")).toBeVisible();

    const countAfterAdd = await getShelfItemCount(page, "Living Room", {
      minCount: countBeforeAdd + 1,
    });
    expect(countAfterAdd).toBe(countBeforeAdd + 1);

    await page.goto("/admin?tab=types");
    acceptDialog(page);
    await page
      .locator("li", { hasText: typeName })
      .getByRole("button", { name: "Remove" })
      .click();

    await expect(page.getByText("That product type is in use")).toBeVisible();
    await expect(page.getByText(typeName)).toBeVisible();

    await page.goto("/library");
    await page
      .locator("[data-cy='product-card']", { hasText: itemName })
      .locator("[data-cy='product-edit-button']")
      .click();

    const modal = page.locator("[data-cy='product-edit-modal']");
    await expect(modal).toBeVisible();
    const deleteButton = modal.locator("[data-cy='product-delete-button']");
    const formId = await deleteButton.getAttribute("form");
    if (!formId) {
      throw new Error("Delete button form id not found.");
    }
    await page.evaluate((id) => {
      const form = document.getElementById(id) as HTMLFormElement | null;
      if (!form) {
        throw new Error(`Missing form ${id}`);
      }
      form.requestSubmit();
    }, formId);

    await expect(page.getByText("Item deleted.")).toBeVisible();
    await expect(page.getByText(itemName)).toHaveCount(0);

    const countAfterDelete = await getShelfItemCount(page, "Living Room", {
      minCount: countBeforeAdd,
    });
    expect(countAfterDelete).toBe(countBeforeAdd);

    await page.goto("/admin?tab=types");
    acceptDialog(page);
    await page
      .locator("li", { hasText: typeName })
      .getByRole("button", { name: "Remove" })
      .click();

    await expect(page.getByText("Product type removed.")).toBeVisible();
    await expect(page.getByText(typeName)).toHaveCount(0);
  });
});
