import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import path from "node:path";
import dotenv from "dotenv";

const envFiles = [".env", ".env.local"];

for (const file of envFiles) {
  dotenv.config({ path: path.join(process.cwd(), file) });
}

const args = process.argv.slice(2);

const getArg = (flag) => {
  const index = args.indexOf(flag);
  if (index === -1) {
    return null;
  }
  return args[index + 1] ?? null;
};

const email = getArg("--email") ?? process.env.EMAIL ?? "";
const libraryName =
  getArg("--library") ?? process.env.LIBRARY_NAME ?? "";

if (!email || !libraryName) {
  console.error(
    "Usage: node scripts/create-library-for-user.mjs --email user@example.com --library \"My Library\"",
  );
  console.error("Or set EMAIL and LIBRARY_NAME environment variables.");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

try {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, library: { select: { id: true } } },
  });

  if (!user) {
    console.error(`No user found for email: ${email}`);
    process.exit(1);
  }

  if (user.library) {
    console.log(`User already has a library. User ID: ${user.id}`);
    process.exit(0);
  }

  await prisma.library.create({
    data: {
      name: libraryName,
      userId: user.id,
    },
  });

  console.log(`Created library "${libraryName}" for ${email}.`);
} catch (error) {
  console.error("Failed to create library:", error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
