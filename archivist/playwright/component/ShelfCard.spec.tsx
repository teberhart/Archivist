import { test, expect } from "@playwright/experimental-ct-react";
import ShelfCard from "@/app/library/ShelfCard";

const noop = async () => {};

const shelf = {
  id: "shelf-1",
  name: "Living Room",
  products: [],
};

test("renders shelf name and add item form", async ({ mount }) => {
  const component = await mount(
    <ShelfCard
      shelf={shelf}
      index={0}
      productTypes={["Vinyl"]}
      updateShelf={noop}
      createProduct={noop}
      updateProduct={noop}
      lendProduct={noop}
      returnProduct={noop}
      deleteProduct={noop}
      deleteShelf={noop}
    />,
  );

  await expect(
    component.getByRole("heading", { name: "Living Room" }),
  ).toBeVisible();

  await component.getByRole("button", { name: "Add item" }).click();
  await expect(component.getByLabel("Item name")).toBeVisible();
});
