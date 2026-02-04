describe("Library extras", () => {
  beforeEach(() => {
    cy.task("db:seed");
    cy.login("thibaut.eberhart@gmail.com", "123456");
  });

  it("deletes a shelf after confirmation", () => {
    cy.on("window:confirm", () => true);
    cy.visit("/library");

    cy.contains("h2", "Studio Shelf")
      .closest("section")
      .within(() => {
        cy.contains("button", "Delete").click();
      });

    cy.contains("Shelf deleted.").should("be.visible");
    cy.contains("Studio Shelf").should("not.exist");
  });

  it("cancels deleting a shelf", () => {
    cy.on("window:confirm", () => false);
    cy.visit("/library");

    cy.contains("h2", "Studio Shelf")
      .closest("section")
      .within(() => {
        cy.contains("button", "Delete").click();
      });

    cy.contains("Studio Shelf").should("be.visible");
  });

  it("opens the import modal via query param and closes on backdrop", () => {
    cy.visit("/library?import=1");

    cy.get("[role='dialog']").should("be.visible");
    cy.get("[role='dialog']").parent().click("topLeft");
    cy.get("[role='dialog']").should("not.exist");
  });

  it("shows validation errors for invalid import JSON", () => {
    cy.visit("/library");

    cy.contains("button", "Import products").click();
    cy.get("[role='dialog']").within(() => {
      cy.get("input[type='file']").selectFile(
        {
          contents: Cypress.Buffer.from("not json"),
          fileName: "bad.json",
          mimeType: "application/json",
        },
        { force: true },
      );

      cy.contains("Issues found").should("be.visible");
      cy.contains("Invalid JSON").should("be.visible");
      cy.contains("button", "Import products").should("be.disabled");
    });
  });

  it("prevents deleting a lent item", () => {
    cy.visit("/library");

    const borrowerName = `Alex ${Date.now()}`;

    cy.contains("Blade Runner")
      .closest("[data-cy='product-card']")
      .click();

    cy.get("[data-cy='product-edit-modal']").should("be.visible");
    cy.get("input[name='borrowerName']").type(borrowerName);
    cy.get("[data-cy='product-lend-button']").click();

    cy.contains("Item lent.").should("be.visible");

    cy.contains(`Lent to ${borrowerName}`)
      .closest("[data-cy='product-card']")
      .click();

    cy.get("[data-cy='product-edit-modal']").should("be.visible");
    cy.get("[data-cy='product-delete-button']").then(($button) => {
      const formId = $button.attr("form");
      cy.get(`#${formId}`).submit();
    });
    cy.contains("Return the item before deleting it.").should("be.visible");
    cy.contains("Blade Runner").should("be.visible");
  });
});
