import { createDb } from "../src/db/client";
import { processedEmails } from "../src/db/schema";

const db = createDb("./data/medium-reader.db");
const rows = db.select().from(processedEmails).all();

rows.sort((a, b) => a.processedAt.localeCompare(b.processedAt));

console.log(`Total processed emails: ${rows.length}\n`);
for (const r of rows) {
  console.log(`${r.processedAt}  ${r.messageId}  articles=${r.articleCount}`);
}
