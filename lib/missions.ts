import { z } from "zod";
import { sql } from "./db";
import { categories, difficulties, missionTypes } from "./mission-constants";

export { categories, difficulties, missionTypes };
const filterSchema = z.object({
  category: z.enum(categories).optional(),
  difficulty: z.enum(difficulties).optional(),
  mission_type: z.enum(missionTypes).optional(),
  q: z.string().trim().max(100).optional(),
});

export type MissionFilter = z.infer<typeof filterSchema>;

export function parseMissionFilter(input: Record<string, string | string[] | undefined>): MissionFilter {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === "string" && v !== "" && v !== "ALL") flat[k] = v;
  }
  const parsed = filterSchema.safeParse(flat);
  return parsed.success ? parsed.data : {};
}

export interface MissionCard {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  category: string;
  difficulty: string;
  mission_type: string;
  xp_reward: number;
  point_reward: number;
}

export async function listMissions(filter: MissionFilter): Promise<MissionCard[]> {
  const where = ["status = 'ACTIVE'"];
  const params: (string | number | boolean | null)[] = [];
  let idx = 0;
  if (filter.category) {
    idx++;
    where.push(`category = $${idx}`);
    params.push(filter.category);
  }
  if (filter.difficulty) {
    idx++;
    where.push(`difficulty = $${idx}`);
    params.push(filter.difficulty);
  }
  if (filter.mission_type) {
    idx++;
    where.push(`mission_type = $${idx}`);
    params.push(filter.mission_type);
  }
  if (filter.q) {
    idx++;
    where.push(`(title ILIKE $${idx} OR short_description ILIKE $${idx + 1})`);
    params.push(`%${filter.q}%`, `%${filter.q}%`);
    idx++;
  }
  // Use $N directly since we built them manually
  const pgQuery = `SELECT id, title, slug, short_description, category, difficulty, mission_type, xp_reward, point_reward
     FROM missions WHERE ${where.join(" AND ")} ORDER BY title`;
  return sql<MissionCard>(pgQuery, ...params).all();
}

export interface MissionMetric {
  name: string;
  metric_key: string;
  unit: string;
}

export interface MissionDetail extends MissionCard {
  description: string;
  repeat_type: string;
  participation_expiry_hours: number;
  requires_before_photo: boolean;
  requires_after_photo: boolean;
  requires_description: boolean;
  requires_proof_code: boolean;
  requires_partner_code: boolean;
  sdg_codes: string;
  metrics: MissionMetric[];
}

export async function getMissionBySlug(slug: string): Promise<MissionDetail | null> {
  const row = await sql<Omit<MissionDetail, "metrics">>(
    `SELECT id, title, slug, short_description, description, category, difficulty, mission_type,
            xp_reward, point_reward, repeat_type, participation_expiry_hours,
            requires_before_photo, requires_after_photo, requires_description,
            requires_proof_code, requires_partner_code, sdg_codes
     FROM missions WHERE slug = ? AND status = 'ACTIVE'`,
    slug
  ).get();
  if (!row) return null;
  const metrics = await sql<MissionMetric>(
    "SELECT name, metric_key, unit FROM mission_metrics WHERE mission_id = ? ORDER BY display_order",
    row.id
  ).all();
  return { ...row, metrics };
}

// ---- Admin ----

export class MissionAdminError extends Error {}

export const missionFormSchema = z.object({
  title: z.string().trim().min(3).max(120),
  short_description: z.string().trim().min(3).max(300),
  description: z.string().trim().min(3).max(5000),
  category: z.enum(categories),
  difficulty: z.enum(difficulties),
  mission_type: z.enum(missionTypes),
  xp_reward: z.coerce.number().int().min(0).max(100000),
  point_reward: z.coerce.number().int().min(0).max(100000),
  repeat_type: z.enum(["ONCE", "WEEKLY", "REPEATABLE"]),
  participation_expiry_hours: z.coerce.number().int().min(1).max(720),
  requires_before_photo: z.coerce.number().int().min(0).max(1).default(0),
  requires_after_photo: z.coerce.number().int().min(0).max(1).default(0),
  requires_description: z.coerce.number().int().min(0).max(1).default(1),
  requires_proof_code: z.coerce.number().int().min(0).max(1).default(0),
  requires_partner_code: z.coerce.number().int().min(0).max(1).default(0),
  metric1_name: z.string().trim().max(80).optional(),
  metric1_key: z.string().trim().max(40).optional(),
  metric1_unit: z.string().trim().max(20).optional(),
  metric2_name: z.string().trim().max(80).optional(),
  metric2_key: z.string().trim().max(40).optional(),
  metric2_unit: z.string().trim().max(20).optional(),
});

export type MissionForm = z.infer<typeof missionFormSchema>;

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "misi";
}

export async function listAllMissions(): Promise<(MissionCard & { status: string })[]> {
  return sql<MissionCard & { status: string }>(
    "SELECT id, title, slug, short_description, category, difficulty, mission_type, xp_reward, point_reward, status FROM missions ORDER BY created_at DESC"
  ).all();
}

export async function getMissionForAdmin(id: string): Promise<(MissionForm & { id: string; slug: string; status: string }) | null> {
  const row = await sql<Record<string, string | number | boolean | null>>(
    "SELECT * FROM missions WHERE id = ?",
    id
  ).get();
  if (!row) return null;
  const metrics = await sql<{ name: string; metric_key: string; unit: string }>(
    "SELECT name, metric_key, unit FROM mission_metrics WHERE mission_id = ? ORDER BY display_order LIMIT 2",
    id
  ).all();
  return {
    id: row["id"] as string,
    slug: row["slug"] as string,
    status: row["status"] as string,
    title: row["title"] as string,
    short_description: row["short_description"] as string,
    description: row["description"] as string,
    category: row["category"] as MissionForm["category"],
    difficulty: row["difficulty"] as MissionForm["difficulty"],
    mission_type: row["mission_type"] as MissionForm["mission_type"],
    xp_reward: row["xp_reward"] as number,
    point_reward: row["point_reward"] as number,
    repeat_type: row["repeat_type"] as MissionForm["repeat_type"],
    participation_expiry_hours: row["participation_expiry_hours"] as number,
    requires_before_photo: row["requires_before_photo"] ? 1 : 0,
    requires_after_photo: row["requires_after_photo"] ? 1 : 0,
    requires_description: row["requires_description"] ? 1 : 0,
    requires_proof_code: row["requires_proof_code"] ? 1 : 0,
    requires_partner_code: row["requires_partner_code"] ? 1 : 0,
    metric1_name: metrics[0]?.name,
    metric1_key: metrics[0]?.metric_key,
    metric1_unit: metrics[0]?.unit,
    metric2_name: metrics[1]?.name,
    metric2_key: metrics[1]?.metric_key,
    metric2_unit: metrics[1]?.unit,
  };
}

function collectMetrics(data: MissionForm): { name: string; key: string; unit: string }[] {
  const out: { name: string; key: string; unit: string }[] = [];
  const groups: [string | undefined, string | undefined, string | undefined][] = [
    [data.metric1_name, data.metric1_key, data.metric1_unit],
    [data.metric2_name, data.metric2_key, data.metric2_unit],
  ];
  groups.forEach(([name, key, unit], i) => {
    if (name || key || unit) {
      if (!name || !key) throw new MissionAdminError(`Metric ${i + 1} needs a name and key.`);
      if (!/^[a-z0-9_]+$/.test(key))
        throw new MissionAdminError(`Metric key ${i + 1} may only contain lowercase letters, numbers, and underscores.`);
      out.push({ name, key, unit: unit ?? "" });
    }
  });
  return out;
}

export async function createMission(data: MissionForm): Promise<string> {
  let slug = slugify(data.title);
  const existing = await sql("SELECT 1 FROM missions WHERE slug = ?", slug).get();
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;
  const metrics = collectMetrics(data);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await sql(
    `INSERT INTO missions (id, title, slug, short_description, description, category, difficulty, mission_type,
      xp_reward, point_reward, repeat_type, participation_expiry_hours,
      requires_before_photo, requires_after_photo, requires_description, requires_proof_code, requires_partner_code,
      sdg_codes, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', 'DRAFT', ?, ?)`,
    id, data.title, slug, data.short_description, data.description, data.category, data.difficulty,
    data.mission_type, data.xp_reward, data.point_reward, data.repeat_type, data.participation_expiry_hours,
    !!data.requires_before_photo, !!data.requires_after_photo, !!data.requires_description,
    !!data.requires_proof_code, !!data.requires_partner_code, now, now
  ).run();
  for (let i = 0; i < metrics.length; i++) {
    const m = metrics[i];
    await sql(
      "INSERT INTO mission_metrics (id, mission_id, name, metric_key, unit, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      crypto.randomUUID(), id, m.name, m.key, m.unit, i
    ).run();
  }
  return id;
}

export async function updateMission(id: string, data: MissionForm): Promise<void> {
  const exists = await sql("SELECT 1 FROM missions WHERE id = ?", id).get();
  if (!exists) throw new MissionAdminError("Mission not found.");
  const metrics = collectMetrics(data);
  const now = new Date().toISOString();
  await sql(
    `UPDATE missions SET title = ?, short_description = ?, description = ?, category = ?, difficulty = ?,
      mission_type = ?, xp_reward = ?, point_reward = ?, repeat_type = ?, participation_expiry_hours = ?,
      requires_before_photo = ?, requires_after_photo = ?, requires_description = ?,
      requires_proof_code = ?, requires_partner_code = ?, updated_at = ? WHERE id = ?`,
    data.title, data.short_description, data.description, data.category, data.difficulty,
    data.mission_type, data.xp_reward, data.point_reward, data.repeat_type, data.participation_expiry_hours,
    !!data.requires_before_photo, !!data.requires_after_photo, !!data.requires_description,
    !!data.requires_proof_code, !!data.requires_partner_code, now, id
  ).run();
  await sql("DELETE FROM mission_metrics WHERE mission_id = ?", id).run();
  for (let i = 0; i < metrics.length; i++) {
    const m = metrics[i];
    await sql(
      "INSERT INTO mission_metrics (id, mission_id, name, metric_key, unit, display_order) VALUES (?, ?, ?, ?, ?, ?)",
      crypto.randomUUID(), id, m.name, m.key, m.unit, i
    ).run();
  }
}

const STATUS_FLOW: Record<string, string[]> = {
  DRAFT: ["ACTIVE"],
  ACTIVE: ["PAUSED", "ENDED"],
  PAUSED: ["ACTIVE", "ENDED"],
  ENDED: [],
};

export async function setMissionStatus(id: string, next: string): Promise<void> {
  const row = await sql<{ status: string }>("SELECT status FROM missions WHERE id = ?", id).get();
  if (!row) throw new MissionAdminError("Mission not found.");
  if (!(STATUS_FLOW[row.status] ?? []).includes(next))
    throw new MissionAdminError(`Transition ${row.status} to ${next} is not allowed.`);
  await sql("UPDATE missions SET status = ?, updated_at = ? WHERE id = ?", next, new Date().toISOString(), id).run();
}

export function statusActions(status: string): string[] {
  return STATUS_FLOW[status] ?? [];
}
