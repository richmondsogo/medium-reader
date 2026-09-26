import { env } from "../lib/env";
import { createDb } from "../db/client";
import { articles, processedEmails } from "../db/schema";
import { count, desc } from "drizzle-orm";
import path from "node:path";

function main() {
  const dbPath = path.resolve(process.cwd(), env.DATABASE_PATH);
  const db = createDb(dbPath);

  console.log("=== Database Inspection ===");
  
  // Total article count
  const totalArticles = db.select({ value: count() }).from(articles).get();
  console.log(`Total Articles: ${totalArticles?.value ?? 0}`);

  // Counts by fetchStatus
  const statusCounts = db.select({
    status: articles.fetchStatus,
    count: count()
  }).from(articles).groupBy(articles.fetchStatus).all();

  console.log("\nArticles by fetchStatus:");
  for (const row of statusCounts) {
    console.log(`  ${row.status ?? "unknown"}: ${row.count}`);
  }

  // 5 most recently ingested articles
  const recent = db.select({
    title: articles.title,
    url: articles.url,
    status: articles.fetchStatus
  })
  .from(articles)
  .orderBy(desc(articles.ingestedAt))
  .limit(5)
  .all();

  console.log("\n5 Most Recently Ingested Articles:");
  recent.forEach((a, i) => {
    console.log(`  ${i + 1}. [${a.status}] ${a.title}\n     ${a.url}`);
  });

  // Total processed emails
  const totalEmails = db.select({ value: count() }).from(processedEmails).get();
  console.log(`\nTotal Processed Emails: ${totalEmails?.value ?? 0}`);
}

main();
