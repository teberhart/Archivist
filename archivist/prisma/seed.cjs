const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcrypt");

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("123456", 12);

  await prisma.user.upsert({
    where: { email: "thibaut.eberhart@gmail.com" },
    update: {},
    create: {
      email: "thibaut.eberhart@gmail.com",
      name: "Thibaut Eberhart",
      password,
      library: {
        create: {
          name: "Thibaut's Library",
          shelves: {
            create: [
              { name: "Living Room" },
              { name: "Studio Shelf" },
            ],
          },
        },
      },
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
