import { test, expect } from "@playwright/test";
import { seedDatabase } from "../fixtures/db";

const blankStorageState = { cookies: [], origins: [] };

test.describe("Auth flow", () => {
  test.use({ storageState: blankStorageState });

  test.beforeEach(() => {
    seedDatabase();
  });

  test("shows logged-out CTAs on the home page", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("link", { name: "Sign in" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Create account" }).first(),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toHaveCount(0);
    await expect(page.getByText("Sample")).toBeVisible();
    await expect(
      page.getByText("Sign in to see your live shelf stats."),
    ).toBeVisible();
  });

  test("signs up a new user and shows the success banner", async ({ page }) => {
    const timestamp = Date.now();
    const email = `playwright.user.${timestamp}@example.com`;

    await page.goto("/signup");
    await page.locator("input[name='name']").fill("Playwright User");
    await page.locator("input[name='email']").fill(email);
    await page.locator("input[name='password']").fill("strong-pass-123");
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(
      page.getByText("Account created. Welcome to Archivist."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/login?error=CredentialsSignin");

    await expect(
      page.getByText("Email or password didn't match."),
    ).toBeVisible();
  });
});
