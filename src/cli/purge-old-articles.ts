import { env } from "../lib/env";
import { createDb } from "../db/client";
import { purgeOldArticles, countPurgeCandidates } from "../db/articles";
import path from "node:path";

function main() {
  const isConfirm = process.argv.includes("--confirm");

  const dbPath = path.resolve(process.cwd(), env.DATABASE_PATH);
  const db = createDb(dbPath);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffIso = cutoff.toISOString();

  if (isConfirm) {
    console.log("=== Purge Old Articles ===");
    console.log(`Cutoff date: ${cutoffIso}`);
    const deletedCount = purgeOldArticles(db, cutoffIso);
    console.log(`Deleted ${deletedCount} article(s).`);
  } else {
    console.log("=== DRY RUN: Purge Old Articles ===");
    console.log(`Cutoff date: ${cutoffIso}`);
    
    const count = countPurgeCandidates(db, cutoffIso);
      
    console.log(`DRY RUN: ${count} article(s) would be deleted. Run with --confirm to delete them.`);
  }
}

main();

