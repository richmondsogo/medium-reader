import { describe, it, expect } from "vitest";
import { getDisplaySubtitle } from "./getDisplaySubtitle";

describe("getDisplaySubtitle", () => {
  it("returns null when subtitle is null", () => {
    expect(getDisplaySubtitle({ subtitle: null })).toBeNull();
  });

  it("returns null when subtitle is empty string", () => {
    expect(getDisplaySubtitle({ subtitle: "" })).toBeNull();
  });

  it("returns null when subtitle is whitespace-only", () => {
    expect(getDisplaySubtitle({ subtitle: "   \t\n   " })).toBeNull();
  });

  it("returns trimmed string when subtitle has real text with surrounding whitespace", () => {
    expect(
      getDisplaySubtitle({
        subtitle: "  Checklists are boring AF, and that’s exactly why they work  \n",
      })
    ).toBe("Checklists are boring AF, and that’s exactly why they work");
  });

  it("returns null when article is undefined or null", () => {
    expect(getDisplaySubtitle(null)).toBeNull();
    expect(getDisplaySubtitle(undefined)).toBeNull();
    expect(getDisplaySubtitle({})).toBeNull();
  });

  it("never falls back to snippet", () => {
    const article = {
      subtitle: "",
      snippet: "A snippet that must not be used as fallback",
    };
    expect(getDisplaySubtitle(article)).toBeNull();
  });
});
