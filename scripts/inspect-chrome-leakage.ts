import { createDb } from "../src/db/client";
import { articles } from "../src/db/schema";
import { env } from "../src/lib/env";
import path from "node:path";

interface ArticleLeakage {
  id: number;
  title: string | null;
  fetchedVia: string | null;
  hasPressEnterCaption: boolean;
  hasProfileLink: boolean;
  profileLinks: string[];
  hasMidReadingTime: boolean;
  readingTimeLines: string[];
  hasLeadingDivider: boolean;
  dividerLines: string[];
  snippet: string;
}

function main() {
  const dbPath = path.resolve(process.cwd(), env.DATABASE_PATH);
  const db = createDb(dbPath);

  const allArticles = db
    .select({
      id: articles.id,
      title: articles.title,
      fetchedVia: articles.fetchedVia,
      contentMarkdown: articles.contentMarkdown,
    })
    .from(articles)
    .all();

  console.log(`Scanning ${allArticles.length} articles for Medium UI chrome leakage...\n`);

  const results: ArticleLeakage[] = [];

  const pressEnterString = "Press enter or click to view image in full size";
  // Matches medium.com/@handle or handle.medium.com profile links
  const profileLinkRegex = /\[([^\]]*)\]\((https?:\/\/(?:[a-zA-Z0-9-]+\.medium\.com|medium\.com\/@[a-zA-Z0-9._-]+)[^)]*)\)/g;

  for (const art of allArticles) {
    const md = art.contentMarkdown || "";

    const hasPressEnterCaption = md.includes(pressEnterString);

    const profileLinks: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = profileLinkRegex.exec(md)) !== null) {
      profileLinks.push(match[2]);
    }
    const hasProfileLink = profileLinks.length > 0;

    // Check reading time line: matches /^\d+ min read$/ appearing anywhere OTHER than very first line
    const lines = md.split(/\r?\n/);
    const readingTimeLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^\d+\s*min\s+read$/i.test(line)) {
        if (i > 0) {
          readingTimeLines.push(`line ${i + 1}: "${line}"`);
        }
      }
    }
    const hasMidReadingTime = readingTimeLines.length > 0;

    // Check leading divider in first 1000 chars or first 20 lines
    const leadingLines = lines.slice(0, 20);
    const dividerLines: string[] = [];
    for (let i = 0; i < leadingLines.length; i++) {
      const line = leadingLines[i].trim();
      if (/^\\?--\s*$/.test(line)) {
        dividerLines.push(`line ${i + 1}: "${line}"`);
      }
    }
    const hasLeadingDivider = dividerLines.length > 0;

    const isAffected =
      hasPressEnterCaption ||
      hasProfileLink ||
      hasMidReadingTime ||
      hasLeadingDivider;

    if (isAffected) {
      results.push({
        id: art.id,
        title: art.title,
        fetchedVia: art.fetchedVia,
        hasPressEnterCaption,
        hasProfileLink,
        profileLinks,
        hasMidReadingTime,
        readingTimeLines,
        hasLeadingDivider,
        dividerLines,
        snippet: md.slice(0, 350),
      });
    }
  }

  console.log(`=== Summary of Chrome Leakage ===`);
  console.log(`Total scanned articles: ${allArticles.length}`);
  console.log(`Total affected articles: ${results.length}\n`);

  // Breakdown by fetchedVia
  const breakdown: Record<string, { count: number; ids: number[] }> = {};
  for (const r of results) {
    const via = r.fetchedVia ?? "null";
    if (!breakdown[via]) {
      breakdown[via] = { count: 0, ids: [] };
    }
    breakdown[via].count++;
    breakdown[via].ids.push(r.id);
  }

  console.log(`Breakdown by fetchedVia:`);
  for (const [via, data] of Object.entries(breakdown)) {
    console.log(`  - ${via}: ${data.count} articles (IDs: ${data.ids.slice(0, 10).join(", ")}${data.ids.length > 10 ? "..." : ""})`);
  }

  // Breakdown by feature
  const countCaption = results.filter((r) => r.hasPressEnterCaption).length;
  const countProfile = results.filter((r) => r.hasProfileLink).length;
  const countReadingTime = results.filter((r) => r.hasMidReadingTime).length;
  const countDivider = results.filter((r) => r.hasLeadingDivider).length;

  console.log(`\nBreakdown by leakage pattern:`);
  console.log(`  - "Press enter or click to view image in full size": ${countCaption}`);
  console.log(`  - Medium profile links: ${countProfile}`);
  console.log(`  - Non-initial "N min read" line: ${countReadingTime}`);
  console.log(`  - Leading divider line (-- or \\--): ${countDivider}`);

  console.log(`\n=== 3 Raw Examples of Affected Content (first ~350 chars) ===\n`);
  const sampleArticles = results.slice(0, 3);
  sampleArticles.forEach((s, idx) => {
    console.log(`--- Example #${idx + 1} (Article #${s.id}: "${s.title}", fetchedVia: ${s.fetchedVia}) ---`);
    console.log(`Patterns matched: caption=${s.hasPressEnterCaption}, profileLink=${s.hasProfileLink}, readingTime=${s.hasMidReadingTime}, divider=${s.hasLeadingDivider}`);
    if (s.profileLinks.length > 0) {
      console.log(`Sample Profile Link: ${s.profileLinks[0]}`);
    }
    console.log(`Raw markdown:\n<<<START>>>\n${s.snippet}\n<<<END>>>\n`);
  });

  // Also specifically show article 99 if it wasn't in the first 3
  const art99 = results.find((r) => r.id === 99);
  if (art99 && !sampleArticles.some((s) => s.id === 99)) {
    console.log(`--- Specific Check: Article #99 ("${art99.title}", fetchedVia: ${art99.fetchedVia}) ---`);
    console.log(`Raw markdown:\n<<<START>>>\n${art99.snippet}\n<<<END>>>\n`);
  }
}

main();
