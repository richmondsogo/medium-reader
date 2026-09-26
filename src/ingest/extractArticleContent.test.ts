import { describe, expect, it } from "vitest";
import { extractArticleContent } from "./extractArticleContent";
import { readFileSync } from "fs";
import { join } from "path";

describe("extractArticleContent", () => {
  it("extracts content from free-direct.html", () => {
    const html = readFileSync(join(process.cwd(), "fixtures/html/free-direct.html"), "utf-8");
    const result = extractArticleContent(html, "https://medium.com/test");

    expect(result.contentMarkdown).toBeTruthy();
    expect(result.contentMarkdown.length).toBeGreaterThan(100);
    // free-direct is ~1500 words or so. 800-3000 is safe.
    expect(result.wordCount).toBeGreaterThan(800);
    expect(result.wordCount).toBeLessThan(3000);
    expect(result.title).toBeTruthy();
    expect(result.title).not.toMatch(/Sign in|Get started/i);
  });

  it("extracts content and strips chrome from member-freedium-mirror.html", () => {
    const html = readFileSync(join(process.cwd(), "fixtures/html/member-freedium-mirror.html"), "utf-8");
    const result = extractArticleContent(html, "https://freedium-mirror.cfd/test");

    expect(result.contentMarkdown).toBeTruthy();
    // fetch-behavior.md noted ~1200 words. Let's assert a range 1000 - 1500.
    expect(result.wordCount).toBeGreaterThan(1000);
    expect(result.wordCount).toBeLessThan(1500);

    expect(result.contentMarkdown).not.toMatch(/Freedium beta/i);
    expect(result.contentMarkdown).not.toMatch(/remixContext/i);
  });

  it("does not crash on member-direct.html (locked)", () => {
    const html = readFileSync(join(process.cwd(), "fixtures/html/member-direct.html"), "utf-8");
    expect(() => {
      extractArticleContent(html, "https://medium.com/test");
    }).not.toThrow();
  });
});
