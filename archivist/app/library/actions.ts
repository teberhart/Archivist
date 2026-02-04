"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isValidShelfName } from "@/app/library/shelfValidation";
import {
  isValidProductName,
  isValidProductType,
  isValidProductYear,
} from "@/app/library/productValidation";
import {
  parseImportText,
  type ImportParseResult,
} from "@/app/library/importParser";
import { getProductTypesSet } from "@/app/library/productTypes";

export async function createShelf(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawName = formData.get("name");
  if (typeof rawName !== "string") {
    redirect("/library/add-shelf?status=missing");
  }

  const name = rawName.trim();
  if (!name) {
    redirect("/library/add-shelf?status=missing");
  }
  if (!isValidShelfName(name)) {
    redirect("/library/add-shelf?status=invalid");
  }

  const library = await prisma.library.findUnique({
    where: { userId },
  });

  if (!library) {
    redirect("/library/add-shelf?status=nolibrary");
  }

  const existing = await prisma.shelf.findFirst({
    where: {
      libraryId: library.id,
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });

  if (existing) {
    redirect("/library/add-shelf?status=duplicate");
  }

  await prisma.shelf.create({
    data: {
      name,
      libraryId: library.id,
    },
  });

  revalidatePath("/library");
  redirect("/library?status=created");
}

export async function deleteShelf(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawId = formData.get("shelfId");
  if (typeof rawId !== "string") {
    redirect("/library?status=delete-missing");
  }

  const shelfId = rawId.trim();
  if (!shelfId) {
    redirect("/library?status=delete-missing");
  }

  const library = await prisma.library.findUnique({
    where: { userId },
  });

  if (!library) {
    redirect("/library?status=nolibrary");
  }

  const shelf = await prisma.shelf.findFirst({
    where: {
      id: shelfId,
      libraryId: library.id,
    },
  });

  if (!shelf) {
    redirect("/library?status=delete-missing");
  }

  await prisma.shelf.delete({
    where: { id: shelf.id },
  });

  revalidatePath("/library");
  redirect("/library?status=deleted");
}

export async function updateShelf(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawId = formData.get("shelfId");
  const rawName = formData.get("name");

  if (typeof rawId !== "string" || typeof rawName !== "string") {
    redirect("/library?status=edit-missing");
  }

  const shelfId = rawId.trim();
  const name = rawName.trim();

  if (!shelfId || !name) {
    redirect("/library?status=edit-missing");
  }

  if (!isValidShelfName(name)) {
    redirect("/library?status=edit-invalid");
  }

  const library = await prisma.library.findUnique({
    where: { userId },
  });

  if (!library) {
    redirect("/library?status=nolibrary");
  }

  const shelf = await prisma.shelf.findFirst({
    where: {
      id: shelfId,
      libraryId: library.id,
    },
  });

  if (!shelf) {
    redirect("/library?status=edit-notfound");
  }

  const existing = await prisma.shelf.findFirst({
    where: {
      libraryId: library.id,
      name: {
        equals: name,
        mode: "insensitive",
      },
      NOT: {
        id: shelf.id,
      },
    },
  });

  if (existing) {
    redirect("/library?status=edit-duplicate");
  }

  await prisma.shelf.update({
    where: { id: shelf.id },
    data: { name },
  });

  revalidatePath("/library");
  redirect("/library?status=updated");
}

export async function createProduct(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawShelfId = formData.get("shelfId");
  const rawName = formData.get("name");
  const rawType = formData.get("type");
  const rawYear = formData.get("year");

  if (
    typeof rawShelfId !== "string" ||
    typeof rawName !== "string" ||
    typeof rawType !== "string" ||
    typeof rawYear !== "string"
  ) {
    redirect("/library?status=item-missing");
  }

  const shelfId = rawShelfId.trim();
  const name = rawName.trim();
  const type = rawType.trim();
  const year = Number.parseInt(rawYear, 10);

  if (!shelfId || !name || !type || Number.isNaN(year)) {
    redirect("/library?status=item-missing");
  }

  const allowedTypes = await getProductTypesSet();
  if (!allowedTypes.has(type)) {
    redirect("/library?status=item-type-invalid");
  }

  if (!isValidProductName(name) || !isValidProductType(type)) {
    redirect("/library?status=item-invalid");
  }

  if (!isValidProductYear(year)) {
    redirect("/library?status=item-year");
  }

  const library = await prisma.library.findUnique({
    where: { userId },
  });

  if (!library) {
    redirect("/library?status=nolibrary");
  }

  const shelf = await prisma.shelf.findFirst({
    where: {
      id: shelfId,
      libraryId: library.id,
    },
  });

  if (!shelf) {
    redirect("/library?status=item-shelf");
  }

  await prisma.product.create({
    data: {
      name,
      type,
      year,
      shelfId: shelf.id,
    },
  });

  revalidatePath("/library");
  redirect("/library?status=item-created");
}

export async function updateProduct(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawProductId = formData.get("productId");
  const rawName = formData.get("name");
  const rawType = formData.get("type");
  const rawYear = formData.get("year");

  if (
    typeof rawProductId !== "string" ||
    typeof rawName !== "string" ||
    typeof rawType !== "string" ||
    typeof rawYear !== "string"
  ) {
    redirect("/library?status=item-edit-missing");
  }

  const productId = rawProductId.trim();
  const name = rawName.trim();
  const type = rawType.trim();
  const year = Number.parseInt(rawYear, 10);

  if (!productId || !name || !type || Number.isNaN(year)) {
    redirect("/library?status=item-edit-missing");
  }

  if (!isValidProductName(name) || !isValidProductType(type)) {
    redirect("/library?status=item-edit-invalid");
  }

  if (!isValidProductYear(year)) {
    redirect("/library?status=item-edit-year");
  }

  const library = await prisma.library.findUnique({
    where: { userId },
  });

  if (!library) {
    redirect("/library?status=nolibrary");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shelf: {
        libraryId: library.id,
      },
    },
  });

  if (!product) {
    redirect("/library?status=item-edit-notfound");
  }

  const allowedTypes = await getProductTypesSet();
  if (!allowedTypes.has(type) && type !== product.type) {
    redirect("/library?status=item-edit-type-invalid");
  }

  await prisma.product.update({
    where: { id: product.id },
    data: {
      name,
      type,
      year,
    },
  });

  revalidatePath("/library");
  redirect("/library?status=item-updated");
}

export async function deleteProduct(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const rawProductId = formData.get("productId");
  if (typeof rawProductId !== "string") {
    redirect("/library?status=item-delete-missing");
  }

  const productId = rawProductId.trim();
  if (!productId) {
    redirect("/library?status=item-delete-missing");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shelf: {
        library: {
          userId,
        },
      },
    },
  });

  if (!product) {
    redirect("/library?status=item-delete-notfound");
  }

  await prisma.product.delete({
    where: { id: product.id },
  });

  revalidatePath("/library");
  redirect("/library?status=item-deleted");
}

export type ImportProductsState = {
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

const MAX_IMPORT_BYTES = 1024 * 1024;

function createImportError(message: string, errors?: string[]): ImportProductsState {
  return {
    status: "error",
    message,
    errors,
  };
}

export async function importProducts(
  _prevState: ImportProductsState,
  formData: FormData,
): Promise<ImportProductsState> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return createImportError("Please upload a JSON file.");
  }

  if (file.size > MAX_IMPORT_BYTES) {
    return createImportError("The JSON file is too large (max 1MB).");
  }

  const isJson =
    file.type === "application/json" ||
    file.name.toLowerCase().endsWith(".json");
  if (!isJson) {
    return createImportError("The upload must be a .json file.");
  }

  const text = await file.text();
  if (!text.trim()) {
    return createImportError("The JSON file is empty.");
  }

  const parsed: ImportParseResult = parseImportText(text);
  if (parsed.shelves.length === 0) {
    return createImportError(
      "No valid shelves or products were found in the file.",
      parsed.errors,
    );
  }

  const allowedTypes = await getProductTypesSet();

  const library = await prisma.library.findUnique({
    where: { userId },
    include: { shelves: { include: { products: true } } },
  });

  if (!library) {
    return createImportError("No library found for your account.");
  }

  const shelfMap = new Map<
    string,
    {
      id: string;
      name: string;
      products: { id: string; name: string }[];
    }
  >();

  library.shelves.forEach((shelf) => {
    shelfMap.set(shelf.name.toLowerCase(), {
      id: shelf.id,
      name: shelf.name,
      products: shelf.products.map((product) => ({
        id: product.id,
        name: product.name,
      })),
    });
  });

  let shelvesCreated = 0;
  let shelvesMatched = 0;
  let productsCreated = 0;
  let productsUpdated = 0;

  const errors: string[] = [...parsed.errors];

  for (const shelfInput of parsed.shelves) {
    const normalizedShelf = shelfInput.name.toLowerCase();
    let shelf = shelfMap.get(normalizedShelf);

    if (!shelf) {
      try {
        const created = await prisma.shelf.create({
          data: {
            name: shelfInput.name,
            libraryId: library.id,
          },
        });
        shelf = {
          id: created.id,
          name: created.name,
          products: [],
        };
        shelfMap.set(normalizedShelf, shelf);
        shelvesCreated += 1;
      } catch (error) {
        errors.push(`Shelf "${shelfInput.name}" could not be created.`);
        continue;
      }
    } else {
      shelvesMatched += 1;
    }

    const productMap = new Map<string, { id: string; name: string }>();
    shelf.products.forEach((product) => {
      productMap.set(product.name.toLowerCase(), product);
    });

    for (const productInput of shelfInput.products) {
      if (!allowedTypes.has(productInput.type)) {
        errors.push(
          `Product "${productInput.name}" on shelf "${shelfInput.name}" has an unsupported type.`,
        );
        continue;
      }

      const normalizedProduct = productInput.name.toLowerCase();
      const existing = productMap.get(normalizedProduct);

      if (existing) {
        try {
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: productInput.name,
              type: productInput.type,
              year: productInput.year,
            },
          });
          productsUpdated += 1;
        } catch (error) {
          errors.push(
            `Product "${productInput.name}" on shelf "${shelfInput.name}" could not be updated.`,
          );
        }
      } else {
        try {
          const created = await prisma.product.create({
            data: {
              name: productInput.name,
              type: productInput.type,
              year: productInput.year,
              shelfId: shelf.id,
            },
          });
          productMap.set(normalizedProduct, {
            id: created.id,
            name: created.name,
          });
          productsCreated += 1;
        } catch (error) {
          errors.push(
            `Product "${productInput.name}" on shelf "${shelfInput.name}" could not be created.`,
          );
        }
      }
    }
  }

  revalidatePath("/library");
  revalidatePath("/");

  const summary = {
    shelvesCreated,
    shelvesMatched,
    productsCreated,
    productsUpdated,
  };

  if (errors.length > 0) {
    return {
      status: "partial",
      message: "Import completed with some issues.",
      summary,
      errors,
    };
  }

  return {
    status: "success",
    message: "Import completed successfully.",
    summary,
  };
}
