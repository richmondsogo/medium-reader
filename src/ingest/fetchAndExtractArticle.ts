import { fetchArticleHtml } from "./fetchArticleHtml";
import { extractArticleContent } from "./extractArticleContent";
import { assessCompleteness } from "./completeness";
import type { HttpFetchFn } from "./httpFetch";
import type { ExtractedArticle, ArticleLink } from "./types";

export async function fetchAndExtractArticle(
  url: string,
  fallback: Pick<ArticleLink, "title" | "snippet" | "authorName">,
  deps: { httpFetch: HttpFetchFn; freediumBaseUrls: string[] }
): Promise<ExtractedArticle> {
  const { result } = await fetchArticleHtml(url, deps);
  const fetchedAt = new Date().toISOString();

  if (!result) {
    const contentMarkdown = `*Full article unavailable. Preview:*\n\n${fallback.snippet}`;
    const wordCount = fallback.snippet.trim().split(/\s+/).filter(Boolean).length;
    
    return {
      url,
      contentMarkdown,
      extractedTitle: fallback.title,
      extractedByline: fallback.authorName,
      wordCount,
      fetchStatus: "failed",
      fetchedVia: "none",
      fetchedAt,
    };
  }

  const completeness = assessCompleteness(result.html);
  const fetchStatus = completeness === "complete" ? "ok" : "partial";
  const extracted = extractArticleContent(result.html, url);

  return {
    url,
    contentMarkdown: extracted.contentMarkdown,
    extractedTitle: extracted.title,
    extractedByline: extracted.byline,
    wordCount: extracted.wordCount,
    fetchStatus,
    fetchedVia: result.via,
    fetchedAt,
  };
}
