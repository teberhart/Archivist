import { prisma } from "@/lib/prisma";

export async function getProductTypes(): Promise<string[]> {
  const types = await prisma.productType.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });

  return types.map((type) => type.name);
}

export async function getProductTypesSet(): Promise<Set<string>> {
  const types = await getProductTypes();
  return new Set(types);
}
