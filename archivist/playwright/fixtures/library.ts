import type { Page } from "@playwright/test";

export const getShelfItemCount = async (page: Page, shelfName: string) => {
  const shelfSection = page.locator("section", {
    has: page.getByRole("heading", { name: shelfName }),
  });
  return await shelfSection.locator("[data-cy='product-edit-button']").count();
};
