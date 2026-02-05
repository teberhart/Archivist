import { test, expect } from "@playwright/experimental-ct-react";
import AddShelfPage from "@/app/library/add-shelf/page";
import { __setSession } from "@/cypress/mocks/auth";
import { mountAsync } from "./utils";

test.describe("AddShelfPage", () => {
  test.beforeEach(() => {
    __setSession({ user: { id: "user-1" } });
  });

  test("renders the form and status message", async ({ mount }) => {
    const component = await mountAsync(
      mount,
      AddShelfPage({ searchParams: Promise.resolve({ status: "duplicate" }) }),
    );

    await expect(component.getByText("Add a new shelf")).toBeVisible();
    await expect(
      component.getByText("A shelf with that name already exists."),
    ).toBeVisible();
    await expect(
      component.locator("input[name='name']"),
    ).toHaveAttribute("required", "");
    await expect(component.getByRole("button", { name: "Add shelf" })).toBeVisible();
  });
});
