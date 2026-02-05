import { test, expect } from "@playwright/experimental-ct-react";
import SettingsPage from "@/app/settings/page";
import { __setSession } from "@/cypress/mocks/auth";
import {
  __setLibraryResult,
  __setUserResult,
  __setUserSettingsResult,
} from "@/cypress/mocks/prisma";
import { mountAsync } from "./utils";

test.describe("SettingsPage", () => {
  test.beforeEach(() => {
    __setSession({ user: { id: "user-1" } });
    __setUserResult({
      name: "Thibaut",
      email: "thibaut@example.com",
      status: "STANDARD",
    });
    __setLibraryResult({ name: "Thibaut's Library" });
    __setUserSettingsResult({ showShelfPulse: true });
  });

  test("renders account, library, preferences, and security sections", async ({ mount }) => {
    const component = await mountAsync(
      mount,
      SettingsPage({ searchParams: Promise.resolve({}) }),
    );

    await expect(component.getByText("Settings")).toBeVisible();
    await expect(component.getByText("Profile")).toBeVisible();
    await expect(component.getByText("Library")).toBeVisible();
    await expect(component.getByText("Preferences")).toBeVisible();
    await expect(component.getByText("Security")).toBeVisible();

    await expect(component.locator("input[name='name']")).toHaveValue("Thibaut");
    await expect(component.locator("input[name='email']")).toHaveValue(
      "thibaut@example.com",
    );
    await expect(component.locator("input[name='libraryName']")).toHaveValue(
      "Thibaut's Library",
    );
    await expect(
      component.locator("input[name='showShelfPulse']"),
    ).toBeChecked();
  });

  test("shows status messages", async ({ mount }) => {
    const component = await mountAsync(
      mount,
      SettingsPage({ searchParams: Promise.resolve({ status: "prefs-updated" }) }),
    );

    await expect(component.getByText("Preferences saved.")).toBeVisible();
  });
});
