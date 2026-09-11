import { z } from "zod";
import { sql } from "./db";

export class RewardAdminError extends Error {}

export const rewardFormSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).optional(),
  point_cost: z.coerce.number().int().min(1).max(1000000),
  demo_value: z.coerce.number().min(0).max(1000000000).optional(),
  stock: z.coerce.number().int().min(0).max(1000000),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type RewardForm = z.infer<typeof rewardFormSchema>;

export interface RewardRow {
  id: string;
  title: string;
  point_cost: number;
  stock: number;
  status: string;
}

export async function listAllRewards(): Promise<RewardRow[]> {
  return sql<RewardRow>(
    "SELECT id, title, point_cost, stock, status FROM rewards ORDER BY point_cost"
  ).all();
}

export async function getRewardForAdmin(id: string): Promise<(RewardForm & { id: string }) | null> {
  const row = await sql<Record<string, string | number | null>>(
    "SELECT * FROM rewards WHERE id = ?",
    id
  ).get();
  if (!row) return null;
  return {
    id: row["id"] as string,
    title: row["title"] as string,
    description: (row["description"] as string | null) ?? undefined,
    point_cost: row["point_cost"] as number,
    demo_value: (row["demo_value"] as number | null) ?? undefined,
    stock: row["stock"] as number,
    status: row["status"] as RewardForm["status"],
  };
}

export async function createReward(data: RewardForm): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await sql(
    `INSERT INTO rewards (id, title, description, point_cost, demo_value, stock, status, is_demo, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, true, ?, ?)`,
    id, data.title, data.description || null, data.point_cost, data.demo_value ?? null, data.stock, data.status, now, now
  ).run();
  return id;
}

export async function updateReward(id: string, data: RewardForm): Promise<void> {
  const exists = await sql("SELECT 1 FROM rewards WHERE id = ?", id).get();
  if (!exists) throw new RewardAdminError("Reward tidak ditemukan.");
  await sql(
    "UPDATE rewards SET title = ?, description = ?, point_cost = ?, demo_value = ?, stock = ?, status = ?, updated_at = ? WHERE id = ?",
    data.title, data.description || null, data.point_cost, data.demo_value ?? null,
    data.stock, data.status, new Date().toISOString(), id
  ).run();
}
