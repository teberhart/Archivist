import type { ReactElement } from "react";
import AdminPage from "../../app/admin/page";
import { __setSession } from "../mocks/auth";
import { __setUserList, __setUserResult } from "../mocks/prisma";

const mountAsync = (element: Promise<ReactElement>) => {
  cy.wrap(element).then((resolved) => {
    cy.mount(resolved as ReactElement);
  });
};

describe("AdminPage", () => {
  beforeEach(() => {
    __setSession({
      user: { id: "admin-1", email: "thibaut.eberhart@gmail.com" },
    });
    __setUserResult({ status: "ADMIN" });
    __setUserList([
      {
        id: "user-1",
        name: "Thibaut",
        email: "thibaut.eberhart@gmail.com",
        status: "ADMIN",
        library: {
          name: "Thibaut's Library",
          shelves: [
            {
              id: "shelf-1",
              name: "Living Room",
              products: [
                {
                  id: "product-1",
                  name: "Blade Runner",
                  type: "VHS",
                  year: 1982,
                },
              ],
            },
          ],
        },
      },
      {
        id: "user-2",
        name: "Guest User",
        email: "guest@example.com",
        status: "STANDARD",
        library: {
          name: "Guest Library",
          shelves: [],
        },
      },
    ]);
  });

  it("renders the user list with library details", () => {
    mountAsync(AdminPage({ searchParams: Promise.resolve({}) }));

    cy.contains("User directory").should("be.visible");
    cy.contains("Thibaut").should("be.visible");
    cy.contains("Admin").should("be.visible");
    cy.contains("Library: Thibaut's Library").should("be.visible");
    cy.contains("Living Room (1 items)").should("be.visible");
    cy.contains("Blade Runner").should("be.visible");
    cy.contains("Make VIP").should("be.visible");
    cy.contains("Delete user").should("be.visible");
  });
});
