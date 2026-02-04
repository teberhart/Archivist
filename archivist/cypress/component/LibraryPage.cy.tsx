import type { ReactElement } from "react";
import LibraryPage from "../../app/library/page";
import { __setSession } from "../mocks/auth";
import {
  __setLibraryError,
  __setLibraryResult,
  __setUserResult,
} from "../mocks/prisma";

const mountAsync = (element: Promise<ReactElement>) => {
  cy.wrap(element).then((resolved) => {
    cy.mount(resolved as ReactElement);
  });
};

describe("LibraryPage", () => {
  beforeEach(() => {
    __setSession({ user: { id: "user-1" } });
    __setUserResult({ status: "STANDARD" });
    __setLibraryError(null);
  });

  it("renders shelves and status messages", () => {
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
              type: "VHS",
              year: 1982,
            },
          ],
        },
      ],
    });

    mountAsync(
      LibraryPage({
        searchParams: Promise.resolve({ status: "created" }),
      }),
    );

    cy.contains("Shelf added successfully.").should("be.visible");
    cy.contains("Living Room").should("be.visible");
    cy.contains("Blade Runner").should("be.visible");
  });

  it("shows the empty state when there are no shelves", () => {
    __setLibraryResult({
      id: "library-2",
      name: "Empty Library",
      shelves: [],
    });

    mountAsync(LibraryPage({ searchParams: Promise.resolve({}) }));

    cy.contains("No shelves yet").should("be.visible");
    cy.contains("Create your first shelf").should("be.visible");
  });

  it("shows an error when the library query fails", () => {
    __setLibraryResult(null);
    __setLibraryError(new Error("Database down"));

    mountAsync(LibraryPage({ searchParams: Promise.resolve({}) }));

    cy.contains("We couldn't load your library").should("be.visible");
  });
});
