import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { extractSubtitle, validateSubtitle } from "./extractSubtitle";
import { extractArticleContent } from "./extractArticleContent";
import { cleanArticleMarkdown } from "../lib/cleanArticleMarkdown";

describe("extractSubtitle", () => {
  describe("inline branch tests", () => {
    it("returns 'missing' when html is empty or metadata tags are absent", () => {
      const resEmpty = extractSubtitle({ html: "", via: "direct" });
      expect(resEmpty).toEqual({ subtitle: "", reason: "missing" });

      const resNoMeta = extractSubtitle({
        html: "<html><head><title>Test</title></head><body>Hello</body></html>",
        via: "direct",
      });
      expect(resNoMeta).toEqual({ subtitle: "", reason: "missing" });
    });

    it("uses og:description and ignores junk meta description on direct HTML", () => {
      const html = `
        <html>
          <head>
            <meta property="og:description" content="A pristine and concise author subtitle." />
            <meta name="description" content="SEO junk and ugly concatenated title text..." />
          </head>
        </html>
      `;
      const res = extractSubtitle({ html, via: "direct", title: "My Article" });
      expect(res).toEqual({
        subtitle: "A pristine and concise author subtitle.",
        reason: "ok",
      });
    });

    it("never falls back to meta[name=description] on direct HTML even if og:description is missing", () => {
      const html = `
        <html>
          <head>
            <meta name="description" content="SEO junk that should not be used on direct" />
          </head>
        </html>
      `;
      const res = extractSubtitle({ html, via: "direct", title: "My Article" });
      expect(res).toEqual({ subtitle: "", reason: "missing" });
    });

    it("prefers meta[name=description] on freedium-mirror and freedium, falling back to og:description", () => {
      const htmlWithMeta = `
        <html>
          <head>
            <meta name="description" content="Freedium mirrored subtitle" />
            <meta property="og:description" content="Fallback OG" />
          </head>
        </html>
      `;
      const resMeta = extractSubtitle({
        html: htmlWithMeta,
        via: "freedium-mirror",
        title: "Test",
      });
      expect(resMeta).toEqual({ subtitle: "Freedium mirrored subtitle", reason: "ok" });

      const htmlWithOgOnly = `
        <html>
          <head>
            <meta property="og:description" content="Fallback OG only" />
          </head>
        </html>
      `;
      const resOg = extractSubtitle({
        html: htmlWithOgOnly,
        via: "freedium",
        title: "Test",
      });
      expect(resOg).toEqual({ subtitle: "Fallback OG only", reason: "ok" });
    });

    it("collapses and trims irregular whitespace", () => {
      const html = `
        <html>
          <head>
            <meta property="og:description" content="  Line one\n\t  line two   line three   " />
          </head>
        </html>
      `;
      const res = extractSubtitle({ html, via: "direct", title: "Test" });
      expect(res).toEqual({
        subtitle: "Line one line two line three",
        reason: "ok",
      });
    });

    it("returns 'duplicate-of-title' when candidate matches title (case/alphanumeric insensitive)", () => {
      const html = `
        <html>
          <head>
            <meta property="og:description" content="Build a Next.js App in 10 Minutes!" />
          </head>
        </html>
      `;
      const res = extractSubtitle({
        html,
        via: "direct",
        title: "build a next.js app in 10 minutes",
      });
      expect(res).toEqual({ subtitle: "", reason: "duplicate-of-title" });
    });

    it("returns 'boilerplate' when candidate matches Medium's default description", () => {
      // Row #93 real candidate
      const res93 = validateSubtitle({
        candidate: "“” is published by Roan Brasil Monteiro.",
        title: "Building a Complete Personal Harness: LLM Wiki + Developer’s Second Brain in Obsidian",
      });
      expect(res93).toEqual({ subtitle: "", reason: "boilerplate" });

      const resGeneric = validateSubtitle({
        candidate: "“Understanding Distributed Systems” is published by Alex Petrov.",
        title: "Understanding Distributed Systems",
      });
      expect(resGeneric).toEqual({ subtitle: "", reason: "boilerplate" });
    });

    it("accepts legitimate subtitles containing 'published' and 'by'", () => {
      const res1 = validateSubtitle({
        candidate: "Published by industry experts, this guide explains modern distributed systems.",
        title: "A Modern Architecture Guide",
      });
      expect(res1).toEqual({
        subtitle: "Published by industry experts, this guide explains modern distributed systems.",
        reason: "ok",
      });

      const res2 = validateSubtitle({
        candidate: "Articles published by independent researchers are shaping modern AI safety.",
        title: "The Future of AI Safety",
      });
      expect(res2).toEqual({
        subtitle: "Articles published by independent researchers are shaping modern AI safety.",
        reason: "ok",
      });
    });

    it("returns 'truncated' when candidate ends in ellipsis (U+2026 or ...)", () => {
      const resUnicode = validateSubtitle({
        candidate: "In my previous article, I explained how to integrate GCP Secret Manager…",
        title: "GCP Secret Manager Guide",
      });
      expect(resUnicode).toEqual({ subtitle: "", reason: "truncated" });

      const resDots = validateSubtitle({
        candidate: "In my previous article, I explained how to integrate GCP Secret Manager...",
        title: "GCP Secret Manager Guide",
      });
      expect(resDots).toEqual({ subtitle: "", reason: "truncated" });

      const resTrailingWhitespace = validateSubtitle({
        candidate: "Another excerpt with trailing whitespace ...   ",
        title: "Testing Whitespace",
      });
      expect(resTrailingWhitespace).toEqual({ subtitle: "", reason: "truncated" });
    });

    it("returns 'too-long' when candidate exceeds 200 characters", () => {
      const longText = "A".repeat(201);
      const html = `
        <html>
          <head>
            <meta property="og:description" content="${longText}" />
          </head>
        </html>
      `;
      const res = extractSubtitle({ html, via: "direct", title: "Test" });
      expect(res).toEqual({ subtitle: "", reason: "too-long" });
    });

    it("returns 'duplicate-of-body' when og:description equals first ~150 chars of body", () => {
      const openingHook =
        "You are at a gathering, and a family member touches you when you're clearly not open to physical contact. What should you do next in that moment?";
      const html = `
        <html>
          <head>
            <meta property="og:description" content="${openingHook}" />
          </head>
        </html>
      `;
      const bodyMarkdown = `${openingHook}\n\nHere is the rest of the second paragraph explaining the full situation.`;

      const res = extractSubtitle({
        html,
        via: "direct",
        title: "Setting Personal Boundaries",
        bodyMarkdown,
      });

      expect(res).toEqual({ subtitle: "", reason: "duplicate-of-body" });
    });

    it("returns 'duplicate-of-body' when candidate has leading title matching body opening", () => {
      const bodyOpening = "For the longest time, I wanted to travel to India. I came close on many occasions.";
      const candidateWithChrome = `My Great Trip ${bodyOpening}`;

      const html = `
        <html>
          <head>
            <meta property="og:description" content="${candidateWithChrome}" />
          </head>
        </html>
      `;
      const bodyMarkdown = `${bodyOpening} But I always cancelled at the last second.`;

      const res = extractSubtitle({
        html,
        via: "direct",
        title: "My Great Trip",
        bodyMarkdown,
      });

      expect(res).toEqual({ subtitle: "", reason: "duplicate-of-body" });
    });

    it("returns 'duplicate-of-body' for #191 verbatim body excerpt containing markdown links and backticks", () => {
      // Verbatim excerpt from article #191
      const bodyMarkdown = `> In my [previous article](https://medium.com/stackademic/how-to-add-gcp-secrets-in-a-spring-boot-application-using-the-gcp-secret-manager-dependency-6e4b43bd4afb), I explained how to integrate GCP Secret Manager with a Spring Boot application using the \`spring-cloud-gcp-starter-secretmanager\` dependency. It provided a clean, declarative approach to injecting secrets directly into \`@Value\` annotations or configuration properties.`;
      const candidate = "In my previous article, I explained how to integrate GCP Secret Manager with a Spring Boot application using the";
      const title = "Why we switched to the GCP Secret Manager API in Spring Boot and What we learned?";

      const res = validateSubtitle({
        candidate,
        title,
        bodyMarkdown,
      });

      expect(res).toEqual({ subtitle: "", reason: "duplicate-of-body" });
    });
  });

  describe("fixture tests (printing candidate values and asserting on what is really there)", () => {
    it("free-direct.html (direct): inspects actual candidate metadata", () => {
      const fixturePath = path.resolve(process.cwd(), "fixtures/html/free-direct.html");
      const html = fs.readFileSync(fixturePath, "utf8");
      const $ = cheerio.load(html);

      const ogDesc = $('meta[property="og:description"]').attr("content");
      const metaDesc = $('meta[name="description"]').attr("content");

      // Per prompt instructions: PRINT candidate values actually found
      console.log("[Fixture: free-direct.html]");
      console.log("  Found og:description:", ogDesc);
      console.log("  Found meta[name=description]:", metaDesc);

      // Verify og:description is present and metaDesc contains the title concatenation
      expect(ogDesc).toBe(
        "How I built aidot-express, a Spring-style framework for clear API code, quick testing, request tracing, and Vue 3 screens."
      );
      expect(metaDesc).toContain("I Missed @Service in Node.js, So I Built It with Express");

      // Extraction via "direct" selects og:description
      const title = "I Missed @Service in Node.js, So I Built It with Express";
      const standaloneRes = extractSubtitle({ html, via: "direct", title });
      expect(standaloneRes.subtitle).toBe(ogDesc);
      expect(standaloneRes.reason).toBe("ok");

      // When passed the fixture's extracted & cleaned body (where the author's h2 subtitle was captured into markdown),
      // Guard 4 detects that the candidate is duplicated in the first 800 chars of the body.
      const extracted = extractArticleContent(html, "https://example.com/free-direct");
      const cleanedBody = cleanArticleMarkdown(extracted.contentMarkdown, title);
      const withBodyRes = extractSubtitle({
        html,
        via: "direct",
        title,
        bodyMarkdown: cleanedBody,
      });
      console.log("  Result with extracted body:", withBodyRes);
      expect(withBodyRes.reason).toBe("duplicate-of-body");
    });

    it("member-direct.html (direct): inspects actual candidate metadata", () => {
      const fixturePath = path.resolve(process.cwd(), "fixtures/html/member-direct.html");
      const html = fs.readFileSync(fixturePath, "utf8");
      const $ = cheerio.load(html);

      const ogDesc = $('meta[property="og:description"]').attr("content");
      const metaDesc = $('meta[name="description"]').attr("content");

      // Per prompt instructions: PRINT candidate values actually found
      console.log("[Fixture: member-direct.html]");
      console.log("  Found og:description:", ogDesc);
      console.log("  Found meta[name=description]:", metaDesc);

      expect(ogDesc).toBe("It’s not confidence, charm, or charisma");
      expect(metaDesc).toContain("The Most Pleasant People to Be Around Have This in Common");

      const title = "The Most Pleasant People to Be Around Have This in Common";
      const standaloneRes = extractSubtitle({ html, via: "direct", title });
      expect(standaloneRes.subtitle).toBe("It’s not confidence, charm, or charisma");
      expect(standaloneRes.reason).toBe("ok");
    });

    it("member-freedium-mirror.html (freedium-mirror): inspects actual candidate metadata", () => {
      const fixturePath = path.resolve(process.cwd(), "fixtures/html/member-freedium-mirror.html");
      const html = fs.readFileSync(fixturePath, "utf8");
      const $ = cheerio.load(html);

      const ogDesc = $('meta[property="og:description"]').attr("content");
      const metaDesc = $('meta[name="description"]').attr("content");

      // Per prompt instructions: PRINT candidate values actually found
      console.log("[Fixture: member-freedium-mirror.html]");
      console.log("  Found og:description:", ogDesc);
      console.log("  Found meta[name=description]:", metaDesc);

      // Freedium strips og:description and places the true subtitle in meta[name=description]
      expect(ogDesc).toBeUndefined();
      expect(metaDesc).toBe("It’s not confidence, charm, or charisma");

      const title = "The Most Pleasant People to Be Around Have This in Common";
      const extracted = extractArticleContent(html, "https://example.com/member-freedium-mirror");
      const cleanedBody = cleanArticleMarkdown(extracted.contentMarkdown, title);

      const res = extractSubtitle({
        html,
        via: "freedium-mirror",
        title,
        bodyMarkdown: cleanedBody,
      });

      console.log("  Result with extracted body:", res);
      // In Freedium, the body is the true story text without the duplicate subtitle header, so reason is "ok"
      expect(res).toEqual({
        subtitle: "It’s not confidence, charm, or charisma",
        reason: "ok",
      });
    });
  });
});
