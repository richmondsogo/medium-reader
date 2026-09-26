import { describe, it, expect, afterAll } from "vitest";
import { createDb } from "./client";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";

describe("createDb", () => {
  const uniqueId = Math.random().toString(36).substring(7);
  const tempDir = path.join(os.tmpdir(), `medium-reader-test-client-db-${uniqueId}`);

  afterAll(() => {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore EPERM on Windows due to open sqlite file lock
    }
  });

  it("creates parent directory for database file if missing", () => {
    const dbPath = path.join(tempDir, "nested", "subfolder", "test.db");
    
    // Ensure the folder definitely doesn't exist before we start
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore EPERM
    }

    const db = createDb(dbPath);
    
    // If it didn't throw and the file exists, it succeeded
    expect(fs.existsSync(dbPath)).toBe(true);
    expect(db).toBeDefined();
  });
});
