import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log("Supabase URL or Key not found, skipping reset.");
  process.exit(0);
}

const supabase = createClient(url, key);

export async function resetDemoUser() {
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

if (process.argv[1]?.endsWith("reset-demo.mjs")) {
  resetDemoUser()
    .then(() => console.log("Demo user reset successfully."))
    .catch(console.error);
}
