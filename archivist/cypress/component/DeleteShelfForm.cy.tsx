import DeleteShelfForm from "../../app/library/DeleteShelfForm";

describe("DeleteShelfForm", () => {
  it("renders the shelf id and delete button", () => {
    const action = cy.stub().as("deleteShelf");

    cy.mount(
      <DeleteShelfForm shelfId="shelf-test" action={action as any} />,
    );

    cy.get("input[name='shelfId']").should("have.value", "shelf-test");
    cy.contains("button", "Delete").should("be.visible");
  });
});
