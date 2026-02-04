describe("Admin access", () => {
  beforeEach(() => {
    cy.task("db:seed");
  });

  it("allows the admin user to view the directory", () => {
    cy.login("thibaut.eberhart@gmail.com", "123456");
    cy.visit("/admin");

    cy.contains("User directory").should("be.visible");
    cy.contains("thibaut.eberhart@gmail.com").should("be.visible");
    cy.contains("Admin").should("be.visible");
  });

  it("redirects non-admin users", () => {
    const timestamp = Date.now();
    const email = `cypress.nonadmin.${timestamp}@example.com`;
    const password = "strong-pass-123";

    cy.visit("/signup");
    cy.get("input[name='name']").type("Non Admin");
    cy.get("input[name='email']").type(email);
    cy.get("input[name='password']").type(password);
    cy.contains("button", "Create account").click();

    cy.contains("button", "Sign out").click();
    cy.login(email, password);

    cy.visit("/admin");
    cy.location("pathname").should("eq", "/");
  });
});
