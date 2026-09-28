import * as cheerio from "cheerio";

export type SubtitleReason =
  | "ok"
  | "missing"
  | "duplicate-of-title"
  | "duplicate-of-body"
  | "too-long";

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
 * Extracts the article subtitle from page metadata with strict source and content guards.
 *
 * Candidate sources:
 * - "direct": meta[property="og:description"] ONLY. Never falls back to meta[name="description"]
 *   (discovery showed meta description on direct Medium is SEO copy or title+body concatenation).
 * - "freedium-mirror" / "freedium": meta[name="description"], else og:description.
 *
 * Ordered guards:
 * 1. Empty/missing -> "missing", subtitle "".
 * 2. Equals title (lowercase, alphanumerics only) -> "duplicate-of-title", subtitle "".
 * 3. Longer than 200 chars -> "too-long", subtitle "".
 * 4. Duplicate of body: candidate (with leading title copy and trailing ellipsis stripped)
 *    is contained in the first 800 chars of bodyMarkdown (alphanumerics-only lowercase) ->
 *    "duplicate-of-body", subtitle "".
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

  // Normalise: trim and collapse whitespace
  const candidate = rawCandidate ? rawCandidate.replace(/\s+/g, " ").trim() : "";

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

  // Guard 3: longer than 200 chars
  if (candidate.length > 200) {
    return { subtitle: "", reason: "too-long" };
  }

  // Guard 4: duplicate-of-body
  // Alphanumerics-only lowercase candidate (strip leading copy of title and trailing ellipsis)
  // contained in the alphanumerics-only form of the first 800 chars of bodyMarkdown.
  const strippedEllipsis = candidate.replace(/(\u2026|\.{3,})\s*$/, "").trim();
  let bodyCheckAlpha = toAlphanumericLower(strippedEllipsis);
  if (titleAlpha.length > 0 && bodyCheckAlpha.startsWith(titleAlpha)) {
    bodyCheckAlpha = bodyCheckAlpha.slice(titleAlpha.length);
  }

  const bodyWindow = (bodyMarkdown ?? "").slice(0, 800);
  const bodyAlpha = toAlphanumericLower(bodyWindow);

  if (bodyCheckAlpha.length > 0 && bodyAlpha.includes(bodyCheckAlpha)) {
    return { subtitle: "", reason: "duplicate-of-body" };
  }

  return { subtitle: candidate, reason: "ok" };
}
