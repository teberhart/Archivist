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
    update: {
      name: "Thibaut Eberhart",
      library: {
        upsert: {
          create: {
            name: "Thibaut's Library",
            shelves: {
              create: [
                {
                  name: "Living Room",
                  products: {
                    create: [
                      { name: "Blade Runner", type: "VHS", year: 1982 },
                      { name: "Kind of Blue", type: "Vinyl", year: 1959 },
                    ],
                  },
                },
                {
                  name: "Studio Shelf",
                  products: {
                    create: [
                      { name: "In Rainbows", type: "CD", year: 2007 },
                      { name: "The Matrix", type: "Blu-ray", year: 1999 },
                    ],
                  },
                },
              ],
            },
          },
          update: {
            name: "Thibaut's Library",
            shelves: {
              deleteMany: {},
              create: [
                {
                  name: "Living Room",
                  products: {
                    create: [
                      { name: "Blade Runner", type: "VHS", year: 1982 },
                      { name: "Kind of Blue", type: "Vinyl", year: 1959 },
                    ],
                  },
                },
                {
                  name: "Studio Shelf",
                  products: {
                    create: [
                      { name: "In Rainbows", type: "CD", year: 2007 },
                      { name: "The Matrix", type: "Blu-ray", year: 1999 },
                    ],
                  },
                },
              ],
            },
          },
        },
      },
    },
    create: {
      email: "thibaut.eberhart@gmail.com",
      name: "Thibaut Eberhart",
      password,
      library: {
        create: {
          name: "Thibaut's Library",
          shelves: {
            create: [
              {
                name: "Living Room",
                products: {
                  create: [
                    { name: "Blade Runner", type: "VHS", year: 1982 },
                    { name: "Kind of Blue", type: "Vinyl", year: 1959 },
                  ],
                },
              },
              {
                name: "Studio Shelf",
                products: {
                  create: [
                    { name: "In Rainbows", type: "CD", year: 2007 },
                    { name: "The Matrix", type: "Blu-ray", year: 1999 },
                  ],
                },
              },
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
