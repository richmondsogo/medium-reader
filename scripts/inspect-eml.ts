import fs from "node:fs";
import path from "node:path";
import { simpleParser, type ParsedMail } from "mailparser";
import * as cheerio from "cheerio";

interface ArticleSummary {
  title: string;
  author: string;
  publication?: string;
  readingTime?: string;
  memberOnly: boolean;
  hasThumbnail: boolean;
  url: string;
}

interface FixtureReport {
  filename: string;
  headers: {
    from: string;
    subject: string;
    date: string;
    messageId: string;
    listUnsubscribe: string;
  };
  mime: {
    contentType: string;
    textCharset: string;
    textEncoding: string;
    htmlCharset: string;
    htmlEncoding: string;
  };
  linkCounts: {
    article: number;
    author: number;
    publication: number;
    topicTag: number;
    membership: number;
    settingsUnsubscribe: number;
    footer: number;
    promoBanners: number;
    totalAnchorLinks: number;
    trackingPixels: number;
  };
  articlesCount: number;
  promoBanner?: string;
  articles: ArticleSummary[];
}

const FIXTURES_DIR = path.resolve(process.cwd(), "fixtures/emails");
const TMP_DIR = path.resolve(process.cwd(), "tmp");

if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

async function inspectFixture(filePath: string): Promise<FixtureReport> {
  const filename = path.basename(filePath);
  const raw = fs.readFileSync(filePath);
  const rawStr = raw.toString("utf8");

  const parsed: ParsedMail = await simpleParser(raw);

  const baseName = filename.replace(/\.eml$/i, "");
  const htmlPath = path.join(TMP_DIR, `${baseName}.html`);
  const textPath = path.join(TMP_DIR, `${baseName}.txt`);

  const htmlContent = parsed.html || "";
  const textContent = parsed.text || "";

  fs.writeFileSync(htmlPath, htmlContent, "utf8");
  fs.writeFileSync(textPath, textContent, "utf8");

  // Header extraction
  const listUnsubHeader = parsed.headerLines.find((h) => h.key === "list-unsubscribe")?.line || "";
  const listUnsubClean = listUnsubHeader.replace(/^List-Unsubscribe:\s*/i, "").replace(/\r?\n\s*/g, " ").trim();

  // MIME header extraction from raw content
  const contentTypeMatch = rawStr.match(/Content-Type:\s*([^;\r\n]+)/i);
  const contentType = contentTypeMatch ? contentTypeMatch[1]?.trim() || "unknown" : "unknown";

  const $ = cheerio.load(htmlContent);

  // Link classification
  let articleLinks = 0;
  let authorLinks = 0;
  let pubLinks = 0;
  let topicTagLinks = 0;
  let membershipLinks = 0;
  let settingsUnsubLinks = 0;
  let footerLinks = 0;
  let promoBannerLinks = 0;
  let promoBannerTarget = "";

  $("a").each((_, el) => {
    const href = $(el).attr("href") || "";
    if (!href) return;
    try {
      const u = new URL(href);
      const p = u.pathname;

      if (
        p.startsWith("/me/notifications/unsubscribe") ||
        p.startsWith("/me/settings/notifications") ||
        p.startsWith("/me/following") ||
        p.startsWith("/me/missioncontrol")
      ) {
        settingsUnsubLinks++;
      } else if (p === "/plans" || p.includes("/membership")) {
        membershipLinks++;
      } else if (
        u.host === "itunes.apple.com" ||
        u.host === "play.google.com" ||
        u.host === "help.medium.com" ||
        u.host === "policy.medium.com" ||
        p.startsWith("/jobs-at-medium") ||
        p === "/"
      ) {
        footerLinks++;
      } else if (p === "/write" || p === "/blog/newsletter" || p === "/choose" || p === "/download-app") {
        promoBannerLinks++;
        promoBannerTarget = p;
      } else if (p.startsWith("/tag/") || p.startsWith("/topic/")) {
        topicTagLinks++;
      } else if (p.match(/-[a-f0-9]{8,16}$/) || p.startsWith("/p/")) {
        articleLinks++;
      } else if (p.startsWith("/@")) {
        authorLinks++;
      } else {
        pubLinks++;
      }
    } catch {}
  });

  // Tracking pixels
  let trackingPixels = 0;
  $("img").each((_, el) => {
    const src = $(el).attr("src") || "";
    const w = $(el).attr("width");
    const h = $(el).attr("height");
    if ((w === "1" && h === "1") || src.includes("wf/open") || src.includes("stat?event=email.opened")) {
      trackingPixels++;
    }
  });

  // Extract article cards
  const articles: ArticleSummary[] = [];
  $("div.cb.cc.cd.ce").each((_, el) => {
    const $card = $(el);
    const title = $card.find("h2").text().trim();
    const articleLink = $card.find("a").filter((__, a) => {
      const h = $(a).attr("href") || "";
      return Boolean(h.match(/-[a-f0-9]{8,16}(\?|$)/));
    });
    const url = articleLink.first().attr("href") || "";

    const authorLink = $card.find('a[href*="/@"]').filter((__, a) => {
      const h = $(a).attr("href") || "";
      try {
        const u = new URL(h);
        return u.pathname.startsWith("/@") && !u.pathname.match(/-[a-f0-9]{8,16}$/);
      } catch {
        return false;
      }
    });
    const author = authorLink.first().text().trim();

    // Publication
    let publication: string | undefined;
    $card.find("a").each((__, a) => {
      const h = $(a).attr("href") || "";
      const t = $(a).text().trim();
      try {
        const u = new URL(h);
        if (
          !u.pathname.startsWith("/@") &&
          !u.pathname.match(/-[a-f0-9]{8,16}$/) &&
          u.pathname.length > 1 &&
          !u.pathname.includes("/") &&
          !h.includes("/me/")
        ) {
          publication = t;
        }
      } catch {}
    });

    const readTimeMatch = $card.text().match(/(\d+\s*min read)/i);
    const readingTime = readTimeMatch ? readTimeMatch[1] : undefined;
    const memberOnly = $card.find('img[alt="Member-only content"]').length > 0;
    const hasThumbnail = $card.find('img[width="160"]').length > 0;

    articles.push({
      title,
      author,
      publication,
      readingTime,
      memberOnly,
      hasThumbnail,
      url,
    });
  });

  return {
    filename,
    headers: {
      from: parsed.from?.text || "",
      subject: parsed.subject || "",
      date: parsed.date ? parsed.date.toISOString() : "",
      messageId: parsed.messageId || "",
      listUnsubscribe: listUnsubClean,
    },
    mime: {
      contentType,
      textCharset: "utf-8",
      textEncoding: "quoted-printable",
      htmlCharset: "utf-8",
      htmlEncoding: "quoted-printable",
    },
    linkCounts: {
      article: articleLinks,
      author: authorLinks,
      publication: pubLinks,
      topicTag: topicTagLinks,
      membership: membershipLinks,
      settingsUnsubscribe: settingsUnsubLinks,
      footer: footerLinks,
      promoBanners: promoBannerLinks,
      totalAnchorLinks: $("a").length,
      trackingPixels,
    },
    articlesCount: articles.length,
    promoBanner: promoBannerTarget || undefined,
    articles,
  };
}

async function main() {
  const files = fs
    .readdirSync(FIXTURES_DIR)
    .filter((f) => f.endsWith(".eml"))
    .sort();

  console.log(`Decoding ${files.length} fixtures from ${FIXTURES_DIR}...\n`);

  for (const file of files) {
    const report = await inspectFixture(path.join(FIXTURES_DIR, file));
    console.log(`=== ${report.filename} ===`);
    console.log(`  Subject: ${report.headers.subject}`);
    console.log(`  From:    ${report.headers.from}`);
    console.log(`  Date:    ${report.headers.date}`);
    console.log(`  Msg ID:  ${report.headers.messageId}`);
    console.log(`  Articles found: ${report.articlesCount}`);
    console.log(`  Total <a> links: ${report.linkCounts.totalAnchorLinks} | Tracking pixels: ${report.linkCounts.trackingPixels}`);
    console.log(`  Promo banner: ${report.promoBanner || "None"}`);
    console.log(`  Decoded outputs written to tmp/${file.replace(/\.eml$/, ".html")} and .txt\n`);
  }
}

main().catch((err) => {
  console.error("Inspection error:", err);
  process.exit(1);
});
