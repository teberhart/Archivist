import type { Page } from "@playwright/test";
import { selectors } from "./selectors";
import { testUser } from "../utils/test-credentials";

type LoginInput = {
  email: string;
  password: string;
};

type AddItemInput = {
  shelfName: string;
  name: string;
  artist: string;
  type: string;
  year: string;
};

export const login = async (page: Page, user: LoginInput = testUser) => {
  await page.goto("/login");
  const emailInput = page.getByLabel(selectors.login.emailLabel);

  let inputVisible = false;
  try {
    inputVisible = await emailInput.isVisible({ timeout: 3000 });
  } catch {
    inputVisible = false;
  }

  if (!inputVisible) {
    await page.waitForURL((url) => !url.pathname.endsWith("/login"));
    return;
  }

  await emailInput.fill(user.email);
  await page.getByLabel(selectors.login.passwordLabel).fill(user.password);
  await page.getByRole("button", { name: selectors.login.submitButton }).click();
  await page.waitForURL((url) => !url.pathname.endsWith("/login"));
};

export const createShelf = async (page: Page, name: string) => {
  await page.goto("/library/add-shelf");
  await page.getByLabel(selectors.addShelf.nameLabel).fill(name);
  await page
    .getByRole("button", { name: selectors.addShelf.submitButton })
    .click();
  await page.waitForURL(/\/library/);
};

export const addItem = async (page: Page, item: AddItemInput) => {
  const shelfCard = page.locator("section", {
    has: page.getByRole("heading", { name: item.shelfName }),
  });

  await shelfCard
    .getByRole("button", { name: selectors.shelfCard.addItemButton })
    .click();
  await shelfCard.getByLabel(selectors.item.nameLabel).fill(item.name);
  await shelfCard.getByLabel(selectors.item.artistLabel).fill(item.artist);
  await shelfCard.getByLabel(selectors.item.typeLabel).selectOption(item.type);
  await shelfCard.getByLabel(selectors.item.yearLabel).fill(item.year);
  await shelfCard
    .getByRole("button", { name: selectors.shelfCard.saveItemButton })
    .click();
  await page.waitForURL(/status=item-created/);
};
