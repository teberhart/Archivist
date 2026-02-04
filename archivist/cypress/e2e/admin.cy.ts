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

  it("manages product types and uses them in products", () => {
    const typeName = `LaserDisc ${Date.now()}`;
    const itemName = `LaserDisc Item ${Date.now()}`;

    cy.login("thibaut.eberhart@gmail.com", "123456");
    cy.visit("/admin?tab=types");

    cy.get("input[name='name']").type(typeName);
    cy.contains("button", "Add type").click();
    cy.contains("Product type added.").should("be.visible");
    cy.contains(typeName).should("be.visible");

    cy.visit("/library");
    cy.contains("h2", "Living Room")
      .closest("section")
      .within(() => {
        cy.contains("button", "Add item").click();
        cy.get("input[name='name']").type(itemName);
        cy.get("select[name='type']").select(typeName);
        cy.get("input[name='year']").clear().type("1994");
        cy.contains("button", "Save item").click();
      });

    cy.contains(itemName).should("be.visible");

    cy.visit("/admin?tab=types");
    cy.on("window:confirm", () => true);
    cy.contains(typeName)
      .closest("li")
      .within(() => {
        cy.contains("Remove").click();
      });

    cy.contains("That product type is in use").should("be.visible");
    cy.contains(typeName).should("be.visible");
  });
});
