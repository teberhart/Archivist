import type { ReactElement } from "react";
import LoginPage from "../../app/login/page";
import { __setSession } from "../mocks/auth";

const mountAsync = (element: Promise<ReactElement>) => {
  cy.wrap(element).then((resolved) => {
    cy.mount(resolved as ReactElement);
  });
};

describe("LoginPage", () => {
  beforeEach(() => {
    __setSession(null);
  });

  it("renders the login form and error message", () => {
    mountAsync(
      LoginPage({
        searchParams: Promise.resolve({ error: "CredentialsSignin" }),
      }),
    );

    cy.contains("Sign in to Archivist").should("be.visible");
    cy.contains("Email or password didn't match.").should("be.visible");
    cy.get("input[name='email']").should("be.visible");
    cy.get("input[name='password']").should("be.visible");
    cy.contains("button", "Sign in").should("be.visible");
  });
});
