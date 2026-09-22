import { readFileSync, existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";

// Load .env.local if exists
if (existsSync(".env.local")) {
  const content = readFileSync(".env.local", "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const useSupabase =
  process.env.NEXT_PUBLIC_DB_MODE !== "local" &&
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );

function localDb() {
  const db = new DatabaseSync(
    resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/impactquest.db")
  );
  db.exec("PRAGMA foreign_keys = OFF;");
  return db;
}

async function resetSupabase() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabase = createClient(url, key);

  const { data: user } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", "demo@impactquest.local")
    .single();

  if (!user) return;

  await supabase.from("submissions").delete().eq("user_id", user.id);
  await supabase.from("participations").delete().eq("user_id", user.id);
  await supabase.from("reward_redemptions").delete().eq("user_id", user.id);
  await supabase.from("notifications").delete().eq("user_id", user.id);
  await supabase.from("user_badges").delete().eq("user_id", user.id);
  await supabase.from("audit_logs").delete().eq("actor_id", user.id);
  await supabase.from("users").delete().eq("email", "e2e2@impactquest.local");
  await supabase.from("missions").delete().like("title", "%E2E%");
  await supabase.from("rewards").delete().like("title", "%E2E%");

  await supabase
    .from("users")
    .update({ total_xp: 1900, points_balance: 470 })
    .eq("id", user.id);
}

function resetLocal() {
  const db = localDb();
  const user = db.prepare("SELECT id FROM users WHERE email = ?").get("demo@impactquest.local");
  if (!user) {
    db.close();
    return;
  }
  const uid = user.id;
  for (const t of ["submissions", "participations", "reward_redemptions", "notifications", "user_badges"]) {
    db.prepare(`DELETE FROM ${t} WHERE user_id = ?`).run(uid);
  }
  db.prepare("DELETE FROM users WHERE email = ?").run("e2e2@impactquest.local");
  db.prepare("DELETE FROM missions WHERE title LIKE ?").run("%E2E%");
  db.prepare("DELETE FROM rewards WHERE title LIKE ?").run("%E2E%");
  db.prepare("UPDATE users SET total_xp = 1900, points_balance = 470 WHERE id = ?").run(uid);
  db.exec("PRAGMA foreign_keys = ON;");
  db.close();
}

export async function resetDemoUser() {
  if (useSupabase) await resetSupabase();
  else resetLocal();
}

if (process.argv[1]?.endsWith("reset-demo.mjs")) {
  resetDemoUser()
    .then(() => console.log("Demo user reset successfully."))
    .catch(console.error);
}
