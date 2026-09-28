import { env } from "../lib/env";
import { createDb, type DbClient } from "./client";

declare global {
  var __mediumReaderDb: DbClient | undefined;
}

export function getDb(): DbClient {
  if (!globalThis.__mediumReaderDb) {
    globalThis.__mediumReaderDb = createDb(env.DATABASE_PATH);
  }
  return globalThis.__mediumReaderDb;
}
