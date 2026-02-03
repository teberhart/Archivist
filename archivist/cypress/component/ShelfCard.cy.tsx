import ShelfCard from "../../app/library/ShelfCard";

const shelf = {
  id: "shelf-1",
  name: "Living Room",
  products: [
    { id: "product-1", name: "Blade Runner", type: "VHS", year: 1982 },
  ],
};

describe("ShelfCard", () => {
  it("allows editing a shelf name", () => {
    const updateShelf = cy.stub().resolves().as("updateShelf");

    cy.mount(
      <ShelfCard
        shelf={shelf}
        index={0}
        updateShelf={updateShelf}
        createProduct={cy.stub().resolves()}
        updateProduct={cy.stub().resolves()}
        deleteShelf={cy.stub().resolves()}
      />,
    );

    cy.contains("button", "Edit").click();
    cy.get("[data-cy='shelf-edit-input']")
      .should("be.visible")
      .clear()
      .type("Studio Shelf");
    cy.contains("button", "Save").click();
    cy.get("@updateShelf").should("have.been.called");
  });

  it("shows the add item form and submits", () => {
    const createProduct = cy.stub().resolves().as("createProduct");

    cy.mount(
      <ShelfCard
        shelf={shelf}
        index={0}
        updateShelf={cy.stub().resolves()}
        createProduct={createProduct}
        updateProduct={cy.stub().resolves()}
        deleteShelf={cy.stub().resolves()}
      />,
    );

    cy.contains("button", "Add item").click();
    cy.get("input[name='name']").type("New Item");
    cy.get("input[name='type']").type("DVD");
    cy.get("input[name='year']").clear().type("2001");
    cy.contains("button", "Save item").click();
    cy.get("@createProduct").should("have.been.called");
  });

  it("opens and closes the product edit modal", () => {
    const updateProduct = cy.stub().resolves().as("updateProduct");

    cy.mount(
      <ShelfCard
        shelf={shelf}
        index={0}
        updateShelf={cy.stub().resolves()}
        createProduct={cy.stub().resolves()}
        updateProduct={updateProduct}
        deleteShelf={cy.stub().resolves()}
      />,
    );

    cy.get("[data-cy='product-edit-button']").click();
    cy.get("[data-cy='product-edit-modal']").should("be.visible");
    cy.get("input[name='name']").clear().type("Blade Runner 2049");
    cy.contains("button", "Save changes").click();
    cy.get("@updateProduct").should("have.been.called");

    cy.get("[data-cy='product-edit-button']").click();
    cy.get("[data-cy='product-edit-modal']").should("be.visible");
    cy.get("body").type("{esc}");
    cy.get("[data-cy='product-edit-modal']").should("not.exist");
  });
});
