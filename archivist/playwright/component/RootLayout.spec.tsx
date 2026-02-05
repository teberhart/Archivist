import { test, expect } from "@playwright/experimental-ct-react";
import RootLayout from "@/app/layout";


test("renders children", async ({ mount }) => {
  const component = await mount(
    <RootLayout>
      <div>Layout content</div>
    </RootLayout>,
  );

  await expect(component.getByText("Layout content")).toBeVisible();
});
