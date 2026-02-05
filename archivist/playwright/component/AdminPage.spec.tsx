import { test, expect } from "@playwright/experimental-ct-react";
import AdminPage from "@/app/admin/page";
import { __setSession } from "@/cypress/mocks/auth";
import {
  __setProductTypeList,
  __setUserList,
  __setUserResult,
} from "@/cypress/mocks/prisma";
import { mountAsync } from "./utils";

test.describe("AdminPage", () => {
  test.beforeEach(() => {
    __setSession({
      user: { id: "admin-1", email: "thibaut.eberhart@gmail.com" },
    });
    __setUserResult({ status: "ADMIN" });
    __setProductTypeList([
      { id: "type-1", name: "Tape" },
      { id: "type-2", name: "DVD" },
    ]);
    __setUserList([
      {
        id: "user-1",
        name: "Thibaut",
        email: "thibaut.eberhart@gmail.com",
        status: "ADMIN",
        library: {
          name: "Thibaut's Library",
          shelves: [
            {
              id: "shelf-1",
              name: "Living Room",
              products: [
                {
                  id: "product-1",
                  name: "Blade Runner",
                  type: "VHS",
                  year: 1982,
                },
              ],
            },
          ],
        },
      },
      {
        id: "user-2",
        name: "Guest User",
        email: "guest@example.com",
        status: "STANDARD",
        library: {
          name: "Guest Library",
          shelves: [],
        },
      },
    ]);
  });

  test("renders the user list with library details", async ({ mount }) => {
    const component = await mountAsync(
      mount,
      AdminPage({ searchParams: Promise.resolve({}) }),
    );

    await expect(component.getByText("User directory")).toBeVisible();
    await expect(component.getByText("Thibaut")).toBeVisible();
    await expect(component.getByText("Admin")).toBeVisible();
    await expect(component.getByText("Library: Thibaut's Library")).toBeVisible();
    await expect(component.getByText("Living Room (1 items)")).toBeVisible();
    await expect(component.getByText("Blade Runner")).toBeVisible();
    await expect(component.getByRole("button", { name: "Make VIP" })).toBeVisible();
    await expect(component.getByRole("button", { name: "Delete user" })).toBeVisible();
  });

  test("renders the product types tab", async ({ mount }) => {
    const component = await mountAsync(
      mount,
      AdminPage({ searchParams: Promise.resolve({ tab: "types" }) }),
    );

    await expect(component.getByText("Media type options")).toBeVisible();
    await expect(component.getByText("Tape")).toBeVisible();
    await expect(component.getByText("DVD")).toBeVisible();
    await expect(component.getByRole("button", { name: "Add type" })).toBeVisible();
  });
});
