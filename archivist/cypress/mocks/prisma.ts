let libraryResult: any = null;
let libraryError: Error | null = null;
let productResults: any[] = [];
let productCount = 0;
let weeklyProductCount = 0;
let topShelf: { name: string; _count: { products: number } } | null = null;
let userResult: { name?: string | null; email?: string | null; password?: string | null } | null =
  null;
let userSettingsResult: { showShelfPulse: boolean } | null = null;
let userList: Array<{
  id: string;
  name?: string | null;
  email?: string | null;
  status?: string;
  library?: {
    name?: string | null;
    shelves?: Array<{
      id: string;
      name: string;
      products: Array<{ id: string; name: string; type: string; year: number }>;
    }>;
  } | null;
}> = [];

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

export function __setUserResult(
  result: { name?: string | null; email?: string | null; password?: string | null } | null,
) {
  userResult = result;
}

export function __setUserSettingsResult(result: { showShelfPulse: boolean } | null) {
  userSettingsResult = result;
}

export function __setUserList(
  list: Array<{
    id: string;
    name?: string | null;
    email?: string | null;
    status?: string;
    library?: {
      name?: string | null;
      shelves?: Array<{
        id: string;
        name: string;
        products: Array<{ id: string; name: string; type: string; year: number }>;
      }>;
    } | null;
  }>,
) {
  userList = list;
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
    findUnique: async () => userResult,
    update: async () => userResult,
    findMany: async () => userList,
  },
  shelf: {
    findFirst: async () => topShelf,
    create: async () => ({}),
  },
  userSettings: {
    findUnique: async () => userSettingsResult,
    upsert: async () => userSettingsResult ?? { showShelfPulse: true },
  },
};
