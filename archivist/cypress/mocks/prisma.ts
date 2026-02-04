let libraryResult: any = null;
let libraryError: Error | null = null;
let productResults: any[] = [];
let productCount = 0;
let weeklyProductCount = 0;
let topShelf: { name: string; _count: { products: number } } | null = null;

export function __setLibraryResult(result: any) {
  libraryResult = result;
  libraryError = null;
}

export function __setLibraryError(error: Error | null) {
  libraryError = error;
}

export function __setProductResults(results: any[]) {
  productResults = results;
  productCount = results.length;
  weeklyProductCount = results.length;
}

export function __setProductCount(count: number) {
  productCount = count;
}

export function __setWeeklyProductCount(count: number) {
  weeklyProductCount = count;
}

export function __setTopShelf(result: { name: string; _count: { products: number } } | null) {
  topShelf = result;
}

export const prisma = {
  library: {
    findUnique: async () => {
      if (libraryError) {
        throw libraryError;
      }
      return libraryResult;
    },
  },
  product: {
    findMany: async () => productResults,
    count: async (args?: { where?: { createdAt?: { gte?: Date } } }) => {
      if (args?.where?.createdAt?.gte) {
        return weeklyProductCount;
      }
      return productCount;
    },
  },
  user: {
    create: async () => ({}),
  },
  shelf: {
    findFirst: async () => topShelf,
    create: async () => ({}),
  },
};
