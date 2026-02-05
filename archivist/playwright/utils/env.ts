import path from "node:path";
import dotenv from "dotenv";

const envFiles = [".env", ".env.local"];

export const loadEnv = () => {
  for (const file of envFiles) {
    dotenv.config({ path: path.join(process.cwd(), file) });
  }
};
