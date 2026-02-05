import { test, expect } from "@playwright/experimental-ct-react";
import LendingPage from "@/app/lending/page";
import { __setSession } from "@/cypress/mocks/auth";
import { __setLoanList, __setUserResult } from "@/cypress/mocks/prisma";
import { mountAsync } from "./utils";

test.describe("LendingPage", () => {
  test.beforeEach(() => {
    __setSession({ user: { id: "user-1" } });
    __setUserResult({ status: "STANDARD" });
  });

  test("shows the empty state", async ({ mount }) => {
    __setLoanList([]);

    const component = await mountAsync(
      mount,
      LendingPage({ searchParams: Promise.resolve({}) }),
    );

    await expect(component.getByText("No items on loan")).toBeVisible();
    await expect(component.getByText("Go to your library")).toBeVisible();
  });

  test("renders active loans", async ({ mount }) => {
    __setLoanList([
      {
        id: "loan-1",
        borrowerName: "Alex",
        borrowerNotes: "Drop off next week.",
        lentAt: new Date("2026-02-01T12:00:00Z"),
        dueAt: new Date("2026-02-10T12:00:00Z"),
        product: {
          id: "product-1",
          name: "Blade Runner",
          artist: "Ridley Scott",
          type: "Tape",
          year: 1982,
          shelf: { name: "Living Room" },
        },
      },
    ]);

    const component = await mountAsync(
      mount,
      LendingPage({ searchParams: Promise.resolve({}) }),
    );

    await expect(component.getByText("Blade Runner")).toBeVisible();
    await expect(component.getByText("Alex")).toBeVisible();
    await expect(component.getByText("Ridley Scott")).toBeVisible();
    await expect(component.getByText("Due")).toBeVisible();
    await expect(component.getByText("Drop off next week.")).toBeVisible();
    await expect(component.getByText("Mark returned")).toBeVisible();
  });
});
