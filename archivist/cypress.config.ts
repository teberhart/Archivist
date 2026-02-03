import { defineConfig } from "cypress";
import { execSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";

const envFiles = [".env", ".env.local"];

for (const file of envFiles) {
  dotenv.config({ path: path.join(process.cwd(), file) });
}

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    supportFile: "cypress/support/e2e.ts",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      on("task", {
        "db:seed"() {
          execSync("node prisma/seed.cjs", {
            stdio: "inherit",
            env: process.env,
            cwd: process.cwd(),
          });
          return null;
        },
      });

      return config;
    },
  },
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    supportFile: "cypress/support/component.ts",
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
  },
});
