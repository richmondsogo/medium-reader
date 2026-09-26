import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import path from "node:path";

export function createDb(dbPath: string) {
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  const db = drizzle(sqlite, { schema });

  const migrationsFolder = path.resolve(process.cwd(), "drizzle/migrations");
  migrate(db, { migrationsFolder });

  return db;
}

export type DbClient = ReturnType<typeof createDb>;
