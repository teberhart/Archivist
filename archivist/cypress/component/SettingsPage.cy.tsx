import type { ReactElement } from "react";
import SettingsPage from "../../app/settings/page";
import { __setSession } from "../mocks/auth";
import {
  __setLibraryResult,
  __setUserResult,
  __setUserSettingsResult,
} from "../mocks/prisma";

const mountAsync = (element: Promise<ReactElement>) => {
  cy.wrap(element).then((resolved) => {
    cy.mount(resolved as ReactElement);
  });
};

describe("SettingsPage", () => {
  beforeEach(() => {
    __setSession({ user: { id: "user-1" } });
    __setUserResult({
      name: "Thibaut",
      email: "thibaut@example.com",
      status: "STANDARD",
    });
    __setLibraryResult({ name: "Thibaut's Library" });
    __setUserSettingsResult({ showShelfPulse: true });
  });

  it("renders account, library, preferences, and security sections", () => {
    mountAsync(SettingsPage({ searchParams: Promise.resolve({}) }));

    cy.contains("Settings").should("be.visible");
    cy.contains("Profile").should("be.visible");
    cy.contains("Library").should("be.visible");
    cy.contains("Preferences").should("be.visible");
    cy.contains("Security").should("be.visible");

    cy.get("input[name='name']").should("have.value", "Thibaut");
    cy.get("input[name='email']").should("have.value", "thibaut@example.com");
    cy.get("input[name='libraryName']").should(
      "have.value",
      "Thibaut's Library",
    );
    cy.get("input[name='showShelfPulse']").should("be.checked");
  });

  it("shows status messages", () => {
    mountAsync(
      SettingsPage({ searchParams: Promise.resolve({ status: "prefs-updated" }) }),
    );

    cy.contains("Preferences saved.").should("be.visible");
  });
});
