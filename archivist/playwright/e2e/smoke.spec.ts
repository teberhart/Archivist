import { test, expect } from "@playwright/test";
import { login } from "../fixtures/flows";

test.describe("auth", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("login shows logged-in home", async ({ page }) => {
    await login(page);

    await expect(
      page.getByRole("heading", { name: "Welcome back to your shelf." }),
    ).toBeVisible();
  });
});

test("library navigation shows seeded shelves", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "View library" }).click();

  await expect(page).toHaveURL(/\/library/);
  await expect(
    page.getByRole("heading", { name: "Living Room" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Studio Shelf" }),
  ).toBeVisible();
});
