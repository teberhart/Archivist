import type { ReactElement } from "react";
import HomePage from "../../app/page";
import { __setSession } from "../mocks/auth";
import { __setProductResults } from "../mocks/prisma";

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

    mountAsync(HomePage({ searchParams: Promise.resolve({}) }));

    cy.contains("Welcome back to your shelf.").should("be.visible");
    cy.contains("Sign out").should("be.visible");
    cy.contains("Blade Runner").should("be.visible");
    cy.contains("Living Room").should("be.visible");
  });
});
