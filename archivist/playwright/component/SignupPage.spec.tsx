import { test, expect } from "@playwright/experimental-ct-react";
import SignupPage from "@/app/signup/page";
import { __setSession } from "@/cypress/mocks/auth";
import { mountAsync } from "./utils";

test.describe("SignupPage", () => {
  test.beforeEach(() => {
    __setSession(null);
  });

  test("renders the signup form and error message", async ({ mount }) => {
    const component = await mountAsync(
      mount,
      SignupPage({ searchParams: Promise.resolve({ error: "duplicate" }) }),
    );

    await expect(component.getByText("Create your Archivist account")).toBeVisible();
    await expect(
      component.getByText("An account with this email already exists."),
    ).toBeVisible();
    await expect(component.locator("input[name='name']")).toBeVisible();
    await expect(component.locator("input[name='email']")).toBeVisible();
    await expect(component.locator("input[name='password']")).toBeVisible();
    await expect(
      component.getByRole("button", { name: "Create account" }),
    ).toBeVisible();
  });
});
