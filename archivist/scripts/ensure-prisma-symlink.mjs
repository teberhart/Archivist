import {
  existsSync,
  lstatSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  unlinkSync,
} from "fs";
import { dirname, join } from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const clientPackage = require.resolve("@prisma/client/package.json", {
  paths: [process.cwd()],
});
const clientDir = dirname(clientPackage);
const prismaDir = join(clientDir, "..", "..", ".prisma");
const target = join(clientDir, ".prisma");

if (!existsSync(clientDir)) {
  console.error("@prisma/client is not installed.");
  process.exit(1);
}

if (!existsSync(prismaDir)) {
  console.error(
    "Generated Prisma client not found. Run `pnpm prisma generate` first."
  );
  process.exit(1);
}

if (existsSync(target)) {
  const stat = lstatSync(target);
  if (stat.isSymbolicLink()) {
    const linkTarget = readlinkSync(target);
    if (linkTarget === prismaDir) {
      process.exit(0);
    }
    unlinkSync(target);
  } else if (stat.isDirectory()) {
    process.exit(0);
  }
}

symlinkSync(prismaDir, target, "junction");
