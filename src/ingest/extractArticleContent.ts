import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";

export function extractArticleContent(
  html: string,
  sourceUrl: string
): { title?: string; byline?: string; contentMarkdown: string; wordCount: number } {
  const dom = new JSDOM(html, { url: sourceUrl });
  const document = dom.window.document;

  // 1. Strip scripts containing __remixContext or __MIDDLEWARE_STATE__
  const scripts = Array.from(document.querySelectorAll("script"));
  for (const script of scripts) {
    const text = script.textContent || "";
    if (text.includes("__remixContext") || text.includes("__MIDDLEWARE_STATE__")) {
      script.remove();
    }
  }

  // 2. Strip elements whose text content matches /Freedium beta/i
  // To avoid removing the entire body, we only remove the innermost elements that match.
  const elements = Array.from(document.querySelectorAll("*"));
  for (const el of elements) {
    const text = el.textContent || "";
    if (/Freedium beta/i.test(text)) {
      // Check if any direct child also contains the match
      const childMatches = Array.from(el.children).some((child) => {
        return /Freedium beta/i.test(child.textContent || "");
      });
      // If no child matches, this is the innermost element containing the text
      if (!childMatches) {
        el.remove();
      }
    }
  }

  // 3. Run Readability
  const reader = new Readability(document);
  const article = reader.parse();

  if (!article) {
    // If readability fails completely (e.g. empty document)
    return {
      contentMarkdown: "",
      wordCount: 0,
    };
  }

  // 4. Convert to markdown
  const turndownService = new TurndownService();
  const contentMarkdown = turndownService.turndown(article.content || "");

  // 5. Word count (split by whitespace on plain text content)
  const wordCount = (article.textContent || "").trim().split(/\s+/).filter(Boolean).length;

  return {
    title: article.title || undefined,
    byline: article.byline || undefined,
    contentMarkdown,
    wordCount,
  };
}
