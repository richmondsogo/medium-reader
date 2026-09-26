import { describe, expect, it } from "vitest";
import { fetchArticleHtml } from "./fetchArticleHtml";
import type { HttpFetchFn } from "./httpFetch";

describe("fetchArticleHtml", () => {
  const freediumBaseUrls = ["https://freedium-mirror.cfd", "https://freedium.cfd"];
  const url = "https://medium.com/test-article";

  it("returns direct if complete", async () => {
    let callCount = 0;
    const fakeFetch: HttpFetchFn = async (reqUrl) => {
      callCount++;
      expect(reqUrl).toBe(url);
      return { html: "<html><body>Complete article</body></html>", httpStatus: 200 };
    };

    const res = await fetchArticleHtml(url, { httpFetch: fakeFetch, freediumBaseUrls });
    expect(callCount).toBe(1);
    expect(res.result).toBeDefined();
    expect(res.result?.via).toBe("direct");
    expect(res.allAttempts).toHaveLength(1);
    expect(res.allAttempts[0].outcome).toBe("complete");
  });

  it("tries freedium-mirror if direct is locked", async () => {
    let callCount = 0;
    const fakeFetch: HttpFetchFn = async (reqUrl) => {
      callCount++;
      if (reqUrl === url) {
        return { html: '<html><body><p>Member-only story</p></body></html>', httpStatus: 200 };
      } else if (reqUrl === "https://freedium-mirror.cfd/https://medium.com/test-article") {
        return { html: "<html><body>Complete from mirror</body></html>", httpStatus: 200 };
      }
      throw new Error("Unexpected URL");
    };

    const res = await fetchArticleHtml(url, { httpFetch: fakeFetch, freediumBaseUrls });
    expect(callCount).toBe(2);
    expect(res.result?.via).toBe("freedium-mirror");
    expect(res.allAttempts).toHaveLength(2);
    expect(res.allAttempts[0].outcome).toBe("partial");
    expect(res.allAttempts[1].outcome).toBe("complete");
  });

  it("tries freedium if freedium-mirror throws", async () => {
    let callCount = 0;
    const fakeFetch: HttpFetchFn = async (reqUrl) => {
      callCount++;
      if (reqUrl === url) {
        return { html: '<html><body><p>Member-only story</p></body></html>', httpStatus: 200 };
      } else if (reqUrl === "https://freedium-mirror.cfd/https://medium.com/test-article") {
        throw new Error("Network error");
      } else if (reqUrl === "https://freedium.cfd/https://medium.com/test-article") {
        return { html: "<html><body>Complete from freedium</body></html>", httpStatus: 200 };
      }
      throw new Error("Unexpected URL");
    };

    const res = await fetchArticleHtml(url, { httpFetch: fakeFetch, freediumBaseUrls });
    expect(callCount).toBe(3);
    expect(res.result?.via).toBe("freedium");
    expect(res.allAttempts).toHaveLength(3);
    expect(res.allAttempts[1].outcome).toBe("error");
    expect(res.allAttempts[2].outcome).toBe("complete");
  });

  it("returns best locked result if all fail or are locked", async () => {
    const fakeFetch: HttpFetchFn = async () => {
      return { html: '<html><body><p>Member-only story</p></body></html>', httpStatus: 200 };
    };

    const res = await fetchArticleHtml(url, { httpFetch: fakeFetch, freediumBaseUrls });
    expect(res.result).toBeDefined();
    expect(res.result?.via).toBe("direct"); // The first one
    expect(res.allAttempts).toHaveLength(3);
    expect(res.allAttempts.every(a => a.outcome === "partial")).toBe(true);
  });

  it("returns null if all throw", async () => {
    const fakeFetch: HttpFetchFn = async () => {
      throw new Error("Network error");
    };

    const res = await fetchArticleHtml(url, { httpFetch: fakeFetch, freediumBaseUrls });
    expect(res.result).toBeNull();
    expect(res.allAttempts).toHaveLength(3);
    expect(res.allAttempts.every(a => a.outcome === "error")).toBe(true);
  });
});
