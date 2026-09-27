import { describe, expect, it } from "vitest";
import { rewriteImageUrl } from "./rewriteImageUrl";

describe("rewriteImageUrl", () => {
  it("rewrites medium.com/img/medium/<size>/<hash> URLs to miro.medium.com/v2/resize:fit:1400/<hash>", () => {
    const input =
      "https://medium.com/img/medium/700/1*RvxXX7wFKZRsM2Oe6F7rQw.png";
    const expected =
      "https://miro.medium.com/v2/resize:fit:1400/1*RvxXX7wFKZRsM2Oe6F7rQw.png";
    expect(rewriteImageUrl(input)).toBe(expected);
  });

  it("rewrites medium.com/img/<size>/<hash> URLs without the 'medium' segment", () => {
    const input =
      "https://medium.com/img/700/1*olOJFYSE8uF35g79Ns2_mA.png";
    const expected =
      "https://miro.medium.com/v2/resize:fit:1400/1*olOJFYSE8uF35g79Ns2_mA.png";
    expect(rewriteImageUrl(input)).toBe(expected);
  });

  it("correctly preserves hashes without file extensions", () => {
    const input = "https://medium.com/img/medium/700/0*cbVn7-0GAYRy4n6t";
    const expected =
      "https://miro.medium.com/v2/resize:fit:1400/0*cbVn7-0GAYRy4n6t";
    expect(rewriteImageUrl(input)).toBe(expected);
  });

  it("handles http protocol and preserves complex hashes (e.g. @2x.jpeg)", () => {
    const input =
      "http://medium.com/img/medium/700/1*_yHj4r2iqHmvLtLRVnmQQQ@2x.jpeg";
    const expected =
      "https://miro.medium.com/v2/resize:fit:1400/1*_yHj4r2iqHmvLtLRVnmQQQ@2x.jpeg";
    expect(rewriteImageUrl(input)).toBe(expected);
  });

  it("passes through already-valid miro.medium.com URLs untouched", () => {
    const input =
      "https://miro.medium.com/v2/resize:fill:64:64/1*PmIHD5xqGCYO899Bn0_7Ag.jpeg";
    expect(rewriteImageUrl(input)).toBe(input);
  });

  it("passes through unrelated third-party URLs untouched", () => {
    const input = "https://images.unsplash.com/photo-123456789";
    expect(rewriteImageUrl(input)).toBe(input);
  });

  it("passes through relative and empty URLs untouched", () => {
    expect(rewriteImageUrl("/images/avatar.png")).toBe("/images/avatar.png");
    expect(rewriteImageUrl("")).toBe("");
  });
});
