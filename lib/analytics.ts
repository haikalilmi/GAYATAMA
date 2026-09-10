import { getDb } from "@/lib/db";
import { getCampaigns } from "@/lib/campaigns";

export interface AnalyticsData {
  verifiedActions: number;
  contributors: number;
  byCategory: { category: string; count: number }[];
  statusCounts: Record<string, number>;
  approvalRate: number;
  campaigns: ReturnType<typeof getCampaigns>;
}

export function getAnalytics(): AnalyticsData {
  const db = getDb();
  const verifiedActions = (db.prepare("SELECT COUNT(*) AS c FROM submissions WHERE status = 'APPROVED'").get() as { c: number }).c;
  const contributors = (
    db.prepare("SELECT COUNT(DISTINCT user_id) AS c FROM participations WHERE status = 'APPROVED'").get() as { c: number }
  ).c;
  const byCategory = db
    .prepare(
      `SELECT m.category AS category, COUNT(*) AS count FROM submissions s
       JOIN missions m ON m.id = s.mission_id
       WHERE s.status = 'APPROVED' GROUP BY m.category ORDER BY count DESC`
    )
    .all() as unknown as AnalyticsData["byCategory"];
  const statuses = db
    .prepare("SELECT status, COUNT(*) AS c FROM submissions GROUP BY status")
    .all() as unknown as { status: string; c: number }[];
  const counts: Record<string, number> = {};
  for (const s of statuses) counts[s.status] = s.c;
  const decided = (counts["APPROVED"] ?? 0) + (counts["REJECTED"] ?? 0);
  return {
    verifiedActions,
    contributors,
    byCategory: byCategory.map((b) => ({ ...b })),
    statusCounts: counts,
    approvalRate: decided === 0 ? 0 : Math.round(((counts["APPROVED"] ?? 0) / decided) * 100),
    campaigns: getCampaigns(),
  };
}
