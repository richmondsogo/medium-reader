import { describe, it, expect, beforeEach } from "vitest";
import { createDb, type DbClient } from "./client";
import { isEmailProcessed, markEmailProcessed } from "./processedEmails";

describe("db/processedEmails", () => {
  let db: DbClient;

  beforeEach(() => {
    db = createDb(":memory:");
  });

  it("isEmailProcessed is false before, true after markEmailProcessed", () => {
    expect(isEmailProcessed(db, "msg-123")).toBe(false);
    
    markEmailProcessed(db, "msg-123", 5);
    
    expect(isEmailProcessed(db, "msg-123")).toBe(true);
  });

  it("marking the same messageId twice doesn't throw (idempotent)", () => {
    markEmailProcessed(db, "msg-123", 5);
    expect(() => {
      markEmailProcessed(db, "msg-123", 5);
    }).not.toThrow();
  });
});
