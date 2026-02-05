import { test, expect } from "@playwright/experimental-ct-react";
import ShelfCard from "@/app/library/ShelfCard";

const shelf = {
  id: "shelf-1",
  name: "Living Room",
  products: [
    {
      id: "product-1",
      name: "Blade Runner",
      artist: "Ridley Scott",
      type: "Tape",
      year: 1982,
    },
  ],
};

const productTypes = ["Tape", "CD", "DVD", "Vinyl"];

const noop = async () => {};

test.describe("ShelfCard", () => {
  test("allows editing a shelf name", async ({ mount }) => {
    let updateCalls = 0;
    const updateShelf = async () => {
      updateCalls += 1;
    };

    const component = await mount(
      <ShelfCard
        shelf={shelf}
        index={0}
        productTypes={productTypes}
        updateShelf={updateShelf}
        createProduct={noop}
        updateProduct={noop}
        lendProduct={noop}
        returnProduct={noop}
        deleteProduct={noop}
        deleteShelf={noop}
      />,
    );

    await expect(component.getByText("Ridley Scott")).toBeVisible();
    await component.getByRole("button", { name: "Edit" }).click();
    const input = component.locator("[data-cy='shelf-edit-input']");
    await expect(input).toBeVisible();
    await input.fill("Studio Shelf");
    await component.getByRole("button", { name: "Save" }).click();

    expect(updateCalls).toBe(1);
  });

  test("shows the add item form and submits", async ({ mount }) => {
    let createCalls = 0;
    const createProduct = async () => {
      createCalls += 1;
    };

    const component = await mount(
      <ShelfCard
        shelf={shelf}
        index={0}
        productTypes={productTypes}
        updateShelf={noop}
        createProduct={createProduct}
        updateProduct={noop}
        lendProduct={noop}
        returnProduct={noop}
        deleteProduct={noop}
        deleteShelf={noop}
      />,
    );

    await component.getByRole("button", { name: "Add item" }).click();
    await component.locator("input[name='name']").fill("New Item");
    await component.locator("input[name='artist']").fill("New Artist");
    await component.locator("select[name='type']").selectOption("DVD");
    await component.locator("input[name='year']").fill("2001");
    await component.getByRole("button", { name: "Save item" }).click();

    expect(createCalls).toBe(1);
  });

  test("opens and closes the product edit modal", async ({ mount, page }) => {
    let updateCalls = 0;
    const updateProduct = async () => {
      updateCalls += 1;
    };

    await mount(
      <ShelfCard
        shelf={shelf}
        index={0}
        productTypes={productTypes}
        updateShelf={noop}
        createProduct={noop}
        updateProduct={updateProduct}
        lendProduct={noop}
        returnProduct={noop}
        deleteProduct={noop}
        deleteShelf={noop}
      />,
    );

    await page.locator("[data-cy='product-edit-button']").click();
    const modal = page.locator("[data-cy='product-edit-modal']");
    await expect(modal).toBeVisible();
    await modal.locator("input[name='name']").fill("Blade Runner 2049");
    await modal.locator("input[name='artist']").fill("Denis Villeneuve");
    await modal.getByRole("button", { name: "Save changes" }).click();

    expect(updateCalls).toBe(1);

    await page.locator("[data-cy='product-edit-button']").click();
    await expect(modal).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
  });

  test("allows lending and returning from the modal", async ({ mount, page }) => {
    let lendCalls = 0;
    let returnCalls = 0;
    const lendProduct = async () => {
      lendCalls += 1;
    };
    const returnProduct = async () => {
      returnCalls += 1;
    };

    await mount(
      <ShelfCard
        shelf={shelf}
        index={0}
        productTypes={productTypes}
        updateShelf={noop}
        createProduct={noop}
        updateProduct={noop}
        lendProduct={lendProduct}
        returnProduct={returnProduct}
        deleteProduct={noop}
        deleteShelf={noop}
      />,
    );

    await page.locator("[data-cy='product-card']").click();
    const modal = page.locator("[data-cy='product-edit-modal']");
    await expect(modal).toBeVisible();
    await modal.locator("input[name='borrowerName']").fill("Alex");
    await modal.locator("input[name='dueAt']").fill("2026-02-10");
    await modal
      .locator("textarea[name='borrowerNotes']")
      .fill("Pick up next weekend.");
    await modal.locator("[data-cy='product-lend-button']").click();

    expect(lendCalls).toBe(1);

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

    await mount(
      <ShelfCard
        shelf={loanedShelf}
        index={0}
        productTypes={productTypes}
        updateShelf={noop}
        createProduct={noop}
        updateProduct={noop}
        lendProduct={lendProduct}
        returnProduct={returnProduct}
        deleteProduct={noop}
        deleteShelf={noop}
      />,
    );

    await expect(page.getByText("Lent to Alex")).toBeVisible();
    await expect(page.getByText(/Due Feb/)).toBeVisible();
    await page.locator("[data-cy='product-card']").click();
    await expect(page.getByText("Lending history")).toBeVisible();
    await expect(page.getByText("Sam")).toBeVisible();
    await page.locator("[data-cy='product-return-button']").click();

    expect(returnCalls).toBe(1);
  });
});
