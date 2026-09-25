import { describe, expect, it } from "vitest";
import { normalizeUrl } from "./url";

describe("normalizeUrl", () => {
  it("strips all query parameters", () => {
    const input = "https://medium.com/@user/story-12345678?source=email-digest&utm_source=test";
    expect(normalizeUrl(input)).toBe("https://medium.com/@user/story-12345678");
  });

  it("forces https scheme from http", () => {
    const input = "http://medium.com/@user/story-12345678";
    expect(normalizeUrl(input)).toBe("https://medium.com/@user/story-12345678");
  });

  it("lowercases the host", () => {
    const input = "https://Medium.COM/@User/Story-12345678";
    expect(normalizeUrl(input)).toBe("https://medium.com/@User/Story-12345678");
  });

  it("strips trailing slash from pathnames", () => {
    const input = "https://medium.com/@user/story-12345678/";
    expect(normalizeUrl(input)).toBe("https://medium.com/@user/story-12345678");
  });

  it("preserves trailing slash for root URL", () => {
    const input = "http://MEDIUM.COM/?ref=home";
    expect(normalizeUrl(input)).toBe("https://medium.com/");
  });

  it("removes URL fragments / hash", () => {
    const input = "https://medium.com/@user/story-12345678?source=email#section-1";
    expect(normalizeUrl(input)).toBe("https://medium.com/@user/story-12345678");
  });
});
