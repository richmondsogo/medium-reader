import { eq } from "drizzle-orm";
import { processedEmails } from "./schema";
import type { DbClient } from "./client";

export function isEmailProcessed(db: DbClient, messageId: string): boolean {
  const row = db.select({ messageId: processedEmails.messageId })
    .from(processedEmails)
    .where(eq(processedEmails.messageId, messageId))
    .get();
  return !!row;
}

export function markEmailProcessed(db: DbClient, messageId: string, articleCount: number) {
  return db.insert(processedEmails)
    .values({
      messageId,
      articleCount,
      processedAt: new Date().toISOString()
    })
    .onConflictDoNothing({ target: processedEmails.messageId })
    .run();
}
