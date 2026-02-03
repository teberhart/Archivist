export const SHELF_NAME_MIN = 2;
export const SHELF_NAME_MAX = 50;
export const SHELF_NAME_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\p{M} '&.-]*$/u;
export const SHELF_NAME_HELP =
  "Use 2-50 characters. Letters (including accents), numbers, spaces, apostrophes, ampersands, periods, and dashes only.";

export function isValidShelfName(name: string) {
  if (name.length < SHELF_NAME_MIN || name.length > SHELF_NAME_MAX) {
    return false;
  }

  return SHELF_NAME_PATTERN.test(name);
}
