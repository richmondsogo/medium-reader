import type { Completeness } from "./types";

export function assessCompleteness(html: string): Completeness {
  if (html.includes('"isLockedPreviewOnly":true')) {
    return "locked";
  }

  const memberOnlyRegex = /<p[^>]*>\s*Member-only story\s*<\/p>/i;
  if (memberOnlyRegex.test(html)) {
    return "locked";
  }

  return "complete";
}
