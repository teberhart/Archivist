import type { ReactElement } from "react";
import AddShelfPage from "../../app/library/add-shelf/page";
import { __setSession } from "../mocks/auth";

const mountAsync = (element: Promise<ReactElement>) => {
  cy.wrap(element).then((resolved) => {
    cy.mount(resolved as ReactElement);
  });
};

describe("AddShelfPage", () => {
  beforeEach(() => {
    __setSession({ user: { id: "user-1" } });
  });

  it("renders the form and status message", () => {
    mountAsync(
      AddShelfPage({
        searchParams: Promise.resolve({ status: "duplicate" }),
      }),
    );

    cy.contains("Add a new shelf").should("be.visible");
    cy.contains("A shelf with that name already exists.").should(
      "be.visible",
    );
    cy.get("input[name='name']").should("have.attr", "required");
    cy.contains("button", "Add shelf").should("be.visible");
  });
});
