import ShelfCard from "../../app/library/ShelfCard";

const shelf = {
  id: "shelf-1",
  name: "Living Room",
  products: [
    { id: "product-1", name: "Blade Runner", type: "VHS", year: 1982 },
  ],
};

describe("ShelfCard", () => {
  const productTypes = ["Tape", "CD", "DVD", "Vinyl"];
  it("allows editing a shelf name", () => {
    const updateShelf = cy.stub().resolves();
    cy.wrap(updateShelf).as("updateShelf");

    cy.mount(
      <ShelfCard
        shelf={shelf}
        index={0}
        productTypes={productTypes}
        updateShelf={updateShelf}
        createProduct={cy.stub().resolves()}
        updateProduct={cy.stub().resolves()}
        lendProduct={cy.stub().resolves()}
        returnProduct={cy.stub().resolves()}
        deleteProduct={cy.stub().resolves()}
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
    const createProduct = cy.stub().resolves();
    cy.wrap(createProduct).as("createProduct");

    cy.mount(
      <ShelfCard
        shelf={shelf}
        index={0}
        productTypes={productTypes}
        updateShelf={cy.stub().resolves()}
        createProduct={createProduct}
        updateProduct={cy.stub().resolves()}
        lendProduct={cy.stub().resolves()}
        returnProduct={cy.stub().resolves()}
        deleteProduct={cy.stub().resolves()}
        deleteShelf={cy.stub().resolves()}
      />,
    );

    cy.contains("button", "Add item").click();
    cy.get("input[name='name']").type("New Item");
    cy.get("select[name='type']").select("DVD");
    cy.get("input[name='year']").clear().type("2001");
    cy.contains("button", "Save item").click();
    cy.get("@createProduct").should("have.been.called");
  });

  it("opens and closes the product edit modal", () => {
    const updateProduct = cy.stub().resolves();
    cy.wrap(updateProduct).as("updateProduct");

    cy.mount(
      <ShelfCard
        shelf={shelf}
        index={0}
        productTypes={productTypes}
        updateShelf={cy.stub().resolves()}
        createProduct={cy.stub().resolves()}
        updateProduct={updateProduct}
        lendProduct={cy.stub().resolves()}
        returnProduct={cy.stub().resolves()}
        deleteProduct={cy.stub().resolves()}
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

  it("allows lending and returning from the modal", () => {
    const lendProduct = cy.stub().resolves();
    const returnProduct = cy.stub().resolves();
    cy.wrap(lendProduct).as("lendProduct");
    cy.wrap(returnProduct).as("returnProduct");

    cy.mount(
      <ShelfCard
        shelf={shelf}
        index={0}
        productTypes={productTypes}
        updateShelf={cy.stub().resolves()}
        createProduct={cy.stub().resolves()}
        updateProduct={cy.stub().resolves()}
        lendProduct={lendProduct}
        returnProduct={returnProduct}
        deleteProduct={cy.stub().resolves()}
        deleteShelf={cy.stub().resolves()}
      />,
    );

    cy.get("[data-cy='product-card']").click();
    cy.get("[data-cy='product-edit-modal']").should("be.visible");
    cy.get("input[name='borrowerName']").type("Alex");
    cy.get("input[name='dueAt']").type("2026-02-10");
    cy.get("textarea[name='borrowerNotes']").type("Pick up next weekend.");
    cy.get("[data-cy='product-lend-button']").click();
    cy.get("@lendProduct").should("have.been.called");

    const loanedShelf = {
      ...shelf,
      products: [
        {
          ...shelf.products[0],
          activeLoan: {
            id: "loan-1",
            borrowerName: "Alex",
            lentAt: new Date().toISOString(),
            dueAt: new Date("2026-02-10T12:00:00Z").toISOString(),
            borrowerNotes: "Pick up next weekend.",
          },
          loanHistory: [
            {
              id: "loan-1",
              borrowerName: "Alex",
              lentAt: new Date().toISOString(),
              dueAt: new Date("2026-02-10T12:00:00Z").toISOString(),
              borrowerNotes: "Pick up next weekend.",
            },
            {
              id: "loan-0",
              borrowerName: "Sam",
              lentAt: new Date("2026-01-10T00:00:00Z").toISOString(),
              returnedAt: new Date("2026-01-20T00:00:00Z").toISOString(),
            },
          ],
        },
      ],
    };

    cy.mount(
      <ShelfCard
        shelf={loanedShelf}
        index={0}
        productTypes={productTypes}
        updateShelf={cy.stub().resolves()}
        createProduct={cy.stub().resolves()}
        updateProduct={cy.stub().resolves()}
        lendProduct={lendProduct}
        returnProduct={returnProduct}
        deleteProduct={cy.stub().resolves()}
        deleteShelf={cy.stub().resolves()}
      />,
    );

    cy.contains("Lent to Alex").should("be.visible");
    cy.contains("Due Feb").should("be.visible");
    cy.get("[data-cy='product-card']").click();
    cy.contains("Lending history").should("be.visible");
    cy.contains("Sam").should("be.visible");
    cy.get("[data-cy='product-return-button']").click();
    cy.get("@returnProduct").should("have.been.called");
  });
});
