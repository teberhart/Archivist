describe("Lending page", () => {
  beforeEach(() => {
    cy.task("db:seed");
    cy.login("thibaut.eberhart@gmail.com", "123456");
  });

  it("lists active loans and allows returning", () => {
    const borrowerName = `Alex ${Date.now()}`;
    const dueDate = "2026-02-10";
    const notes = "Bring it to the studio.";

    cy.visit("/library");
    cy.contains("Blade Runner").closest("[data-cy='product-card']").click();
    cy.get("[data-cy='product-edit-modal']").should("be.visible");
    cy.get("input[name='borrowerName']").type(borrowerName);
    cy.get("input[name='dueAt']").type(dueDate);
    cy.get("textarea[name='borrowerNotes']").type(notes);
    cy.get("[data-cy='product-lend-button']").click();
    cy.contains("Item lent.").should("be.visible");

    cy.visit("/lending");
    cy.contains("Blade Runner").should("be.visible");
    cy.contains("Ridley Scott").should("be.visible");
    cy.contains(borrowerName).should("be.visible");
    cy.contains(notes).should("be.visible");

    cy.contains("Blade Runner")
      .closest("[data-cy='loan-card']")
      .within(() => {
        cy.get("button[data-cy='loan-return-button']")
          .closest("form")
          .submit();
      });

    cy.contains("Item returned.").should("be.visible");
    cy.contains("Blade Runner").should("not.exist");
  });
});
