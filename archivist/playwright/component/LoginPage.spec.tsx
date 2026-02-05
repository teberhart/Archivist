import { test, expect } from "@playwright/experimental-ct-react";
import LoginPage from "@/app/login/page";
import { __setSession } from "@/cypress/mocks/auth";
import { mountAsync } from "./utils";

test.describe("LoginPage", () => {
  test.beforeEach(() => {
    __setSession(null);
  });

  test("renders the login form and error message", async ({ mount }) => {
    const component = await mountAsync(
      mount,
      LoginPage({ searchParams: Promise.resolve({ error: "CredentialsSignin" }) }),
    );

    await expect(component.getByText("Sign in to Archivist")).toBeVisible();
    await expect(
      component.getByText("Email or password didn't match."),
    ).toBeVisible();
    await expect(component.locator("input[name='email']")).toBeVisible();
    await expect(component.locator("input[name='password']")).toBeVisible();
    await expect(component.getByRole("button", { name: "Sign in" })).toBeVisible();
  });
});
