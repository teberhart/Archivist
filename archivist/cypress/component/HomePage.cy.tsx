import type { ReactElement } from "react";
import HomePage from "../../app/page";
import { __setSession } from "../mocks/auth";
import {
  __setProductResults,
  __setProductCount,
  __setTopShelf,
  __setWeeklyProductCount,
} from "../mocks/prisma";

const mountAsync = (element: Promise<ReactElement>) => {
  cy.wrap(element).then((resolved) => {
    cy.mount(resolved as ReactElement);
  });
};

describe("HomePage", () => {
  it("renders the logged-out hero", () => {
    __setSession(null);
    __setProductResults([]);

    mountAsync(HomePage({ searchParams: Promise.resolve({}) }));

    cy.contains("A calm home for your physical media.").should("be.visible");
    cy.contains("Create account").should("be.visible");
    cy.contains("Sign in").should("be.visible");
    cy.contains("Sample").should("be.visible");
    cy.contains("Sign in to see your live shelf stats.").should("be.visible");
  });

  it("renders the logged-in preview", () => {
    __setSession({ user: { id: "user-1" } });
    __setProductResults([
      {
        id: "item-1",
        name: "Blade Runner",
        type: "VHS",
        year: 1982,
        shelf: { name: "Living Room" },
      },
      {
        id: "item-2",
        name: "Heat",
        type: "Blu-ray",
        year: 1995,
        shelf: { name: "Office" },
      },
    ]);
    __setProductCount(4);
    __setWeeklyProductCount(2);
    __setTopShelf({ name: "Living Room", _count: { products: 2 } });

    mountAsync(HomePage({ searchParams: Promise.resolve({}) }));

    cy.contains("Welcome back to your shelf.").should("be.visible");
    cy.contains("Sign out").should("be.visible");
    cy.contains("Blade Runner").should("be.visible");
    cy.contains("Living Room").should("be.visible");
    cy.contains("items tracked").prev().should("have.text", "4");
    cy.contains("Added this week").should("be.visible");
    cy.contains("2 this week").should("be.visible");
  });

  it("renders the empty shelf pulse when there are no items", () => {
    __setSession({ user: { id: "user-1" } });
    __setProductResults([]);
    __setProductCount(0);
    __setWeeklyProductCount(0);
    __setTopShelf(null);

    mountAsync(HomePage({ searchParams: Promise.resolve({}) }));

    cy.contains("items tracked").prev().should("have.text", "0");
    cy.contains("Most active shelf")
      .parent()
      .contains("No shelves yet")
      .should("be.visible");
    cy.contains("Add your first shelf to start tracking activity.").should(
      "be.visible",
    );
  });
});
