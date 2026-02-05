import path from "node:path";
import { defineConfig, devices } from "@playwright/experimental-ct-react";
import react from "@vitejs/plugin-react";
import { loadEnv } from "./playwright/utils/env";

loadEnv();

export default defineConfig({
  testDir: "./playwright/component",
  outputDir: "playwright/test-results",
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
  ],
  use: {
    ctPort: 3100,
  },
  ctViteConfig: {
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
          replacement: path.resolve(__dirname, "cypress/mocks/admin-actions.ts"),
        },
        {
          find: "next/link",
          replacement: path.resolve(__dirname, "cypress/mocks/next-link.tsx"),
        },
        {
          find: "next/image",
          replacement: path.resolve(__dirname, "cypress/mocks/next-image.tsx"),
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
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
});
