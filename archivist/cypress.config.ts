import { defineConfig } from "cypress";
import { execSync } from "node:child_process";
import path from "node:path";
import dotenv from "dotenv";
import react from "@vitejs/plugin-react";

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
      framework: "react",
      bundler: "vite",
      viteConfig: {
        plugins: [react()],
        resolve: {
          alias: [
            {
              find: "@/auth",
              replacement: path.resolve(__dirname, "cypress/mocks/auth.ts"),
            },
            {
              find: "@/lib/prisma",
              replacement: path.resolve(__dirname, "cypress/mocks/prisma.ts"),
            },
            {
              find: "@/app/library/actions",
              replacement: path.resolve(
                __dirname,
                "cypress/mocks/library-actions.ts",
              ),
            },
            {
              find: "@/app/admin/actions",
              replacement: path.resolve(
                __dirname,
                "cypress/mocks/admin-actions.ts",
              ),
            },
            {
              find: "next/link",
              replacement: path.resolve(__dirname, "cypress/mocks/next-link.tsx"),
            },
            {
              find: "next/image",
              replacement: path.resolve(
                __dirname,
                "cypress/mocks/next-image.tsx",
              ),
            },
            {
              find: "next/navigation",
              replacement: path.resolve(
                __dirname,
                "cypress/mocks/next-navigation.ts",
              ),
            },
            {
              find: "next/font/google",
              replacement: path.resolve(
                __dirname,
                "cypress/mocks/next-font-google.ts",
              ),
            },
            {
              find: "next-auth",
              replacement: path.resolve(__dirname, "cypress/mocks/next-auth.ts"),
            },
            {
              find: "next-auth/providers/credentials",
              replacement: path.resolve(
                __dirname,
                "cypress/mocks/next-auth-credentials.ts",
              ),
            },
            {
              find: "@auth/prisma-adapter",
              replacement: path.resolve(
                __dirname,
                "cypress/mocks/prisma-adapter.ts",
              ),
            },
            {
              find: "@prisma/client",
              replacement: path.resolve(
                __dirname,
                "cypress/mocks/prisma-client.ts",
              ),
            },
            {
              find: "bcrypt",
              replacement: path.resolve(__dirname, "cypress/mocks/bcrypt.ts"),
            },
            { find: "@", replacement: path.resolve(__dirname) },
          ],
        },
      },
    },
    supportFile: "cypress/support/component.ts",
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
  },
});
