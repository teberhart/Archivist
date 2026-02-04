describe("Settings", () => {
  beforeEach(() => {
    cy.task("db:seed");
    cy.login("thibaut.eberhart@gmail.com", "123456");
  });

  it("updates the library name", () => {
    const updatedName = `Cypress Library ${Date.now()}`;

    cy.visit("/settings");
    cy.get("input[name='libraryName']").clear().type(updatedName);
    cy.contains("button", "Save library").click();

    cy.contains("Library name updated.").should("be.visible");
    cy.get("input[name='libraryName']").should("have.value", updatedName);

    cy.visit("/library");
    cy.contains("h1", updatedName).should("be.visible");
  });

  it("hides the shelf pulse when preferences are updated", () => {
    cy.visit("/settings");

    cy.get("input[name='showShelfPulse']").uncheck({ force: true });
    cy.contains("button", "Save preferences").click();

    cy.contains("Preferences saved.").should("be.visible");

    cy.visit("/");
    cy.contains("Shelf pulse is hidden.").should("be.visible");
    cy.contains("Enable it in settings").should("be.visible");
  });
});
