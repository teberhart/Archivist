import { execSync } from "node:child_process";
import { loadEnv } from "../utils/env";
import { resolveProjectRoot } from "../utils/project-root";

export const seedDatabase = () => {
  const projectRoot = resolveProjectRoot();
  loadEnv(projectRoot);
  execSync("node prisma/seed.cjs", {
    stdio: "inherit",
    env: process.env,
    cwd: projectRoot,
  });
};
