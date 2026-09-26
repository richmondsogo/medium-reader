import { env } from "../lib/env";
import { createDb } from "../db/client";
import { purgeOldArticles } from "../db/articles";
import { articles } from "../db/schema";
import { count, eq, lt, and } from "drizzle-orm";
import path from "node:path";

function main() {
  const isDryRun = process.argv.includes("--dry-run");

  const dbPath = path.resolve(process.cwd(), env.DATABASE_PATH);
  const db = createDb(dbPath);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffIso = cutoff.toISOString();

  if (isDryRun) {
    console.log("=== DRY RUN: Purge Old Articles ===");
    console.log(`Cutoff date: ${cutoffIso}`);
    
    const result = db.select({ value: count() })
      .from(articles)
      .where(
        and(
          lt(articles.ingestedAt, cutoffIso),
          eq(articles.isSaved, false)
        )
      )
      .get();
      
    console.log(`[DRY RUN] Would delete ${result?.value ?? 0} articles older than 90 days.`);
  } else {
    console.log("=== Purge Old Articles ===");
    console.log(`Cutoff date: ${cutoffIso}`);
    const deletedCount = purgeOldArticles(db, cutoffIso);
    console.log(`Deleted ${deletedCount} articles older than 90 days.`);
  }
}

main();
