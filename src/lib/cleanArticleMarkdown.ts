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

/**
 * Detects residual Medium chrome markers that may have slipped past cleanArticleMarkdown.
 *
 * Scans markdown content for known noise patterns:
 * 1. "caption-prompt": Image zoom/caption prompt variants (e.g. "view image in full size").
 * 2. "profile-link": Author profile URLs (medium.com/@handle or handle.medium.com without story slug).
 * 3. "reading-time": Isolated reading-time lines (e.g. "N min read", "*N mins read*").
 * 4. "date-line": Standalone absolute or relative date lines (e.g. "Sep 16, 2026", "5 days ago").
 * 5. "divider-line": Standalone "--", "\--", or dash divider lines.
 *
 * Returns an array of marker names found (empty array = clean). Does not modify content.
 */
export function detectResidualChromeMarkers(cleanedMarkdown: string): string[] {
  if (!cleanedMarkdown) {
    return [];
  }
  const markers: string[] = [];

  // 1. Caption prompt variant
  if (
    /view image in full size/i.test(cleanedMarkdown) ||
    /(?:press enter|click|tap)\s+(?:or\s+(?:click|tap)\s+)?to\s+view\s+(?:image\s+)?(?:in\s+)?full\s*size/i.test(cleanedMarkdown)
  ) {
    markers.push("caption-prompt");
  }

  // 2. Profile link (medium.com/@handle or handle.medium.com without article slug)
  const profileLinkRegex =
    /https?:\/\/(?:medium\.com\/@[a-zA-Z0-9._-]+|(?!miro|cdn-images)[a-zA-Z0-9-]+\.medium\.com)\/?(?:\?[^\s)>"]*)?(?=[)>"\s]|$)/i;
  if (profileLinkRegex.test(cleanedMarkdown)) {
    markers.push("profile-link");
  }

  // 3. Isolated reading-time line
  if (
    /^[ \t]*(?:[*_`~[\](]|·|•|-)?\s*\d+\s*(?:mins?|minutes?)\s*(?:read|reading)(?:\s*time)?\s*(?:[*_`~[\])]|·|•|-)?\s*$/im.test(
      cleanedMarkdown
    )
  ) {
    markers.push("reading-time");
  }

  // 4. Standalone date line
  if (
    /^[ \t]*(?:[*_`~[\](]|·|•|-)?\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+\d{4})?|\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?(?:,?\s+\d{4})?|\d+\s+(?:days?|hours?|mins?|minutes?|weeks?|months?)\s+ago|yesterday|today)\s*(?:[*_`~[\])]|·|•|-)?\s*$/im.test(
      cleanedMarkdown
    )
  ) {
    markers.push("date-line");
  }

  // 5. Standalone divider line
  if (/^[ \t]*(?:\\?--|\\?-\\?-|\\?[–—]{1,2})\s*$/im.test(cleanedMarkdown)) {
    markers.push("divider-line");
  }

  return markers;
}
