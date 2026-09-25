import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseDigest } from "./parseDigest";
import { DigestParseError } from "./types";

const FIXTURES_DIR = path.resolve(process.cwd(), "fixtures/emails");

const EXPECTED_FIXTURE_STATS: Record<
  string,
  { thumbnails: number; publications: number }
> = {
  "digest-2026-09-06.eml": { thumbnails: 15, publications: 10 },
  "digest-2026-09-08.eml": { thumbnails: 14, publications: 11 },
  "digest-2026-09-23.eml": { thumbnails: 15, publications: 12 },
  "digest-2026-09-24.eml": { thumbnails: 14, publications: 14 },
  "digest-2026-09-25.eml": { thumbnails: 15, publications: 10 },
};

describe("parseDigest fixture suite", () => {
  const fixtureFiles = Object.keys(EXPECTED_FIXTURE_STATS);

  it.each(fixtureFiles)("correctly parses %s", async (filename) => {
    const filePath = path.join(FIXTURES_DIR, filename);
    const buffer = fs.readFileSync(filePath);

    const digest = await parseDigest(buffer);
    const expected = EXPECTED_FIXTURE_STATS[filename];

    // Exactly 15 articles, 10 highlights, 5 following
    expect(digest.articles).toHaveLength(15);
    const highlights = digest.articles.filter((a) => a.section === "highlights");
    const following = digest.articles.filter((a) => a.section === "following");
    expect(highlights).toHaveLength(10);
    expect(following).toHaveLength(5);

    // Positions must be sequential 0..14
    digest.articles.forEach((article, idx) => {
      expect(article.position).toBe(idx);
    });

    // Thumbnail count
    const thumbnailCount = digest.articles.filter((a) => Boolean(a.thumbnailUrl)).length;
    expect(thumbnailCount).toBe(expected.thumbnails);

    // Publication count
    const publicationCount = digest.articles.filter((a) => Boolean(a.publicationName)).length;
    expect(publicationCount).toBe(expected.publications);

    // Footer leak regression check: no jobs-at-medium, privacy, or terms URLs
    for (const article of digest.articles) {
      expect(article.url).not.toContain("jobs-at-medium");
      expect(article.url).not.toContain("medium-privacy-policy");
      expect(article.url).not.toContain("medium-terms-of-service");

      // Canonical URL format: no query string, starts with https://medium.com/
      expect(article.url).not.toContain("?");
      expect(article.url.startsWith("https://medium.com/")).toBe(true);
    }

    // Message-ID matches documented SendGrid format
    expect(digest.messageId).toMatch(/^<[A-Za-z0-9_-]+@geopod-ismtpd-\d+>$/);

    // Cross-check: first highlights article title & authorName match subject line
    const firstArticle = highlights[0];
    expect(firstArticle).toBeDefined();
    const expectedSubjectPrefix = `${firstArticle.title} | ${firstArticle.authorName}`;
    expect(digest.subject.startsWith(expectedSubjectPrefix)).toBe(true);

    // Member-only count log (via console.info for eyeballing)
    const memberOnlyCount = digest.articles.filter((a) => a.memberOnly).length;
    console.info(
      `[${filename}] memberOnly count: ${memberOnlyCount} / ${digest.articles.length}`,
    );
  });

  it("throws DigestParseError on truncated/malformed email buffer", async () => {
    const malformedEml = Buffer.from(
      [
        'From: "Medium Daily Digest" <noreply@medium.com>',
        "To: user@example.com",
        "Subject: Truncated Digest",
        "Date: Sat, 26 Sep 2026 06:50:00 +0000",
        "Message-ID: <test-id@geopod-ismtpd-1>",
        "Content-Type: text/html; charset=utf-8",
        "",
        "<html><body><div><h1>Truncated content without article cards</h1></div></body></html>",
      ].join("\r\n"),
      "utf-8",
    );

    await expect(parseDigest(malformedEml)).rejects.toThrow(DigestParseError);
  });

  it("throws DigestParseError when email has no HTML part", async () => {
    const textOnlyEml = Buffer.from(
      [
        'From: "Medium Daily Digest" <noreply@medium.com>',
        "To: user@example.com",
        "Subject: Text Only Digest",
        "Date: Sat, 26 Sep 2026 06:50:00 +0000",
        "Message-ID: <test-id@geopod-ismtpd-1>",
        "Content-Type: text/plain; charset=utf-8",
        "",
        "Just text content",
      ].join("\r\n"),
      "utf-8",
    );

    await expect(parseDigest(textOnlyEml)).rejects.toThrow(DigestParseError);
  });
});
