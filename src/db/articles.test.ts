import { describe, it, expect, beforeEach } from "vitest";
import { createDb, type DbClient } from "./client";
import { upsertArticle, setArticleRead, setArticleSaved, purgeOldArticles, getFetchStatusRank, type InsertArticle } from "./articles";
import { articles } from "./schema";

describe("db/articles", () => {
  let db: DbClient;

  beforeEach(() => {
    db = createDb(":memory:");
  });

  describe("getFetchStatusRank", () => {
    it("ranks ok > partial > failed > fallback", () => {
      expect(getFetchStatusRank("ok")).toBeGreaterThan(getFetchStatusRank("partial"));
      expect(getFetchStatusRank("partial")).toBeGreaterThan(getFetchStatusRank("failed"));
      expect(getFetchStatusRank("failed")).toBeGreaterThan(getFetchStatusRank(null));
    });
  });

  describe("upsertArticle", () => {
    const baseArticle: InsertArticle = {
      url: "https://example.com/1",
      title: "First",
      contentMarkdown: "Content 1",
      fetchStatus: "ok",
      fetchedVia: "direct",
    };

    it("inserts a new article", () => {
      const res = upsertArticle(db, baseArticle);
      expect(res.action).toBe("inserted");
      expect(res.row.url).toBe("https://example.com/1");
    });

    it("does not downgrade from 'ok' to 'partial'", () => {
      upsertArticle(db, baseArticle);
      const downgrade: InsertArticle = { ...baseArticle, fetchStatus: "partial", contentMarkdown: "worse content" };
      const res = upsertArticle(db, downgrade);
      expect(res.action).toBe("unchanged");
      expect(res.row.contentMarkdown).toBe("Content 1");
    });

    it("upgrades from 'partial' to 'ok'", () => {
      upsertArticle(db, { ...baseArticle, fetchStatus: "partial" });
      const upgrade: InsertArticle = { ...baseArticle, fetchStatus: "ok", contentMarkdown: "better content" };
      const res = upsertArticle(db, upgrade);
      expect(res.action).toBe("updated");
      expect(res.row.contentMarkdown).toBe("better content");
    });

    it("updates when status is equal ('ok' to 'ok')", () => {
      upsertArticle(db, baseArticle);
      const res = upsertArticle(db, { ...baseArticle, contentMarkdown: "new content" });
      expect(res.action).toBe("updated");
      expect(res.row.contentMarkdown).toBe("new content");
    });

    it("throws on raw duplicate url insert", () => {
      upsertArticle(db, baseArticle);
      expect(() => {
        db.insert(articles).values({ ...baseArticle, id: undefined }).run();
      }).toThrowError(/UNIQUE constraint failed/);
    });
  });

  describe("setArticleRead", () => {
    it("updates isRead to true while isSaved remains false", () => {
      const inserted = upsertArticle(db, {
        url: "https://example.com/read-test",
        title: "Read Test",
        contentMarkdown: "Content",
      }).row;
      
      expect(inserted.isRead).toBe(false);
      expect(inserted.isSaved).toBe(false);

      const updated = setArticleRead(db, inserted.id, true);
      expect(updated.isRead).toBe(true);
      expect(updated.isSaved).toBe(false);
    });
  });

  describe("setArticleSaved", () => {
    it("updates isSaved to true while isRead remains false", () => {
      const inserted = upsertArticle(db, {
        url: "https://example.com/save-test",
        title: "Save Test",
        contentMarkdown: "Content",
      }).row;
      
      expect(inserted.isRead).toBe(false);
      expect(inserted.isSaved).toBe(false);

      const updated = setArticleSaved(db, inserted.id, true);
      expect(updated.isSaved).toBe(true);
      expect(updated.isRead).toBe(false);
    });
  });

  describe("purgeOldArticles", () => {
    it("deletes only old, unsaved articles", () => {
      const oldDate = "2020-01-01T00:00:00Z";
      const recentDate = "2024-01-01T00:00:00Z";
      const cutoff = "2022-01-01T00:00:00Z";

      db.insert(articles).values({
        url: "url1", contentMarkdown: "c", isSaved: false, ingestedAt: oldDate
      }).run();
      
      db.insert(articles).values({
        url: "url2", contentMarkdown: "c", isSaved: true, ingestedAt: oldDate
      }).run();
      
      db.insert(articles).values({
        url: "url3", contentMarkdown: "c", isSaved: false, ingestedAt: recentDate
      }).run();
      
      db.insert(articles).values({
        url: "url4", contentMarkdown: "c", isSaved: true, ingestedAt: recentDate
      }).run();

      const deletedCount = purgeOldArticles(db, cutoff);
      expect(deletedCount).toBe(1);

      const remaining = db.select({ url: articles.url }).from(articles).all();
      const urls = remaining.map((r) => r.url);
      expect(urls).not.toContain("url1");
      expect(urls).toContain("url2");
      expect(urls).toContain("url3");
      expect(urls).toContain("url4");
    });
  });
});
