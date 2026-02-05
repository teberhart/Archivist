import { test, expect } from "@playwright/experimental-ct-react";
import HomePage from "@/app/page";
import { __setSession } from "@/cypress/mocks/auth";
import {
  __setProductResults,
  __setProductCount,
  __setTopShelf,
  __setWeeklyProductCount,
  __setUserResult,
} from "@/cypress/mocks/prisma";
import { mountAsync } from "./utils";

test.describe("HomePage", () => {
  test("renders the logged-out hero", async ({ mount }) => {
    __setSession(null);
    __setProductResults([]);
    __setUserResult(null);

    const component = await mountAsync(
      mount,
      HomePage({ searchParams: Promise.resolve({}) }),
    );

    await expect(
      component.getByText("A calm home for your physical media."),
    ).toBeVisible();
    await expect(component.getByText("Create account")).toBeVisible();
    await expect(component.getByText("Sign in")).toBeVisible();
    await expect(component.getByText("Sample")).toBeVisible();
    await expect(
      component.getByText("Sign in to see your live shelf stats."),
    ).toBeVisible();
  });

  test("renders the logged-in preview", async ({ mount }) => {
    __setSession({ user: { id: "user-1" } });
    __setUserResult({ status: "STANDARD" });
    __setProductResults([
      {
        id: "item-1",
        name: "Blade Runner",
        artist: "Ridley Scott",
        type: "Tape",
        year: 1982,
        shelf: { name: "Living Room" },
      },
      {
        id: "item-2",
        name: "Heat",
        artist: "Michael Mann",
        type: "DVD",
        year: 1995,
        shelf: { name: "Office" },
      },
    ]);
    __setProductCount(4);
    __setWeeklyProductCount(2);
    __setTopShelf({ name: "Living Room", _count: { products: 2 } });

    const component = await mountAsync(
      mount,
      HomePage({ searchParams: Promise.resolve({}) }),
    );

    await expect(component.getByText("Welcome back to your shelf.")).toBeVisible();
    await expect(component.getByText("Sign out")).toBeVisible();
    await expect(component.getByText("Blade Runner")).toBeVisible();
    await expect(component.getByText("Ridley Scott")).toBeVisible();
    await expect(component.getByText("Living Room")).toBeVisible();

    const itemsTracked = component
      .getByText("items tracked")
      .locator("..")
      .locator("p")
      .first();
    await expect(itemsTracked).toHaveText("4");

    await expect(component.getByText("Added this week")).toBeVisible();
    await expect(component.getByText("2 this week")).toBeVisible();
  });

  test("renders the empty shelf pulse when there are no items", async ({ mount }) => {
    __setSession({ user: { id: "user-1" } });
    __setUserResult({ status: "STANDARD" });
    __setProductResults([]);
    __setProductCount(0);
    __setWeeklyProductCount(0);
    __setTopShelf(null);

    const component = await mountAsync(
      mount,
      HomePage({ searchParams: Promise.resolve({}) }),
    );

    const itemsTracked = component
      .getByText("items tracked")
      .locator("..")
      .locator("p")
      .first();
    await expect(itemsTracked).toHaveText("0");

    await expect(component.getByText("Most active shelf")).toBeVisible();
    await expect(component.getByText("No shelves yet")).toBeVisible();
    await expect(
      component.getByText("Add your first shelf to start tracking activity."),
    ).toBeVisible();
  });
});
