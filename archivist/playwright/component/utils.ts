import type { ReactElement } from "react";
import type { MountResult } from "@playwright/experimental-ct-react";

type MountFn = (component: ReactElement) => Promise<MountResult>;

type ComponentFactory = Promise<ReactElement>;

export const mountAsync = async (mount: MountFn, element: ComponentFactory) => {
  const resolved = await element;
  return mount(resolved);
};
