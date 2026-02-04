import type { ReactElement } from "react";
import SignupPage from "../../app/signup/page";
import { __setSession } from "../mocks/auth";

const mountAsync = (element: Promise<ReactElement>) => {
  cy.wrap(element).then((resolved) => {
    cy.mount(resolved);
  });
};

describe("SignupPage", () => {
  beforeEach(() => {
    __setSession(null);
  });

  it("renders the signup form and error message", () => {
    mountAsync(
      SignupPage({
        searchParams: Promise.resolve({ error: "duplicate" }),
      }),
    );

    cy.contains("Create your Archivist account").should("be.visible");
    cy.contains("An account with this email already exists.").should(
      "be.visible",
    );
    cy.get("input[name='name']").should("be.visible");
    cy.get("input[name='email']").should("be.visible");
    cy.get("input[name='password']").should("be.visible");
    cy.contains("button", "Create account").should("be.visible");
  });
});
