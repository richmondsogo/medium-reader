import { describe, expect, it } from "vitest";
import { getDb } from "./instance";

describe("getDb", () => {
  it("returns the same cached database instance on consecutive calls", () => {
    const db1 = getDb();
    const db2 = getDb();

    expect(db1).toBeDefined();
    expect(db1).toBe(db2);
  });
});
