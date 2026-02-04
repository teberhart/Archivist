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

  it("promotes and demotes a user to VIP", () => {
    const timestamp = Date.now();
    const email = `cypress.vip.${timestamp}@example.com`;

    cy.visit("/signup");
    cy.get("input[name='name']").type("VIP Candidate");
    cy.get("input[name='email']").type(email);
    cy.get("input[name='password']").type("strong-pass-123");
    cy.contains("button", "Create account").click();

    cy.contains("button", "Sign out").click();
    cy.login("thibaut.eberhart@gmail.com", "123456");
    cy.visit("/admin");

    cy.contains(email)
      .closest("article")
      .within(() => {
        cy.contains("Make VIP").click();
      });

    cy.contains("User promoted to VIP.").should("be.visible");
    cy.contains(email)
      .closest("article")
      .find(".rounded-full")
      .contains("VIP")
      .should("be.visible");

    cy.contains(email)
      .closest("article")
      .within(() => {
        cy.contains("Remove VIP").click();
      });

    cy.contains("User returned to Standard.").should("be.visible");
    cy.contains(email)
      .closest("article")
      .find(".rounded-full")
      .contains("Standard")
      .should("be.visible");
  });

  it("deletes a user account", () => {
    const timestamp = Date.now();
    const email = `cypress.delete.${timestamp}@example.com`;

    cy.visit("/signup");
    cy.get("input[name='name']").type("Delete Me");
    cy.get("input[name='email']").type(email);
    cy.get("input[name='password']").type("strong-pass-123");
    cy.contains("button", "Create account").click();

    cy.contains("button", "Sign out").click();
    cy.login("thibaut.eberhart@gmail.com", "123456");
    cy.visit("/admin");

    cy.on("window:confirm", () => true);
    cy.contains(email)
      .closest("article")
      .within(() => {
        cy.contains("Delete user").click();
      });

    cy.contains("User account deleted.").should("be.visible");
    cy.contains(email).should("not.exist");
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
