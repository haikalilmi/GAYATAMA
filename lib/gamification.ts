import type { DatabaseSync } from "node:sqlite";
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
export function awardBadges(db: DatabaseSync, userId: string): string[] {
  const rows = db
    .prepare(
      `SELECT m.category AS category, COUNT(*) AS c FROM participations p
       JOIN missions m ON m.id = p.mission_id
       WHERE p.user_id = ? AND p.status = 'APPROVED' GROUP BY m.category`
    )
    .all(userId) as unknown as { category: string; c: number }[];
  const byCat = new Map(rows.map((r) => [r.category, r.c]));
  const total = rows.reduce((a, r) => a + r.c, 0);
  const owned = new Set(
    (
      db.prepare("SELECT badge_id FROM user_badges WHERE user_id = ?").all(userId) as unknown as {
        badge_id: string;
      }[]
    ).map((r) => r.badge_id)
  );
  const unlocked: string[] = [];
  for (const rule of badgeRules) {
    if (!rule.check(byCat, total)) continue;
    const badge = db.prepare("SELECT id FROM badges WHERE slug = ?").get(rule.slug) as
      | { id: string }
      | undefined;
    if (!badge || owned.has(badge.id)) continue;
    db.prepare("INSERT INTO user_badges (id, user_id, badge_id) VALUES (?, ?, ?)").run(
      crypto.randomUUID(),
      userId,
      badge.id
    );
    notify(db, userId, "BADGE_UNLOCKED", `Badge ${rule.name} terbuka!`,
      `Kamu mendapatkan badge ${rule.name}.`, "badge", badge.id);
    unlocked.push(rule.name);
  }
  return unlocked;
}
