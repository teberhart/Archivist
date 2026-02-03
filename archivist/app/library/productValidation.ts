export const PRODUCT_NAME_MIN = 2;
export const PRODUCT_NAME_MAX = 80;
export const PRODUCT_TYPE_MIN = 2;
export const PRODUCT_TYPE_MAX = 40;
export const PRODUCT_YEAR_MIN = 1900;
export const PRODUCT_YEAR_MAX_OFFSET = 1;

export const PRODUCT_NAME_PATTERN =
  /^[\p{L}\p{N}][\p{L}\p{N}\p{M} '&().,\/:;!?-]*$/u;
export const PRODUCT_TYPE_PATTERN =
  /^[\p{L}\p{N}][\p{L}\p{N}\p{M} '&().,\/:;!?-]*$/u;

export const PRODUCT_NAME_HELP =
  "Use 2-80 characters. Letters (including accents), numbers, spaces, and basic punctuation.";
export const PRODUCT_TYPE_HELP =
  "Use 2-40 characters. Letters (including accents), numbers, spaces, and basic punctuation.";

export function getProductYearMax() {
  return new Date().getFullYear() + PRODUCT_YEAR_MAX_OFFSET;
}

export function isValidProductName(name: string) {
  if (name.length < PRODUCT_NAME_MIN || name.length > PRODUCT_NAME_MAX) {
    return false;
  }

  return PRODUCT_NAME_PATTERN.test(name);
}

export function isValidProductType(type: string) {
  if (type.length < PRODUCT_TYPE_MIN || type.length > PRODUCT_TYPE_MAX) {
    return false;
  }

  return PRODUCT_TYPE_PATTERN.test(type);
}

export function isValidProductYear(year: number) {
  if (!Number.isInteger(year)) {
    return false;
  }

  return year >= PRODUCT_YEAR_MIN && year <= getProductYearMax();
}
