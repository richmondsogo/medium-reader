import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  ArticleImage,
  ImageFallback,
  getImageRetryKey,
  getNextRetryDelay,
  MAX_IMAGE_RETRIES,
  RETRY_DELAYS,
} from "./article-image";

describe("article-image - retry key & delay calculations", () => {
  it("formats retry key with current retry count to force React remounting", () => {
    const src = "https://miro.medium.com/v2/resize:fit:1400/hash.png";
    expect(getImageRetryKey(src, 0)).toBe(`${src}-0`);
    expect(getImageRetryKey(src, 1)).toBe(`${src}-1`);
    expect(getImageRetryKey(src, 2)).toBe(`${src}-2`);
  });

  it("schedules increasing delays for up to 2 retries, then exhausts", () => {
    expect(MAX_IMAGE_RETRIES).toBe(2);
    expect(RETRY_DELAYS).toEqual([300, 800]);

    // Attempt 0 -> retry 1 delay: 300ms
    expect(getNextRetryDelay(0)).toBe(300);
    // Attempt 1 -> retry 2 delay: 800ms
    expect(getNextRetryDelay(1)).toBe(800);
    // Attempt 2 -> retries exhausted, returns null
    expect(getNextRetryDelay(2)).toBeNull();
    // Subsequent calls return null
    expect(getNextRetryDelay(3)).toBeNull();
  });
});

describe("article-image - component rendering", () => {
  it("renders an img with rewritten URL and loading=lazy", () => {
    const html = renderToStaticMarkup(
      <ArticleImage
        src="https://medium.com/img/medium/700/1*dummyhash.png"
        alt="A diagram of system architecture"
      />
    );

    expect(html).toContain("<img");
    expect(html).toContain("https://miro.medium.com/v2/resize:fit:1400/1*dummyhash.png");
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('alt="A diagram of system architecture"');
    expect(html).toContain("rounded-md max-w-full h-auto my-6");
  });

  it("renders graceful fallback when src is missing or empty", () => {
    const html = renderToStaticMarkup(
      <ArticleImage src="" alt="Missing chart" />
    );

    expect(html).not.toContain("<img");
    expect(html).toContain('role="img"');
    expect(html).toContain("Image unavailable");
    expect(html).toContain("Missing chart");
    expect(html).toContain("border-border/60");
  });

  it("renders ImageFallback with correct accessibility role and label", () => {
    const htmlWithAlt = renderToStaticMarkup(<ImageFallback alt="Sample description" />);
    expect(htmlWithAlt).toContain('role="img"');
    expect(htmlWithAlt).toContain('aria-label="Image unavailable: Sample description"');
    expect(htmlWithAlt).toContain("Image unavailable");
    expect(htmlWithAlt).toContain("Sample description");

    const htmlWithoutAlt = renderToStaticMarkup(<ImageFallback />);
    expect(htmlWithoutAlt).toContain('aria-label="Image unavailable"');
    expect(htmlWithoutAlt).toContain("Image unavailable");
  });
});
