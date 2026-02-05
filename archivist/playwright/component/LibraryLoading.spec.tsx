import { test, expect } from "@playwright/experimental-ct-react";
import LibraryLoading from "@/app/library/loading";

test("renders loading placeholders", async ({ mount }) => {
  const component = await mount(<LibraryLoading />);

  const washCount = await component.locator(".bg-wash").count();
  expect(washCount).toBeGreaterThanOrEqual(8);
  await expect(component.locator(".rounded-3xl.border")).toHaveCount(2);
});
