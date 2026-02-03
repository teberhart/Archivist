describe("Library flow", () => {
  beforeEach(() => {
    cy.task("db:seed");
  });

  it("logs in, loads the library, and adds a shelf", () => {
    cy.login("thibaut.eberhart@gmail.com", "123456");
    cy.visit("/library");
    cy.contains("h1", "Thibaut's Library").should("be.visible");
    cy.contains("Living Room").should("be.visible");

    const shelfName = `Cypress Shelf ${Date.now()}`;

    cy.contains("a", "Add shelf").click();
    cy.url().should("include", "/library/add-shelf");
    cy.get("input[name='name']").type(shelfName);
    cy.contains("button", "Add shelf").click();
    cy.url().should("include", "/library");
    cy.contains(shelfName).should("be.visible");
  });
});
