let libraryResult: any = null;
let libraryError: Error | null = null;
let productResults: any[] = [];

export function __setLibraryResult(result: any) {
  libraryResult = result;
  libraryError = null;
}

export function __setLibraryError(error: Error | null) {
  libraryError = error;
}

export function __setProductResults(results: any[]) {
  productResults = results;
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
  },
  user: {
    create: async () => ({}),
  },
  shelf: {
    findFirst: async () => null,
    create: async () => ({}),
  },
};
