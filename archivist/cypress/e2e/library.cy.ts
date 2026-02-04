describe("Library flow", () => {
  beforeEach(() => {
    cy.task("db:seed");
  });

  it("shows import CTAs on the home page", () => {
    cy.login("thibaut.eberhart@gmail.com", "123456");
    cy.visit("/");
    cy.contains("button", "Import products").should("be.visible");
    cy.contains("Add item").should("not.exist");
    cy.contains("Add new item").should("not.exist");
    cy.contains("items tracked").prev().should("have.text", "4");
    cy.contains("Most active shelf")
      .parent()
      .contains("Living Room")
      .should("be.visible");
    cy.contains("Added this week")
      .parent()
      .contains("4 this week")
      .should("be.visible");
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

  it("edits a shelf name inline", () => {
    cy.login("thibaut.eberhart@gmail.com", "123456");
    cy.visit("/library");

    const updatedName = `Living Room ${Date.now()}`;

    cy.contains("h2", "Living Room").should("be.visible");
    cy.get("[data-cy='shelf-edit-button']").first().click();
    cy.get("[data-cy='shelf-edit-input']")
      .should("be.visible")
      .clear()
      .type(updatedName);
    cy.contains("button", "Save").click();

    cy.contains("h2", updatedName).should("be.visible");
  });

  it("adds an item to a shelf", () => {
    cy.login("thibaut.eberhart@gmail.com", "123456");
    cy.visit("/library");

    const itemName = `Cypress Item ${Date.now()}`;

    cy.contains("h2", "Living Room")
      .closest("section")
      .within(() => {
        cy.contains("button", "Add item").click();
        cy.get("input[name='name']").type(itemName);
        cy.get("input[name='type']").type("VHS");
        cy.get("input[name='year']").clear().type("1999");
        cy.contains("button", "Save item").click();
      });

    cy.contains(itemName).should("be.visible");
  });

  it("edits an item in a modal and closes with Escape", () => {
    cy.login("thibaut.eberhart@gmail.com", "123456");
    cy.visit("/library");

    cy.contains("Blade Runner").should("be.visible");
    cy.get("[data-cy='product-edit-button']").first().click();

    cy.get("[data-cy='product-edit-modal']").should("be.visible");
    cy.get("body").type("{esc}");
    cy.get("[data-cy='product-edit-modal']").should("not.exist");
  });

  it("updates an item from the modal", () => {
    cy.login("thibaut.eberhart@gmail.com", "123456");
    cy.visit("/library");

    const newName = `Blade Runner ${Date.now()}`;

    cy.contains("Blade Runner").should("be.visible");
    cy.get("[data-cy='product-edit-button']").first().click();

    cy.get("[data-cy='product-edit-modal']").should("be.visible");
    cy.get("input[name='name']").clear().type(newName);
    cy.contains("button", "Save changes").click();
    cy.contains("Item updated.").should("be.visible");
    cy.contains(newName, { timeout: 10000 }).should("be.visible");
  });

  it("imports products from JSON", () => {
    cy.login("thibaut.eberhart@gmail.com", "123456");
    cy.visit("/library");

    cy.contains("button", "Import products").click();
    cy.get("[role='dialog']").within(() => {
      cy.get("input[type='file']").selectFile(
        "cypress/fixtures/import-products.json",
        { force: true },
      );
      cy.contains("button", "Import products").click();
      cy.contains("Import completed").should("be.visible");
    });

    cy.contains("Import Shelf").should("be.visible");
    cy.contains("La Haine").should("be.visible");
    cy.contains("Blade Runner").should("be.visible");
    cy.contains("4K").should("be.visible");
  });
});
