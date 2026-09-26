import { assessCompleteness } from "./completeness";
import type { HttpFetchFn } from "./httpFetch";
import type { FetchAttemptResult } from "./types";

export type FetchAttemptLog = {
  via: "direct" | "freedium-mirror" | "freedium";
  outcome: "complete" | "partial" | "error";
  httpStatus?: number;
  error?: string;
};

export async function fetchArticleHtml(
  url: string,
  deps: { httpFetch: HttpFetchFn; freediumBaseUrls: string[] }
): Promise<{ result: FetchAttemptResult | null; allAttempts: FetchAttemptLog[] }> {
  const allAttempts: FetchAttemptLog[] = [];
  let bestLockedResult: FetchAttemptResult | null = null;

  const attempt = async (targetUrl: string, via: "direct" | "freedium-mirror" | "freedium") => {
    try {
      const { html, httpStatus } = await deps.httpFetch(targetUrl);
      const completeness = assessCompleteness(html);
      const result: FetchAttemptResult = { html, via, httpStatus };

      if (completeness === "complete") {
        allAttempts.push({ via, outcome: "complete", httpStatus });
        return { success: true, result };
      } else {
        allAttempts.push({ via, outcome: "partial", httpStatus });
        if (!bestLockedResult) {
          bestLockedResult = result;
        }
        return { success: false };
      }
    } catch (error) {
      allAttempts.push({
        via,
        outcome: "error",
        error: error instanceof Error ? error.message : String(error),
      });
      return { success: false };
    }
  };

  // 1. Direct attempt
  const direct = await attempt(url, "direct");
  if (direct.result) return { result: direct.result, allAttempts };

  // 2. Freedium mirrors
  for (const baseUrl of deps.freediumBaseUrls) {
    const via = baseUrl.includes("mirror") ? "freedium-mirror" : "freedium";
    const targetUrl = `${baseUrl.replace(/\/$/, "")}/${url}`;
    
    const mirrorAttempt = await attempt(targetUrl, via);
    if (mirrorAttempt.result) return { result: mirrorAttempt.result, allAttempts };
  }

  return { result: bestLockedResult, allAttempts };
}
