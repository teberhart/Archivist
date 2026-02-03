import { mount } from "cypress/react";

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.get("input[name='email']").type(email);
  cy.get("input[name='password']").type(password, { log: false });
  cy.contains("button", "Sign in").click();
  cy.url().should("not.include", "/login");
});

Cypress.Commands.add("mount", mount);

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      mount: typeof mount;
    }
  }
}

export {};
