import * as cheerio from "cheerio";
import { type ArticleLink, articleLinkSchema, DigestParseError } from "./types";
import { normalizeUrl } from "./url";

const FOOTER_EXCLUDED_PATHS = [
  "jobs-at-medium",
  "medium-privacy-policy",
  "medium-terms-of-service",
];

export function parseDigestHtml(html: string): ArticleLink[] {
  if (!html || typeof html !== "string") {
    throw new DigestParseError("HTML content must be a non-empty string");
  }

  const $ = cheerio.load(html);

  // Locate the "From your following" section container
  const followingHeading = $('*:contains("From your following")')
    .filter((_, el) => $(el).children().length === 0 && $(el).text().trim() === "From your following")
    .first();

  let followingContainer = followingHeading.parent();
  while (followingContainer.length && followingContainer[0].tagName !== "body") {
    const cards = followingContainer.find("a:has(h2)").filter((_, a) => {
      const href = $(a).attr("href") || "";
      return /-[a-f0-9]{8,16}(\?|$)/.test(href) && !href.includes("jobs-at-medium");
    });
    if (cards.length > 0) {
      break;
    }
    followingContainer = followingContainer.parent();
  }

  // Locate article title anchors
  const titleAnchors = $("a:has(h2)").filter((_, a) => {
    const href = $(a).attr("href") || "";
    if (!/-[a-f0-9]{8,16}(\?|$)/.test(href)) {
      return false;
    }
    try {
      const u = new URL(href);
      if (u.hostname !== "medium.com") {
        return false;
      }
      if (FOOTER_EXCLUDED_PATHS.some((excluded) => u.pathname.includes(excluded))) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });

  if (titleAnchors.length === 0) {
    throw new DigestParseError("No valid article links found in digest HTML");
  }

  const seenUrls = new Set<string>();
  const articles: ArticleLink[] = [];

  titleAnchors.each((_, aEl) => {
    const $a = $(aEl);
    const rawHref = $a.attr("href") || "";
    const canonicalUrl = normalizeUrl(rawHref);

    if (seenUrls.has(canonicalUrl)) {
      return;
    }
    seenUrls.add(canonicalUrl);

    // Walk up to enclosing card container
    let $card = $a.parent();
    while ($card.length && $card[0].tagName !== "body") {
      const hasAuthor =
        $card
          .find('a[href*="/@"]')
          .filter((_, el) => !/-[a-f0-9]{8,16}(\?|$)/.test($(el).attr("href") || ""))
          .length > 0;
      const hasReadTime = /\d+\s*min read/i.test($card.text());
      if (hasAuthor && hasReadTime) {
        break;
      }
      $card = $card.parent();
    }

    const title = $a.find("h2").text().trim();
    const snippet = $a.find("h3").text().trim();

    // Author metadata
    let authorHandle = "";
    let authorName: string | undefined;
    let authorAvatarUrl: string | undefined;

    const authorLinks = $card
      .find('a[href*="/@"]')
      .filter((_, el) => !/-[a-f0-9]{8,16}(\?|$)/.test($(el).attr("href") || ""));

    authorLinks.each((_, el) => {
      const href = $(el).attr("href") || "";
      const match = href.match(/@([^/?#]+)/);
      if (match && !authorHandle) {
        authorHandle = match[1];
      }
      const text = $(el).text().trim();
      if (text && !authorName) {
        authorName = text;
      }
      const img = $(el).find("img");
      if (img.length && !authorAvatarUrl) {
        authorAvatarUrl = img.attr("src");
      }
    });

    // Publication metadata
    let publicationSlug: string | undefined;
    let publicationName: string | undefined;

    $card.find("a").each((_, el) => {
      const href = $(el).attr("href") || "";
      const text = $(el).text().trim();
      try {
        const pu = new URL(href);
        if (
          pu.hostname === "medium.com" &&
          !pu.pathname.startsWith("/@") &&
          !/-[a-f0-9]{8,16}(\?|$)/.test(pu.pathname) &&
          !pu.pathname.startsWith("/me/") &&
          !pu.pathname.startsWith("/plans") &&
          pu.pathname !== "/"
        ) {
          publicationSlug = pu.pathname.replace(/^\//, "").split("/")[0];
          publicationName = text || undefined;
        }
      } catch {}
    });

    // Reading time
    const readMatch = $card.text().match(/(\d+)\s*min read/i);
    const readingTimeMinutes = readMatch ? parseInt(readMatch[1], 10) : undefined;

    // Member-only status
    const memberOnly = $card.find('img[alt="Member-only content"]').length > 0;

    // Claps
    let claps: string | undefined;
    const clapsImg = $card.find('img[alt="Claps"]');
    if (clapsImg.length) {
      claps = clapsImg.next("div").find("span").text().trim() || undefined;
    }

    // Responses
    let responses: string | undefined;
    const respImg = $card.find('img[alt="Responses"]');
    if (respImg.length) {
      responses = respImg.next("div").find("span").text().trim() || undefined;
    }

    // Thumbnail URL
    let thumbnailUrl: string | undefined;
    const thumbImg = $card.find('img[width="160"]');
    if (thumbImg.length) {
      thumbnailUrl = thumbImg.attr("src") || undefined;
    }

    // Section classification
    const isFollowing = followingContainer.length > 0 && followingContainer.find(aEl).length > 0;
    const section: "highlights" | "following" = isFollowing ? "following" : "highlights";

    const position = articles.length;

    const candidate = {
      url: canonicalUrl,
      title,
      authorHandle,
      authorName: authorName || undefined,
      publicationSlug: publicationSlug || undefined,
      publicationName: publicationName || undefined,
      snippet,
      readingTimeMinutes,
      memberOnly,
      claps,
      responses,
      thumbnailUrl,
      authorAvatarUrl,
      section,
      position,
    };

    try {
      const parsed = articleLinkSchema.parse(candidate);
      articles.push(parsed);
    } catch (err) {
      throw new DigestParseError(
        `Failed to validate article card at position ${position}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  });

  return articles;
}
