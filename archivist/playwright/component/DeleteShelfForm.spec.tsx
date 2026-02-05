import { test, expect } from "@playwright/experimental-ct-react";
import DeleteShelfForm from "@/app/library/DeleteShelfForm";

test("renders the shelf id and delete button", async ({ mount }) => {
  const component = await mount(
    <DeleteShelfForm shelfId="shelf-test" action={async () => {}} />,
  );

  await expect(component.locator("input[name='shelfId']")).toHaveValue(
    "shelf-test",
  );
  await expect(component.getByRole("button", { name: "Delete" })).toBeVisible();
});
