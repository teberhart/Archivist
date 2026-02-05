import fs from "node:fs";
import path from "node:path";

const findProjectRoot = (startDir: string) => {
  let current = path.resolve(startDir);

  while (true) {
    const seedPath = path.join(current, "prisma", "seed.cjs");
    if (fs.existsSync(seedPath)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
};

export const resolveProjectRoot = () => {
  return (
    findProjectRoot(process.cwd()) ??
    findProjectRoot(__dirname) ??
    path.resolve(__dirname, "..", "..")
  );
};
