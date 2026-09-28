import * as cheerio from "cheerio";

export type SubtitleReason =
  | "ok"
  | "missing"
  | "duplicate-of-title"
  | "boilerplate"
  | "truncated"
  | "too-long"
  | "duplicate-of-body";

export interface ValidateSubtitleParams {
  candidate?: string | null;
  title?: string | null;
  bodyMarkdown?: string | null;
}

export interface ExtractSubtitleParams {
  html: string;
  via: "direct" | "freedium-mirror" | "freedium" | string;
  title?: string | null;
  bodyMarkdown?: string | null;
}

export interface ExtractSubtitleResult {
  subtitle: string;
  reason: SubtitleReason;
}

function toAlphanumericLower(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Strips markdown syntax (links, images, inline formatting, headers) so plain text
 * comparisons are not disrupted by URLs or formatting markers.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, "") // remove images
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // links -> link text
    .replace(/[#*_~`>]/g, ""); // remove formatting markers
}

/**
 * Validates a subtitle candidate against content and quality guards.
 *
 * Ordered guards:
 * 1. Empty / whitespace -> "missing", subtitle "".
 * 2. Equals title (lowercase, alphanumerics only) -> "duplicate-of-title", subtitle "".
 * 3. Boilerplate: matches /\bis published by\b.+\.$/i -> "boilerplate", subtitle "".
 * 4. Truncated: ends in "…" (U+2026) or "..." after trim -> "truncated", subtitle "".
 * 5. Longer than 200 chars -> "too-long", subtitle "".
 * 6. Duplicate of body: candidate (with leading title copy and trailing ellipsis stripped)
 *    is contained in the first 800 chars of stripped bodyMarkdown (alphanumerics-only lowercase) ->
 *    "duplicate-of-body", subtitle "".
 */
export function validateSubtitle(params: ValidateSubtitleParams): ExtractSubtitleResult {
  const { title, bodyMarkdown } = params;
  const candidate = params.candidate ? params.candidate.replace(/\s+/g, " ").trim() : "";

  // Guard 1: empty
  if (!candidate) {
    return { subtitle: "", reason: "missing" };
  }

  // Guard 2: equals title (lowercase, alphanumerics only)
  const candidateAlpha = toAlphanumericLower(candidate);
  const titleAlpha = toAlphanumericLower(title ?? "");
  if (titleAlpha.length > 0 && candidateAlpha === titleAlpha) {
    return { subtitle: "", reason: "duplicate-of-title" };
  }

  // Guard 3: boilerplate
  if (/\bis published by\b.+\.$/i.test(candidate)) {
    return { subtitle: "", reason: "boilerplate" };
  }

  // Guard 4: truncated
  if (candidate.endsWith("…") || candidate.endsWith("...")) {
    return { subtitle: "", reason: "truncated" };
  }

  // Guard 5: longer than 200 chars
  if (candidate.length > 200) {
    return { subtitle: "", reason: "too-long" };
  }

  // Guard 6: duplicate-of-body
  const strippedEllipsis = candidate.replace(/(\u2026|\.{3,})\s*$/, "").trim();
  let bodyCheckAlpha = toAlphanumericLower(strippedEllipsis);
  if (titleAlpha.length > 0 && bodyCheckAlpha.startsWith(titleAlpha)) {
    bodyCheckAlpha = bodyCheckAlpha.slice(titleAlpha.length);
  }

  const strippedBody = stripMarkdown(bodyMarkdown ?? "");
  const bodyWindow = strippedBody.slice(0, 800);
  const bodyAlpha = toAlphanumericLower(bodyWindow);

  if (bodyCheckAlpha.length > 0 && bodyAlpha.includes(bodyCheckAlpha)) {
    return { subtitle: "", reason: "duplicate-of-body" };
  }

  return { subtitle: candidate, reason: "ok" };
}

/**
 * Extracts the article subtitle from page metadata with strict source and content guards.
 *
 * Candidate sources:
 * - "direct": meta[property="og:description"] ONLY. Never falls back to meta[name="description"]
 *   (discovery showed meta description on direct Medium is SEO copy or title+body concatenation).
 * - "freedium-mirror" / "freedium": meta[name="description"], else og:description.
 */
export function extractSubtitle(params: ExtractSubtitleParams): ExtractSubtitleResult {
  const { html, via, title, bodyMarkdown } = params;

  if (!html) {
    return { subtitle: "", reason: "missing" };
  }

  const $ = cheerio.load(html);
  let rawCandidate: string | undefined;

  if (via === "direct") {
    rawCandidate = $('meta[property="og:description"]').attr("content");
  } else if (via === "freedium-mirror" || via === "freedium") {
    rawCandidate =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content");
  }

  return validateSubtitle({
    candidate: rawCandidate,
    title,
    bodyMarkdown,
  });
}
