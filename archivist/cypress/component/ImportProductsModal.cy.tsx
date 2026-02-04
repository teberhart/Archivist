import ImportProductsModal from "../../app/library/ImportProductsModal";
import { __setImportProductsHandler } from "../mocks/library-actions";
import { __setRouter } from "../mocks/next-navigation";

describe("ImportProductsModal", () => {
  beforeEach(() => {
    __setImportProductsHandler(async () => ({
      status: "success",
      message: "Import complete.",
      summary: {
        shelvesCreated: 1,
        shelvesMatched: 0,
        productsCreated: 2,
        productsUpdated: 0,
      },
    }));

    const refresh = cy.stub();
    cy.wrap(refresh).as("refresh");
    __setRouter({ refresh });
  });

  it("opens and closes the modal", () => {
    cy.mount(<ImportProductsModal />);

    cy.contains("button", "Import products").click();
    cy.get("[role='dialog']").should("be.visible");

    cy.contains("button", "Close").click();
    cy.get("[role='dialog']").should("not.exist");
  });

  it("closes with Escape and resets the preview", () => {
    cy.mount(<ImportProductsModal initialOpen />);

    cy.get("input[type='file']").selectFile(
      {
        contents: Cypress.Buffer.from(
          JSON.stringify({
            "Living Room": [
              { Name: "Blade Runner", Type: "VHS", Year: 1982 },
            ],
          }),
        ),
        fileName: "import.json",
        mimeType: "application/json",
      },
      { force: true },
    );

    cy.contains("Preview for import.json").should("be.visible");
    cy.get("body").type("{esc}");
    cy.get("[role='dialog']").should("not.exist");

    cy.contains("button", "Import products").click();
    cy.contains("Preview for import.json").should("not.exist");
  });

  it("shows validation errors for invalid files", () => {
    cy.mount(<ImportProductsModal initialOpen />);

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
  });

  it("previews a valid import and submits", () => {
    cy.mount(<ImportProductsModal initialOpen />);

    cy.get("input[type='file']").selectFile(
      {
        contents: Cypress.Buffer.from(
          JSON.stringify({
            "Living Room": [
              { Name: "Chicken Run", Type: "DVD", Year: 2003 },
              { Name: "Heat", Type: "Blu-ray", Year: 1995 },
            ],
          }),
        ),
        fileName: "import.json",
        mimeType: "application/json",
      },
      { force: true },
    );

    cy.contains("Preview for import.json").should("be.visible");
    cy.contains("2 products.").should("be.visible");

    cy.get("[role='dialog']").within(() => {
      cy.contains("button", "Import products").should("not.be.disabled");
      cy.contains("button", "Import products").click();
    });

    cy.contains("Import complete.").should("be.visible");
    cy.contains("Shelves created: 1").should("be.visible");
    cy.get("@refresh").should("have.been.called");
  });
});
