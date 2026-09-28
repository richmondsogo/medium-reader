export interface ArticleWithSubtitle {
  subtitle?: string | null;
}

/**
 * Returns the trimmed subtitle to display in the reader, or null if empty/whitespace.
 *
 * Rules:
 * - Real text with surrounding whitespace: returns trimmed text.
 * - null, undefined, '', or whitespace-only: returns null.
 * - Never falls back to snippet.
 */
export function getDisplaySubtitle(article?: ArticleWithSubtitle | null): string | null {
  const trimmed = article?.subtitle?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}
