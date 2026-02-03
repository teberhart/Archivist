import { isValidShelfName } from "@/app/library/shelfValidation";
import {
  isValidProductName,
  isValidProductType,
  isValidProductYear,
} from "@/app/library/productValidation";

export type ImportProduct = {
  name: string;
  type: string;
  year: number;
};

export type ImportShelf = {
  name: string;
  products: ImportProduct[];
};

export type ImportParseResult = {
  shelves: ImportShelf[];
  errors: string[];
};

const MAX_SHELVES = 200;
const MAX_PRODUCTS_PER_SHELF = 1000;

function getKeyValue(
  record: Record<string, unknown>,
  keys: string[],
): unknown {
  const lowerKeys = keys.map((key) => key.toLowerCase());
  const match = Object.keys(record).find((key) =>
    lowerKeys.includes(key.toLowerCase()),
  );
  return match ? record[match] : undefined;
}

function parseYear(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? Math.trunc(value) : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export function parseImportPayload(payload: unknown): ImportParseResult {
  const errors: string[] = [];
  const shelves: ImportShelf[] = [];

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {
      shelves: [],
      errors: [
        "The JSON file must be an object mapping shelf names to arrays of products.",
      ],
    };
  }

  const entries = Object.entries(payload);
  if (entries.length > MAX_SHELVES) {
    errors.push(`Too many shelves. Max allowed is ${MAX_SHELVES}.`);
  }

  entries.slice(0, MAX_SHELVES).forEach(([rawShelfName, value]) => {
    const shelfName = rawShelfName.trim();

    if (!shelfName) {
      errors.push("Shelf name cannot be empty.");
      return;
    }

    if (!isValidShelfName(shelfName)) {
      errors.push(`Shelf "${shelfName}" has an invalid name.`);
      return;
    }

    if (!Array.isArray(value)) {
      errors.push(`Shelf "${shelfName}" must map to an array of products.`);
      return;
    }

    if (value.length > MAX_PRODUCTS_PER_SHELF) {
      errors.push(
        `Shelf "${shelfName}" has too many products. Max allowed is ${MAX_PRODUCTS_PER_SHELF}.`,
      );
    }

    const seenNames = new Set<string>();
    const products: ImportProduct[] = [];

    value.slice(0, MAX_PRODUCTS_PER_SHELF).forEach((item, index) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        errors.push(
          `Shelf "${shelfName}" item ${index + 1} must be an object.`,
        );
        return;
      }

      const record = item as Record<string, unknown>;
      const rawName = getKeyValue(record, ["name", "Name"]);
      const rawType = getKeyValue(record, ["type", "Type"]);
      const rawYear = getKeyValue(record, ["year", "Year"]);

      if (typeof rawName !== "string") {
        errors.push(
          `Shelf "${shelfName}" item ${index + 1} is missing a Name.`,
        );
        return;
      }

      if (typeof rawType !== "string") {
        errors.push(
          `Shelf "${shelfName}" item ${index + 1} is missing a Type.`,
        );
        return;
      }

      const year = parseYear(rawYear);
      if (year === null) {
        errors.push(
          `Shelf "${shelfName}" item ${index + 1} is missing a valid Year.`,
        );
        return;
      }

      const name = rawName.trim();
      const type = rawType.trim();

      if (!name || !type) {
        errors.push(
          `Shelf "${shelfName}" item ${index + 1} must include Name and Type.`,
        );
        return;
      }

      if (!isValidProductName(name)) {
        errors.push(
          `Shelf "${shelfName}" item ${index + 1} has an invalid Name.`,
        );
        return;
      }

      if (!isValidProductType(type)) {
        errors.push(
          `Shelf "${shelfName}" item ${index + 1} has an invalid Type.`,
        );
        return;
      }

      if (!isValidProductYear(year)) {
        errors.push(
          `Shelf "${shelfName}" item ${index + 1} has an invalid Year.`,
        );
        return;
      }

      const normalized = name.toLowerCase();
      if (seenNames.has(normalized)) {
        errors.push(
          `Shelf "${shelfName}" item ${index + 1} duplicates "${name}".`,
        );
        return;
      }
      seenNames.add(normalized);

      products.push({ name, type, year });
    });

    if (products.length === 0) {
      errors.push(`Shelf "${shelfName}" has no valid products.`);
      return;
    }

    shelves.push({ name: shelfName, products });
  });

  return { shelves, errors };
}

export function parseImportText(text: string): ImportParseResult {
  try {
    const payload = JSON.parse(text);
    return parseImportPayload(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid JSON file.";
    return {
      shelves: [],
      errors: [`Invalid JSON: ${message}`],
    };
  }
}
