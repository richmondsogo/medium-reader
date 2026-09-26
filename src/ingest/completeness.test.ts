import { describe, expect, it } from "vitest";
import { assessCompleteness } from "./completeness";
import { readFileSync } from "fs";
import { join } from "path";

describe("assessCompleteness", () => {
  it("detects 'complete' on free-direct fixture", () => {
    const html = readFileSync(join(process.cwd(), "fixtures/html/free-direct.html"), "utf-8");
    expect(assessCompleteness(html)).toBe("complete");
  });

  it("detects 'complete' on member-freedium-mirror fixture", () => {
    const html = readFileSync(join(process.cwd(), "fixtures/html/member-freedium-mirror.html"), "utf-8");
    expect(assessCompleteness(html)).toBe("complete");
  });

  it("detects 'locked' on member-direct fixture", () => {
    const html = readFileSync(join(process.cwd(), "fixtures/html/member-direct.html"), "utf-8");
    expect(assessCompleteness(html)).toBe("locked");
  });

  it("detects 'locked' from isLockedPreviewOnly string", () => {
    expect(assessCompleteness('<script>window.__MIDDLEWARE_STATE__ = {"isLockedPreviewOnly":true};</script>')).toBe("locked");
  });

  it("detects 'locked' from Member-only story paragraph", () => {
    expect(assessCompleteness('<div><p class="pw-member-badge">Member-only story</p></div>')).toBe("locked");
  });
});
