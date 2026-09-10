import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

let db: DatabaseSync | null = null;

export function getDbPath(): string {
  return resolve(
    /*turbopackIgnore: true*/ process.cwd(),
    process.env.DATABASE_PATH ?? "data/impactquest.db"
  );
}

export function getDb(): DatabaseSync {
  if (db) return db;
  const path = getDbPath();
  mkdirSync(dirname(path), { recursive: true });
  db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  return db;
}

export function dbExists(): boolean {
  return existsSync(getDbPath());
}
