import { z } from "zod";
import { sql } from "./db";

export interface AdminStats {
  pending: number;
  highRisk: number;
  activeMissions: number;
  verifiedToday: number;
  recentActivity: { id: string; action: string; created_at: string; mission_title: string; user_name: string }[];
  queuePreview: QueueRow[];
}

export interface QueueRow {
  id: string;
  status: string;
  risk_level: string;
  risk_score: number;
  submitted_at: string;
  user_name: string;
  user_email: string;
  mission_title: string;
  mission_slug: string;
}

const REVIEWABLE = ["PENDING", "UNDER_REVIEW"];

export async function getAdminStats(): Promise<AdminStats> {
  const one = async (q: string, ...params: unknown[]) => Number((await sql<{ c: number }>(q, ...params).get())!.c);
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const recentActivity = await sql<AdminStats["recentActivity"][0]>(
    `SELECT vl.id, vl.action, vl.created_at, m.title AS mission_title, u.full_name AS user_name
     FROM verification_logs vl
     JOIN submissions s ON s.id = vl.submission_id
     JOIN missions m ON m.id = s.mission_id
     JOIN users u ON u.id = s.user_id
     ORDER BY vl.created_at DESC LIMIT 5`
  ).all();
  return {
    pending: await one(`SELECT COUNT(*) AS c FROM submissions WHERE status IN ('PENDING','UNDER_REVIEW')`),
    highRisk: await one(
      `SELECT COUNT(*) AS c FROM submissions WHERE risk_level = 'HIGH' AND status IN ('PENDING','UNDER_REVIEW')`
    ),
    activeMissions: await one(`SELECT COUNT(*) AS c FROM missions WHERE status = 'ACTIVE'`),
    verifiedToday: await one(
      `SELECT COUNT(*) AS c FROM submissions WHERE status = 'APPROVED' AND reviewed_at > ?`,
      startOfDay.toISOString()
    ),
    recentActivity,
    queuePreview: (await listSubmissions({ tab: "pending" })).slice(0, 8),
  };
}

const queueFilterSchema = z.object({
  tab: z.enum(["pending", "flagged", "revision", "approved", "rejected", "all"]).optional(),
  risk: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  mission: z.string().max(64).optional(),
  q: z.string().trim().max(100).optional(),
});

export type QueueFilter = z.infer<typeof queueFilterSchema>;

export function parseQueueFilter(input: Record<string, string | string[] | undefined>): QueueFilter {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === "string" && v !== "" && v !== "ALL") flat[k] = v;
  }
  const parsed = queueFilterSchema.safeParse(flat);
  return parsed.success ? parsed.data : {};
}

export async function listSubmissions(filter: QueueFilter): Promise<QueueRow[]> {
  const tab = filter.tab ?? "pending";
  const where: string[] = [];
  const params: (string | number | boolean | null)[] = [];
  let idx = 0;
  if (tab === "pending") {
    where.push(`s.status IN (${REVIEWABLE.map(() => { idx++; return `$${idx}`; }).join(",")})`);
    params.push(...REVIEWABLE);
  } else if (tab === "flagged") {
    where.push("s.risk_level = 'HIGH'");
    where.push(`s.status IN (${REVIEWABLE.map(() => { idx++; return `$${idx}`; }).join(",")})`);
    params.push(...REVIEWABLE);
  } else if (tab === "revision") where.push("s.status = 'REVISION_REQUESTED'");
  else if (tab === "approved") where.push("s.status = 'APPROVED'");
  else if (tab === "rejected") where.push("s.status = 'REJECTED'");
  if (filter.risk) {
    idx++;
    where.push(`s.risk_level = $${idx}`);
    params.push(filter.risk);
  }
  if (filter.mission) {
    idx++;
    where.push(`s.mission_id = $${idx}`);
    params.push(filter.mission);
  }
  if (filter.q) {
    idx++;
    where.push(`(u.full_name LIKE $${idx} OR u.email LIKE $${idx + 1} OR m.title LIKE $${idx + 2})`);
    params.push(`%${filter.q}%`, `%${filter.q}%`, `%${filter.q}%`);
    idx += 2;
  }
  const pgQuery =
    `SELECT s.id, s.status, s.risk_level, s.risk_score, s.submitted_at,
            u.full_name AS user_name, u.email AS user_email,
            m.title AS mission_title, m.slug AS mission_slug
     FROM submissions s
     JOIN users u ON u.id = s.user_id
     JOIN missions m ON m.id = s.mission_id` +
    (where.length > 0 ? ` WHERE ${where.join(" AND ")}` : "") +
    " ORDER BY s.risk_score DESC, s.submitted_at ASC";
  return sql<QueueRow>(pgQuery, ...params).all();
}

export async function listMissionsForFilter(): Promise<{ id: string; title: string }[]> {
  return sql<{ id: string; title: string }>(
    "SELECT id, title FROM missions ORDER BY title"
  ).all();
}
