import { sql } from "./db";

export const METRIC_LABELS: Record<string, string> = {
  waste_collected: "Waste Collected (kg)",
  plants_added: "Plants Added",
  books_donated: "Books Donated",
  teaching_hours: "Teaching Hours",
  volunteer_hours: "Volunteer Hours",
  businesses_assisted: "Businesses Assisted",
  people_reached: "People Reached",
};

export interface Portfolio {
  full_name: string;
  total_xp: number;
  points_balance: number;
  verifiedActions: number;
  metrics: { key: string; label: string; value: number }[];
  badges: { name: string; description: string }[];
  recent: { mission_title: string; verified_at: string }[];
}

export async function getUserPortfolio(userId: string): Promise<Portfolio | null> {
  const user = await sql<{ full_name: string; total_xp: number; points_balance: number }>(
    "SELECT full_name, total_xp, points_balance FROM users WHERE id = ?",
    userId
  ).get();
  if (!user) return null;
  const actions = (
    await sql<{ c: number }>(
      "SELECT COUNT(*) AS c FROM participations WHERE user_id = ? AND status = 'APPROVED'",
      userId
    ).get()
  )!;
  const sums = await sql<{ key: string; value: number }>(
    `SELECT mm.metric_key AS key, SUM(si.verified_value) AS value
     FROM submission_impacts si
     JOIN submissions s ON s.id = si.submission_id
     JOIN mission_metrics mm ON mm.id = si.mission_metric_id
     WHERE s.user_id = ? AND s.status = 'APPROVED' AND si.verified_value IS NOT NULL
     GROUP BY mm.metric_key`,
    userId
  ).all();
  const badges = await sql<{ name: string; description: string }>(
    `SELECT b.name, b.description FROM user_badges ub JOIN badges b ON b.id = ub.badge_id
     WHERE ub.user_id = ? ORDER BY ub.earned_at`,
    userId
  ).all();
  const recent = await sql<{ mission_title: string; verified_at: string }>(
    `SELECT m.title AS mission_title, s.reviewed_at AS verified_at FROM submissions s
     JOIN missions m ON m.id = s.mission_id
     WHERE s.user_id = ? AND s.status = 'APPROVED' ORDER BY s.reviewed_at DESC LIMIT 5`,
    userId
  ).all();
  return {
    full_name: user.full_name,
    total_xp: user.total_xp,
    points_balance: user.points_balance,
    verifiedActions: Number(actions.c),
    metrics: sums.map((s) => ({ key: s.key, label: METRIC_LABELS[s.key] ?? s.key, value: Number(s.value) })),
    badges: badges.map((b) => ({ ...b })),
    recent: recent.map((r) => ({ ...r })),
  };
}

export interface CommunityImpact {
  verifiedActions: number;
  contributors: number;
  metrics: { key: string; label: string; value: number }[];
  demoNote: boolean;
}

export async function getCommunityImpact(): Promise<CommunityImpact> {
  const baseRows = await sql<{ metric_key: string; numeric_value: number }>(
    "SELECT metric_key, numeric_value FROM demo_baselines"
  ).all();
  const base = Object.fromEntries(baseRows.map((r) => [r.metric_key, Number(r.numeric_value)]));
  const verified = (
    await sql<{ c: number }>(
      "SELECT COUNT(*) AS c FROM submissions WHERE status = 'APPROVED'"
    ).get()
  )!;
  const contributors = (
    await sql<{ c: number }>(
      "SELECT COUNT(DISTINCT user_id) AS c FROM participations WHERE status = 'APPROVED'"
    ).get()
  )!;
  const sums = await sql<{ key: string; value: number }>(
    `SELECT mm.metric_key AS key, SUM(si.verified_value) AS value
     FROM submission_impacts si
     JOIN submissions s ON s.id = si.submission_id
     JOIN mission_metrics mm ON mm.id = si.mission_metric_id
     WHERE s.status = 'APPROVED' AND si.verified_value IS NOT NULL
     GROUP BY mm.metric_key`
  ).all();
  const keys = ["waste_collected", "plants_added", "books_donated", "teaching_hours", "volunteer_hours", "businesses_assisted", "people_reached"];
  return {
    verifiedActions: (base["verified_actions"] ?? 0) + Number(verified.c),
    contributors: (base["contributors"] ?? 0) + Number(contributors.c),
    metrics: keys.map((k) => ({
      key: k,
      label: METRIC_LABELS[k] ?? k,
      value: (base[k] ?? 0) + (Number(sums.find((s) => s.key === k)?.value) || 0),
    })),
    demoNote: true,
  };
}

export interface LeaderRow {
  full_name: string;
  xp: number;
  isYou: boolean;
}

export async function getLeaderboard(userId: string | null, period: "month" | "all"): Promise<LeaderRow[]> {
  if (period === "all") {
    const rows = await sql<{ id: string; full_name: string; total_xp: number }>(
      "SELECT id, full_name, total_xp FROM users WHERE role = 'USER' ORDER BY total_xp DESC LIMIT 20"
    ).all();
    return rows.map((r) => ({ full_name: r.full_name, xp: Number(r.total_xp), isYou: r.id === userId }));
  }
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const rows = await sql<{ id: string; full_name: string; xp: number }>(
    `SELECT u.id, u.full_name, COALESCE(SUM(x.amount), 0) AS xp FROM users u
     LEFT JOIN xp_transactions x ON x.user_id = u.id
       AND x.created_at > ?
     WHERE u.role = 'USER' GROUP BY u.id, u.full_name ORDER BY xp DESC LIMIT 20`,
    startOfMonth.toISOString()
  ).all();
  return rows.map((r) => ({ full_name: r.full_name, xp: Number(r.xp), isYou: r.id === userId }));
}

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function listNotifications(userId: string): Promise<NotificationRow[]> {
  const rows = await sql<NotificationRow>(
    "SELECT id, type, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30",
    userId
  ).all();
  return rows.map((n) => ({ ...n }));
}

export async function unreadCount(userId: string): Promise<number> {
  const row = await sql<{ c: number }>(
    "SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = false",
    userId
  ).get();
  return Number(row?.c ?? 0);
}

export async function markAllRead(userId: string): Promise<void> {
  await sql("UPDATE notifications SET is_read = true WHERE user_id = ?", userId).run();
}
