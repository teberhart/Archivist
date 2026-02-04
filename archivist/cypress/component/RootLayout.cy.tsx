import RootLayout from "../../app/layout";

describe("RootLayout", () => {
  it("renders children", () => {
    cy.mount(
      <RootLayout>
        <div>Layout content</div>
      </RootLayout>,
    );

    cy.contains("Layout content").should("be.visible");
  });
});
