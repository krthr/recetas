import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";

let _db: BetterSQLite3Database<typeof schema> | null = null;

export function useDb(): BetterSQLite3Database<typeof schema> {
  if (!_db) {
    const config = useRuntimeConfig();
    const sqlite = new Database(config.dbPath);
    sqlite.pragma("journal_mode = WAL");
    sqlite.pragma("foreign_keys = ON");
    _db = drizzle(sqlite, { schema });
  }
  return _db;
}

// For backward compatibility and convenience in server routes
export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_, prop) {
    return (useDb() as any)[prop];
  },
});
