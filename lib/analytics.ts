import { sql } from "@/lib/db";
import { getCampaigns } from "@/lib/campaigns";

export interface AnalyticsData {
  verifiedActions: number;
  contributors: number;
  byCategory: { category: string; count: number }[];
  statusCounts: Record<string, number>;
  approvalRate: number;
  campaigns: Awaited<ReturnType<typeof getCampaigns>>;
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const verifiedActions = Number(
    (await sql<{ c: number }>("SELECT COUNT(*) AS c FROM submissions WHERE status = 'APPROVED'").get())!.c
  );
  const contributors = Number(
    (await sql<{ c: number }>("SELECT COUNT(DISTINCT user_id) AS c FROM participations WHERE status = 'APPROVED'").get())!.c
  );
  const byCategory = await sql<{ category: string; count: number }>(
    `SELECT m.category AS category, COUNT(*) AS count FROM submissions s
     JOIN missions m ON m.id = s.mission_id
     WHERE s.status = 'APPROVED' GROUP BY m.category ORDER BY count DESC`
  ).all();
  const statuses = await sql<{ status: string; c: number }>(
    "SELECT status, COUNT(*) AS c FROM submissions GROUP BY status"
  ).all();
  const counts: Record<string, number> = {};
  for (const s of statuses) counts[s.status] = Number(s.c);
  const decided = (counts["APPROVED"] ?? 0) + (counts["REJECTED"] ?? 0);
  return {
    verifiedActions,
    contributors,
    byCategory: byCategory.map((b) => ({ category: b.category, count: Number(b.count) })),
    statusCounts: counts,
    approvalRate: decided === 0 ? 0 : Math.round(((counts["APPROVED"] ?? 0) / decided) * 100),
    campaigns: await getCampaigns(),
  };
}
