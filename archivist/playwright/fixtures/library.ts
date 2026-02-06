import { expect, type Page } from "@playwright/test";

type ShelfCountOptions = {
  minCount?: number;
  timeout?: number;
};

export const getShelfItemCount = async (
  page: Page,
  shelfName: string,
  options: ShelfCountOptions = {},
) => {
  const { minCount = 0, timeout = 5000 } = options;
  const shelfSection = page.locator("section", {
    has: page.getByRole("heading", { name: shelfName }),
  });
  await shelfSection.waitFor({ state: "visible", timeout });

  const items = shelfSection.locator("[data-cy='product-edit-button']");
  if (minCount > 0) {
    await expect
      .poll(() => items.count(), { timeout })
      .toBeGreaterThanOrEqual(minCount);
  }
  return await items.count();
};
