import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { ShelfPulseData } from "@/app/home/types";

const EMPTY_DATA: Omit<ShelfPulseData, "status"> = {
  totalItems: 0,
  itemsAddedLast7Days: 0,
  mostActiveShelfName: null,
  mostActiveShelfCount: 0,
};

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

export async function getShelfPulseData(): Promise<ShelfPulseData> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return {
      status: "logged-out",
      ...EMPTY_DATA,
    };
  }

  try {
    const weekStart = new Date(Date.now() - WEEK_IN_MS);

    const [totalItems, itemsAddedLast7Days, topShelf] = await Promise.all([
      prisma.product.count({
        where: {
          shelf: {
            library: {
              userId,
            },
          },
        },
      }),
      prisma.product.count({
        where: {
          shelf: {
            library: {
              userId,
            },
          },
          createdAt: {
            gte: weekStart,
          },
        },
      }),
      prisma.shelf.findFirst({
        where: {
          library: {
            userId,
          },
        },
        select: {
          name: true,
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: [
          {
            products: {
              _count: "desc",
            },
          },
          { name: "asc" },
        ],
      }),
    ]);

    const mostActiveShelfName = topShelf?.name ?? null;
    const mostActiveShelfCount = topShelf?._count.products ?? 0;
    const status = totalItems > 0 ? "ready" : "empty";

    return {
      status,
      totalItems,
      itemsAddedLast7Days,
      mostActiveShelfName,
      mostActiveShelfCount,
    };
  } catch (error) {
    console.error(error);
    return {
      status: "error",
      ...EMPTY_DATA,
    };
  }
}
