type ImportProductsState = {
  status: "idle" | "success" | "partial" | "error";
  message: string;
  summary?: {
    shelvesCreated: number;
    shelvesMatched: number;
    productsCreated: number;
    productsUpdated: number;
  };
  errors?: string[];
};

type ImportProductsHandler = (
  prevState: ImportProductsState,
  formData: FormData,
) => Promise<ImportProductsState> | ImportProductsState;

let importProductsHandler: ImportProductsHandler = async () => ({
  status: "success",
  message: "Import complete.",
  summary: {
    shelvesCreated: 0,
    shelvesMatched: 0,
    productsCreated: 0,
    productsUpdated: 0,
  },
});

export function __setImportProductsHandler(handler: ImportProductsHandler) {
  importProductsHandler = handler;
}

export async function importProducts(
  prevState: ImportProductsState,
  formData: FormData,
): Promise<ImportProductsState> {
  return await importProductsHandler(prevState, formData);
}

export async function createShelf(_formData: FormData) {
  return undefined;
}

export async function deleteShelf(_formData: FormData) {
  return undefined;
}

export async function updateShelf(_formData: FormData) {
  return undefined;
}

export async function createProduct(_formData: FormData) {
  return undefined;
}

export async function updateProduct(_formData: FormData) {
  return undefined;
}

export async function deleteProduct(_formData: FormData) {
  return undefined;
}

export async function lendProduct(_formData: FormData) {
  return undefined;
}

export async function returnProduct(_formData: FormData) {
  return undefined;
}
