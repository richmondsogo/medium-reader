import { describe, expect, it } from "vitest";
import { fetchAndExtractArticle } from "./fetchAndExtractArticle";
import type { HttpFetchFn } from "./httpFetch";

describe("fetchAndExtractArticle", () => {
  const fallback = {
    title: "Fallback Title",
    snippet: "This is a fallback snippet with several words.",
    authorName: "John Doe",
  };
  const deps = {
    httpFetch: (async () => ({ html: "", httpStatus: 200 })) as HttpFetchFn,
    freediumBaseUrls: ["https://freedium.mirror"],
  };

  it("returns fallback data when fetch fails entirely", async () => {
    const fakeDeps = {
      ...deps,
      httpFetch: async () => { throw new Error("Network error"); },
    };

    const res = await fetchAndExtractArticle("https://medium.com/test", fallback, fakeDeps);
    
    expect(res.fetchStatus).toBe("failed");
    expect(res.fetchedVia).toBe("none");
    expect(res.contentMarkdown).toContain("*Full article unavailable. Preview:*");
    expect(res.contentMarkdown).toContain("This is a fallback snippet");
    expect(res.wordCount).toBe(8);
  });

  it("returns partial extraction when locked", async () => {
    const fakeDeps = {
      ...deps,
      httpFetch: async () => ({ html: '<html><body><p>Member-only story</p><p>Locked text</p></body></html>', httpStatus: 200 }),
    };

    const res = await fetchAndExtractArticle("https://medium.com/test", fallback, fakeDeps);
    
    expect(res.fetchStatus).toBe("partial");
    expect(res.fetchedVia).toBe("direct");
    expect(res.contentMarkdown).toContain("Locked text");
  });

  it("returns full extraction when complete", async () => {
    const fakeDeps = {
      ...deps,
      httpFetch: async () => ({ html: '<html><body><p>Full article content right here.</p></body></html>', httpStatus: 200 }),
    };

    const res = await fetchAndExtractArticle("https://medium.com/test", fallback, fakeDeps);
    
    expect(res.fetchStatus).toBe("ok");
    expect(res.fetchedVia).toBe("direct");
    expect(res.contentMarkdown).toContain("Full article content");
  });
});
