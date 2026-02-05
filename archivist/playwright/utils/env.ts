import path from "node:path";
import dotenv from "dotenv";

const envFiles = [".env", ".env.local"];

export const loadEnv = (baseDir: string = process.cwd()) => {
  for (const file of envFiles) {
    dotenv.config({ path: path.join(baseDir, file) });
  }
};
