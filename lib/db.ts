import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase URL or server key. Check the server .env configuration.");
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
  client = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Thin compatibility wrapper. Accepts SQL with `?` placeholders (auto-converted
 *  to `$1,$2,...`) and calls the Postgres `exec_sql` function via RPC. */
export function sql<T = Record<string, unknown>>(
  query: string,
  ...params: unknown[]
) {
  // Convert SQLite-style `?` placeholders to Postgres `$N`
  let idx = 0;
  const pgQuery = query.replace(/\?/g, () => `$${++idx}`);

  async function exec(): Promise<unknown[]> {
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
      const rows = await exec();
      return rows[0] as R | undefined;
    },
    /** Return all rows. */
    async all<R = T>(): Promise<R[]> {
      return (await exec()) as R[];
    },
    /** Execute without returning rows (INSERT / UPDATE / DELETE). */
    async run(): Promise<void> {
      await exec();
    },
  };
}

/** No-op for BEGIN/COMMIT/ROLLBACK. Individual RPC calls are auto-committed.
 *  Multi-statement atomicity is handled by dedicated Postgres functions when
 *  needed. For the competition prototype, sequential execution is acceptable. */
export async function execSql(_statement: string): Promise<void> {
  // Transactions are no-ops in Supabase RPC mode
}

/** Legacy compat – evidence.ts used this to build file paths. */
export function getProjectRoot(): string {
  return process.cwd();
}
