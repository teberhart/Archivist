export const BORROWER_NAME_MIN = 2;
export const BORROWER_NAME_MAX = 80;
export const BORROWER_NOTES_MAX = 240;

export const BORROWER_NAME_PATTERN =
  /^[\p{L}\p{N}][\p{L}\p{N}\p{M} '&().,\/:;!?-]*$/u;

export const BORROWER_NAME_HELP =
  "Use 2-80 characters. Letters (including accents), numbers, spaces, and basic punctuation.";
export const BORROWER_NOTES_HELP =
  "Optional. Up to 240 characters. Add context like where it's stored or return timing.";

export function isValidBorrowerName(name: string) {
  if (name.length < BORROWER_NAME_MIN || name.length > BORROWER_NAME_MAX) {
    return false;
  }

  return BORROWER_NAME_PATTERN.test(name);
}

export function isValidBorrowerNotes(notes: string) {
  return notes.length <= BORROWER_NOTES_MAX;
}
