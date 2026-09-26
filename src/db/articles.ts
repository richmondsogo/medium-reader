import { eq, lt, and } from "drizzle-orm";
import { articles } from "./schema";
import type { DbClient } from "./client";

export type FetchStatus = "ok" | "partial" | "failed";

export function getFetchStatusRank(status: FetchStatus | null | undefined): number {
  if (status === "ok") return 3;
  if (status === "partial") return 2;
  if (status === "failed") return 1;
  return 0; // fallback
}

export type InsertArticle = typeof articles.$inferInsert;

export function upsertArticle(db: DbClient, article: InsertArticle) {
  const existing = db.select().from(articles).where(eq(articles.url, article.url)).get();

  if (!existing) {
    const inserted = db.insert(articles).values(article).returning().get();
    return { row: inserted, action: "inserted" as const };
  }

  const existingRank = getFetchStatusRank(existing.fetchStatus as FetchStatus | null | undefined);
  const newRank = getFetchStatusRank(article.fetchStatus as FetchStatus | null | undefined);

  if (newRank >= existingRank) {
    const updated = db.update(articles)
      .set({
        title: article.title,
        authorName: article.authorName,
        authorHandle: article.authorHandle,
        publicationName: article.publicationName,
        snippet: article.snippet,
        contentMarkdown: article.contentMarkdown,
        wordCount: article.wordCount,
        readingTimeMinutes: article.readingTimeMinutes,
        memberOnly: article.memberOnly,
        fetchStatus: article.fetchStatus,
        fetchedVia: article.fetchedVia,
        thumbnailUrl: article.thumbnailUrl,
        claps: article.claps,
        responses: article.responses,
        publishedDate: article.publishedDate,
        updatedAt: article.updatedAt ?? new Date().toISOString()
      })
      .where(eq(articles.url, article.url))
      .returning()
      .get();
    
    return { row: updated, action: "updated" as const };
  }

  return { row: existing, action: "unchanged" as const };
}

export function setArticleRead(db: DbClient, id: number, isRead: boolean) {
  return db.update(articles)
    .set({ isRead, updatedAt: new Date().toISOString() })
    .where(eq(articles.id, id))
    .returning()
    .get();
}

export function setArticleSaved(db: DbClient, id: number, isSaved: boolean) {
  return db.update(articles)
    .set({ isSaved, updatedAt: new Date().toISOString() })
    .where(eq(articles.id, id))
    .returning()
    .get();
}

export function purgeOldArticles(db: DbClient, olderThanIso: string) {
  const result = db.delete(articles)
    .where(
      and(
        lt(articles.ingestedAt, olderThanIso),
        eq(articles.isSaved, false)
      )
    )
    .run();

  return result.changes;
}
