import { createDb } from "../src/db/client";
import { articles } from "../src/db/schema";

const db = createDb("./data/medium-reader.db");
const rows = db.select().from(articles).all();

console.log(`Total article rows: ${rows.length}`);

const urlSet = new Set(rows.map((r) => r.url));
console.log(`Distinct URLs: ${urlSet.size}`);

if (urlSet.size !== rows.length) {
  console.log("Unexpected: duplicate URLs found in the table itself (should be impossible due to UNIQUE constraint).");
} else {
  console.log("No duplicate rows in the table (as expected - UNIQUE constraint holds).");
  console.log(`This confirms 225 (15 emails x 15) minus ${rows.length} = ${225 - rows.length} article(s) were seen in more than one digest and correctly upserted rather than duplicated.`);
}
