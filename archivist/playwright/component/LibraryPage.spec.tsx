import { test, expect } from "@playwright/experimental-ct-react";
import LibraryPage from "@/app/library/page";
import { __setSession } from "@/cypress/mocks/auth";
import {
  __setLibraryError,
  __setLibraryResult,
  __setProductTypeList,
  __setUserResult,
} from "@/cypress/mocks/prisma";
import { mountAsync } from "./utils";

test.describe("LibraryPage", () => {
  test.beforeEach(() => {
    __setSession({ user: { id: "user-1" } });
    __setUserResult({ status: "STANDARD" });
    __setProductTypeList(
      ["Tape", "CD", "DVD", "Vinyl"].map((name, index) => ({
        id: `type-${index}`,
        name,
      })),
    );
    __setLibraryError(null);
  });

  test("renders shelves and status messages", async ({ mount }) => {
    __setLibraryResult({
      id: "library-1",
      name: "My Library",
      shelves: [
        {
          id: "shelf-1",
          name: "Living Room",
          products: [
            {
              id: "product-1",
              name: "Blade Runner",
              artist: "Ridley Scott",
              type: "Tape",
              year: 1982,
            },
          ],
        },
      ],
    });

    const component = await mountAsync(
      mount,
      LibraryPage({ searchParams: Promise.resolve({ status: "created" }) }),
    );

    await expect(component.getByText("Shelf added successfully.")).toBeVisible();
    await expect(component.getByText("Living Room")).toBeVisible();
    await expect(component.getByText("Blade Runner")).toBeVisible();
    await expect(component.getByText("Ridley Scott")).toBeVisible();
  });

  test("shows the empty state when there are no shelves", async ({ mount }) => {
    __setLibraryResult({
      id: "library-2",
      name: "Empty Library",
      shelves: [],
    });

    const component = await mountAsync(
      mount,
      LibraryPage({ searchParams: Promise.resolve({}) }),
    );

    await expect(component.getByText("No shelves yet")).toBeVisible();
    await expect(
      component.getByText("Create your first shelf"),
    ).toBeVisible();
  });

  test("shows an error when the library query fails", async ({ mount }) => {
    __setLibraryResult(null);
    __setLibraryError(new Error("Database down"));

    const component = await mountAsync(
      mount,
      LibraryPage({ searchParams: Promise.resolve({}) }),
    );

    await expect(
      component.getByText("We couldn't load your library"),
    ).toBeVisible();
  });
});
