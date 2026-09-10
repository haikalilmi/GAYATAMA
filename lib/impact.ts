import { getDb } from "./db";

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

export function getUserPortfolio(userId: string): Portfolio | null {
  const db = getDb();
  const user = db.prepare("SELECT full_name, total_xp, points_balance FROM users WHERE id = ?").get(userId) as
    | { full_name: string; total_xp: number; points_balance: number }
    | undefined;
  if (!user) return null;
  const actions = (
    db.prepare("SELECT COUNT(*) AS c FROM participations WHERE user_id = ? AND status = 'APPROVED'").get(userId) as {
      c: number;
    }
  ).c;
  const sums = db
    .prepare(
      `SELECT mm.metric_key AS key, SUM(si.verified_value) AS value
       FROM submission_impacts si
       JOIN submissions s ON s.id = si.submission_id
       JOIN mission_metrics mm ON mm.id = si.mission_metric_id
       WHERE s.user_id = ? AND s.status = 'APPROVED' AND si.verified_value IS NOT NULL
       GROUP BY mm.metric_key`
    )
    .all(userId) as unknown as { key: string; value: number }[];
  const badges = db
    .prepare(
      `SELECT b.name, b.description FROM user_badges ub JOIN badges b ON b.id = ub.badge_id
       WHERE ub.user_id = ? ORDER BY ub.earned_at`
    )
    .all(userId) as unknown as Portfolio["badges"];
  const recent = db
    .prepare(
      `SELECT m.title AS mission_title, s.reviewed_at AS verified_at FROM submissions s
       JOIN missions m ON m.id = s.mission_id
       WHERE s.user_id = ? AND s.status = 'APPROVED' ORDER BY s.reviewed_at DESC LIMIT 5`
    )
    .all(userId) as unknown as Portfolio["recent"];
  return {
    full_name: user.full_name,
    total_xp: user.total_xp,
    points_balance: user.points_balance,
    verifiedActions: actions,
    metrics: sums.map((s) => ({ key: s.key, label: METRIC_LABELS[s.key] ?? s.key, value: s.value })),
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

export function getCommunityImpact(): CommunityImpact {
  const db = getDb();
  const base = Object.fromEntries(
    (db.prepare("SELECT metric_key, numeric_value FROM demo_baselines").all() as unknown as {
      metric_key: string;
      numeric_value: number;
    }[]).map((r) => [r.metric_key, r.numeric_value])
  );
  const verified = (
    db.prepare("SELECT COUNT(*) AS c FROM submissions WHERE status = 'APPROVED'").get() as { c: number }
  ).c;
  const contributors = (
    db.prepare("SELECT COUNT(DISTINCT user_id) AS c FROM participations WHERE status = 'APPROVED'").get() as {
      c: number;
    }
  ).c;
  const sums = db
    .prepare(
      `SELECT mm.metric_key AS key, SUM(si.verified_value) AS value
       FROM submission_impacts si
       JOIN submissions s ON s.id = si.submission_id
       JOIN mission_metrics mm ON mm.id = si.mission_metric_id
       WHERE s.status = 'APPROVED' AND si.verified_value IS NOT NULL
       GROUP BY mm.metric_key`
    )
    .all() as unknown as { key: string; value: number }[];
  const keys = ["waste_collected", "plants_added", "books_donated", "teaching_hours", "volunteer_hours", "businesses_assisted", "people_reached"];
  return {
    verifiedActions: (base["verified_actions"] ?? 0) + verified,
    contributors: (base["contributors"] ?? 0) + contributors,
    metrics: keys.map((k) => ({
      key: k,
      label: METRIC_LABELS[k] ?? k,
      value: (base[k] ?? 0) + (sums.find((s) => s.key === k)?.value ?? 0),
    })),
    demoNote: true,
  };
}

export interface LeaderRow {
  full_name: string;
  xp: number;
  isYou: boolean;
}

export function getLeaderboard(userId: string | null, period: "month" | "all"): LeaderRow[] {
  const db = getDb();
  if (period === "all") {
    const rows = db
      .prepare("SELECT id, full_name, total_xp FROM users WHERE role = 'USER' ORDER BY total_xp DESC LIMIT 20")
      .all() as unknown as { id: string; full_name: string; total_xp: number }[];
    return rows.map((r) => ({ full_name: r.full_name, xp: r.total_xp, isYou: r.id === userId }));
  }
  const rows = db
    .prepare(
      `SELECT u.id, u.full_name, COALESCE(SUM(x.amount), 0) AS xp FROM users u
       LEFT JOIN xp_transactions x ON x.user_id = u.id
         AND x.created_at > strftime('%Y-%m-%dT00:00:00Z','now','start of month')
       WHERE u.role = 'USER' GROUP BY u.id ORDER BY xp DESC LIMIT 20`
    )
    .all() as unknown as { id: string; full_name: string; xp: number }[];
  return rows.map((r) => ({ full_name: r.full_name, xp: r.xp, isYou: r.id === userId }));
}

export interface NotificationRow {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: number;
  created_at: string;
}

export function listNotifications(userId: string): NotificationRow[] {
  return (
    getDb()
      .prepare("SELECT id, type, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30")
      .all(userId) as unknown as NotificationRow[]
  ).map((n) => ({ ...n }));
}

export function unreadCount(userId: string): number {
  return (
    getDb().prepare("SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND is_read = 0").get(userId) as {
      c: number;
    }
  ).c;
}

export function markAllRead(userId: string): void {
  getDb().prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?").run(userId);
}
