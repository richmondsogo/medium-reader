import { describe, it, expect } from "vitest";
import { articlePath, isArticlePath } from "./routes";

describe("routes - articlePath", () => {
  it("formats article path with numeric id", () => {
    expect(articlePath(1)).toBe("/read/1");
  });

  it("formats article path with string id", () => {
    expect(articlePath("42")).toBe("/read/42");
  });
});

describe("routes - isArticlePath", () => {
  it("returns true for article paths with or without trailing slash", () => {
    expect(isArticlePath("/read/12")).toBe(true);
    expect(isArticlePath("/read/12/")).toBe(true);
  });

  it("returns false for non-article paths", () => {
    expect(isArticlePath("/")).toBe(false);
    expect(isArticlePath("/read")).toBe(false);
    expect(isArticlePath("/read/")).toBe(false);
    expect(isArticlePath("/a/12")).toBe(false);
    expect(isArticlePath("/reader")).toBe(false);
    expect(isArticlePath("/read/12/nested")).toBe(false);
  });
});
