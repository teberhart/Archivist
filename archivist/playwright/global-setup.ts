import { chromium, type FullConfig } from "@playwright/test";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { loadEnv } from "./utils/env";
import { resolveProjectRoot } from "./utils/project-root";
import { testUser } from "./utils/test-credentials";

const storageStatePath = path.join(
  process.cwd(),
  "playwright",
  ".auth",
  "user.json",
);

const resolveBaseUrl = (config: FullConfig) => {
  const projectBaseUrl = config.projects[0]?.use?.baseURL;
  return typeof projectBaseUrl === "string"
    ? projectBaseUrl
    : "http://localhost:3000";
};

async function globalSetup(config: FullConfig) {
  const projectRoot = resolveProjectRoot();
  loadEnv(projectRoot);

  execSync("node prisma/seed.cjs", {
    stdio: "inherit",
    env: process.env,
    cwd: projectRoot,
  });

  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  const baseUrl = resolveBaseUrl(config);
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(new URL("/login", baseUrl).toString(), {
    waitUntil: "networkidle",
  });
  await page.getByLabel("Email address").fill(testUser.email);
  await page.getByLabel("Password").fill(testUser.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(new URL("/", baseUrl).toString());

  await page.context().storageState({ path: storageStatePath });
  await browser.close();
}

export default globalSetup;
