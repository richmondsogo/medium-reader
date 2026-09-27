/**
 * Escapes special regex characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Strips leftover Medium page chrome and duplicate headers captured into stored
 * article contentMarkdown during extraction.
 *
 * Operates purely as a render-time transform (the database remains untouched).
 * Scans independently within the leading ~800 characters of the markdown content
 * (where extraction noise lives) for:
 * 1. Duplicate title line matching the article's own title (or its setext underline).
 * 2. Literal "Press enter or click to view image in full size" caption text.
 * 3. Medium author profile links wrapping avatars/text (unwraps to keep inner content).
 * 4. Isolated "N min read" line.
 * 5. Standalone date lines (absolute like "Sep 16, 2026" or relative like "5 days ago").
 * 6. Standalone "\--" or "--" divider lines.
 *
 * Any text beyond the leading window, legitimate external links, and prose mentioning
 * dates, hyphens, or reading times remain untouched.
 */
export function cleanArticleMarkdown(
  markdown: string,
  title?: string | null
): string {
  if (!markdown) {
    return "";
  }

  // 1. Caption instruction: "Press enter or click to view image in full size"
  // This is a Medium UI zoom prompt that can appear at any image caption in the article.
  let text = markdown.replace(
    /^[ \t]*Press enter or click to view image in full size[ \t]*$(?:\r?\n)?/gim,
    ""
  );
  text = text.replace(/Press enter or click to view image in full size/gi, "");

  // Confine duplicate title, date, reading-time, and divider noise removal
  // to the leading portion of markdown where Medium's byline chrome lives.
  const LEADING_LIMIT = 800;
  let splitIndex = text.indexOf("\n", LEADING_LIMIT);
  if (splitIndex === -1) {
    splitIndex = text.length;
  }

  let leading = text.slice(0, splitIndex);
  const remainder = text.slice(splitIndex);

  // 2. Duplicate title line (exact match, with optional markdown formatting or setext underline)
  if (title && title.trim().length > 0) {
    const escapedTitle = escapeRegExp(title.trim());
    const titleRegex = new RegExp(
      `^[ \\t]*(?:#+\\s*|\\*\\*|__)?${escapedTitle}(?:\\*\\*|__)?\\s*$(?:\\r?\\n[ \\t]*[-=]{3,}\\s*)?(?:\\r?\\n)?`,
      "im"
    );
    leading = leading.replace(titleRegex, "");
  }

  // 3. Profile-link unwrap: removes the wrapping <a> but preserves the inner image or text.
  // Profile URLs match medium.com/@<handle> or <handle>.medium.com (excluding miro.medium.com CDN).
  // Inner content safely handles nested markdown images ![alt](url) via backtracking.
  const profileLinkRegex =
    /\[\s*((?:!\[[^\]]*\]\([^)]*\)|[^[\]])*?)\s*\]\(\s*(https?:\/\/(?:medium\.com\/@[a-zA-Z0-9._-]+|(?!miro|cdn-images)[a-zA-Z0-9-]+\.medium\.com)\/?(?:\?[^)\s]*)?)\s*\)/g;
  leading = leading.replace(profileLinkRegex, "$1");

  // 4. Isolated "N min read" line
  leading = leading.replace(/^[ \t]*\d+\s*min\s+read[ \t]*$(?:\r?\n)?/gim, "");

  // 5. Standalone date line (absolute or relative)
  // Absolute dates: e.g. "Sep 16, 2026", "September 16, 2026", "Sep 16"
  leading = leading.replace(
    /^[ \t]*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:,\s+\d{4})?[ \t]*$(?:\r?\n)?/gim,
    ""
  );
  // Relative dates: e.g. "5 days ago", "yesterday", "today"
  leading = leading.replace(
    /^[ \t]*\d+\s+(?:days?|hours?|mins?|minutes?|weeks?|months?)\s+ago[ \t]*$(?:\r?\n)?/gim,
    ""
  );
  leading = leading.replace(/^[ \t]*(?:yesterday|today)[ \t]*$(?:\r?\n)?/gim, "");

  // 6. Standalone "\--" or "--" divider line (exactly two dashes, not markdown hr "---")
  leading = leading.replace(/^[ \t]*\\?--\s*$(?:\r?\n)?/gim, "");

  // Collapse excess blank lines in the cleaned leading portion (e.g. \n\n\n\n left behind by stripped lines)
  leading = leading.replace(/\n{3,}/g, "\n\n");

  let result = leading + remainder;

  // Trim leading blank lines left behind after chrome is removed
  result = result.replace(/^\s*\n+/, "");

  return result;
}
