import type { ReactElement } from "react";
import LendingPage from "../../app/lending/page";
import { __setSession } from "../mocks/auth";
import { __setLoanList, __setUserResult } from "../mocks/prisma";

const mountAsync = (element: Promise<ReactElement>) => {
  cy.wrap(element).then((resolved) => {
    cy.mount(resolved as ReactElement);
  });
};

describe("LendingPage", () => {
  beforeEach(() => {
    __setSession({ user: { id: "user-1" } });
    __setUserResult({ status: "STANDARD" });
  });

  it("shows the empty state", () => {
    __setLoanList([]);

    mountAsync(LendingPage({ searchParams: Promise.resolve({}) }));

    cy.contains("No items on loan").should("be.visible");
    cy.contains("Go to your library").should("be.visible");
  });

  it("renders active loans", () => {
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

    mountAsync(LendingPage({ searchParams: Promise.resolve({}) }));

    cy.contains("Blade Runner").should("be.visible");
    cy.contains("Alex").should("be.visible");
    cy.contains("Ridley Scott").should("be.visible");
    cy.contains("Due").should("be.visible");
    cy.contains("Drop off next week.").should("be.visible");
    cy.contains("Mark returned").should("be.visible");
  });
});
