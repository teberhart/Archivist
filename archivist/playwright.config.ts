import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "./playwright/utils/env";
import { resolveProjectRoot } from "./playwright/utils/project-root";

loadEnv(resolveProjectRoot());

const storageStatePath = path.join(
  process.cwd(),
  "playwright",
  ".auth",
  "user.json",
);

export default defineConfig({
  testDir: "./playwright/e2e",
  outputDir: "playwright/test-results",
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    storageState: storageStatePath,
  },
  globalSetup: "./playwright/global-setup",
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
  ],
});
