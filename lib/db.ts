import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { isSupabaseMode } from "./mode";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (supabaseClient) return supabaseClient;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing Supabase URL or server key. Either set the Supabase env or run in dummy mode (unset NEXT_PUBLIC_SUPABASE_URL, or NEXT_PUBLIC_DB_MODE=local) with `npm run db:setup`."
    );
  }
  let role: unknown;
  try {
    role = JSON.parse(Buffer.from(supabaseKey.split(".")[1] ?? "", "base64url").toString()).role;
  } catch {
    // New Supabase secret keys are opaque rather than JWTs.
  }
  if (!supabaseKey.startsWith("sb_secret_") && role !== "service_role") {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be a server secret or service_role key, not an anon/public key.");
  }
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return supabaseClient;
}

// ---- Lokal SQLite (mode dummy, nol env) ----

let sqliteDb: DatabaseSync | null = null;

function getSqlite(): DatabaseSync {
  if (sqliteDb) return sqliteDb;
  const override = process.env.DATABASE_PATH;
  const dbPath = override
    ? resolve(/*turbopackIgnore: true*/ process.cwd(), override)
    : join(process.cwd(), "data", "impactquest.db");
  mkdirSync(dirname(dbPath), { recursive: true });
  sqliteDb = new DatabaseSync(dbPath);
  sqliteDb.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  return sqliteDb;
}

/** Postgres `$N` -> SQLite `?`. Aman: query di repo ini tidak memakai `$` di literal. */
function toSqlitePlaceholders(query: string): string {
  return query.replace(/\$(\d+)/g, "?");
}

/** node:sqlite hanya menerima null/number/bigint/string/Buffer. */
function normalizeParam(p: unknown): SQLInputValue {
  if (typeof p === "boolean") return p ? 1 : 0;
  if (p === undefined) return null;
  return p as SQLInputValue;
}

const SELECT_RE = /^\s*(select|with|values|pragma|explain)\b/i;

/** Wrapper ganda: Supabase RPC bila env Supabase ada, SQLite lokal bila tidak.
 *  Menerima `?` maupun `$N` agar call site lama tidak perlu diubah. */
export function sql<T = Record<string, unknown>>(
  query: string,
  ...params: unknown[]
) {
  if (!isSupabaseMode()) {
    const sqliteQuery = toSqlitePlaceholders(query);
    const args = params.map(normalizeParam);
    const isSelect = SELECT_RE.test(sqliteQuery);

    async function execLocal(): Promise<unknown[]> {
      const stmt = getSqlite().prepare(sqliteQuery);
      if (isSelect) return (stmt.all(...args) ?? []) as unknown[];
      stmt.run(...args);
      return [];
    }

    return {
      async get<R = T>(): Promise<R | undefined> {
        return (await execLocal())[0] as R | undefined;
      },
      async all<R = T>(): Promise<R[]> {
        return (await execLocal()) as R[];
      },
      async run(): Promise<void> {
        await execLocal();
      },
    };
  }

  // Mode Supabase: konversi `?` ke `$N`, lanjutkan penomoran setelah `$N` yang sudah ada.
  let idx = 0;
  for (const m of query.match(/\$(\d+)/g) ?? []) {
    idx = Math.max(idx, Number.parseInt(m.slice(1), 10));
  }
  const pgQuery = query.replace(/\?/g, () => `$${++idx}`);

  async function execRemote(): Promise<unknown[]> {
    const { data, error } = await getSupabase().rpc("exec_sql", {
      query_text: pgQuery,
      params: params as unknown as Record<string, unknown>,
    });
    if (error) throw new Error(`SQL Error: ${error.message}\nQuery: ${pgQuery}`);
    const rows = (data ?? []) as unknown[];
    // The deployed legacy RPC catches SQL exceptions and returns them as rows.
    // Never report such a write as successful or expose its embedded parameters.
    if (rows.some((row) => row && typeof row === "object" && "error" in row && "modified_sql" in row)) {
      throw new Error("SQL execution failed. Check the database schema and constraints.");
    }
    return rows;
  }

  return {
    /** Return the first row or undefined. */
    async get<R = T>(): Promise<R | undefined> {
      const rows = await execRemote();
      return rows[0] as R | undefined;
    },
    /** Return all rows. */
    async all<R = T>(): Promise<R[]> {
      return (await execRemote()) as R[];
    },
    /** Execute without returning rows (INSERT / UPDATE / DELETE). */
    async run(): Promise<void> {
      await execRemote();
    },
  };
}

/** No-op for BEGIN/COMMIT/ROLLBACK. Individual calls are auto-committed in both modes.
 *  For the competition prototype, sequential execution is acceptable. */
export async function execSql(_statement: string): Promise<void> {
  // Transactions are no-ops in both modes
}

/** Legacy compat – evidence.ts used this to build file paths. */
export function getProjectRoot(): string {
  return process.cwd();
}
