import { sql } from "./db";
import { calculateLevel } from "./level";
import { notify } from "./notifications";

// Kembalikan title level dari total XP. Level tak disimpan (RULE-072).
export { calculateLevel };

const badgeRules: { slug: string; name: string; check: (byCat: Map<string, number>, total: number) => boolean }[] = [
  { slug: "eco-starter", name: "Eco Starter", check: (c) => (c.get("ENVIRONMENT") ?? 0) >= 1 },
  { slug: "eco-guardian", name: "Eco Guardian", check: (c) => (c.get("ENVIRONMENT") ?? 0) >= 5 },
  { slug: "knowledge-giver", name: "Knowledge Giver", check: (c) => (c.get("EDUCATION") ?? 0) >= 1 },
  { slug: "digital-helper", name: "Digital Helper", check: (c) => (c.get("DIGITAL") ?? 0) >= 1 },
  { slug: "community-builder", name: "Community Builder", check: (c) => (c.get("COMMUNITY") ?? 0) >= 1 },
  { slug: "verified-contributor", name: "Verified Contributor", check: (_c, t) => t >= 10 },
];

// Panggil di dalam transaksi approval. Kembalikan nama badge baru.
export async function awardBadges(userId: string): Promise<string[]> {
  const rows = await sql<{ category: string; c: number }>(
    `SELECT m.category AS category, COUNT(*) AS c FROM participations p
     JOIN missions m ON m.id = p.mission_id
     WHERE p.user_id = ? AND p.status = 'APPROVED' GROUP BY m.category`,
    userId
  ).all();
  const byCat = new Map(rows.map((r) => [r.category, Number(r.c)]));
  const total = rows.reduce((a, r) => a + Number(r.c), 0);
  const ownedRows = await sql<{ badge_id: string }>(
    "SELECT badge_id FROM user_badges WHERE user_id = ?",
    userId
  ).all();
  const owned = new Set(ownedRows.map((r) => r.badge_id));
  const unlocked: string[] = [];
  for (const rule of badgeRules) {
    if (!rule.check(byCat, total)) continue;
    const badge = await sql<{ id: string }>(
      "SELECT id FROM badges WHERE slug = ?",
      rule.slug
    ).get();
    if (!badge || owned.has(badge.id)) continue;
    await sql(
      "INSERT INTO user_badges (id, user_id, badge_id) VALUES (?, ?, ?)",
      crypto.randomUUID(),
      userId,
      badge.id
    ).run();
    await notify(userId, "BADGE_UNLOCKED", `Badge ${rule.name} terbuka!`,
      `Kamu mendapatkan badge ${rule.name}.`, "badge", badge.id);
    unlocked.push(rule.name);
  }
  return unlocked;
}
