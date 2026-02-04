import LibraryLoading from "../../app/library/loading";

describe("LibraryLoading", () => {
  it("renders loading placeholders", () => {
    cy.mount(<LibraryLoading />);

    cy.get(".bg-wash").should("have.length.at.least", 8);
    cy.get(".rounded-3xl.border").should("have.length", 2);
  });
});
