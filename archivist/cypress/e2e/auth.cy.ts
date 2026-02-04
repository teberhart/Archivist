describe("Auth flow", () => {
  beforeEach(() => {
    cy.task("db:seed");
  });

  it("shows logged-out CTAs on the home page", () => {
    cy.visit("/");

    cy.contains("Sign in").should("be.visible");
    cy.contains("Create account").should("be.visible");
    cy.contains("Sign out").should("not.exist");
    cy.contains("Sample").should("be.visible");
    cy.contains("Sign in to see your live shelf stats.").should("be.visible");
  });

  it("signs up a new user and shows the success banner", () => {
    const timestamp = Date.now();
    const email = `cypress.user.${timestamp}@example.com`;

    cy.visit("/signup");
    cy.get("input[name='name']").type("Cypress User");
    cy.get("input[name='email']").type(email);
    cy.get("input[name='password']").type("strong-pass-123");
    cy.contains("button", "Create account").click();

    cy.contains("Account created. Welcome to Archivist.", { timeout: 10000 })
      .should("be.visible");
    cy.contains("button", "Sign out").should("be.visible");
  });

  it("shows an error for invalid credentials", () => {
    cy.visit("/login?error=CredentialsSignin");

    cy.contains("Email or password didn't match.").should("be.visible");
  });
});
