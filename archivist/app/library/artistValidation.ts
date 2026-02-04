export const ARTIST_NAME_MIN = 2;
export const ARTIST_NAME_MAX = 80;

export const ARTIST_NAME_PATTERN =
  /^[\p{L}\p{N}][\p{L}\p{N}\p{M} '&().,\/:;!?-]*$/u;

export const ARTIST_NAME_HELP =
  "Optional. Use 2-80 characters. Letters (including accents), numbers, spaces, and basic punctuation.";

export function isValidArtistName(name: string) {
  if (name.length < ARTIST_NAME_MIN || name.length > ARTIST_NAME_MAX) {
    return false;
  }

  return ARTIST_NAME_PATTERN.test(name);
}
