import { z } from "zod";
import { getDb } from "./db";

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

export function listAllRewards(): RewardRow[] {
  return getDb()
    .prepare("SELECT id, title, point_cost, stock, status FROM rewards ORDER BY point_cost")
    .all() as unknown as RewardRow[];
}

export function getRewardForAdmin(id: string): (RewardForm & { id: string }) | null {
  const row = getDb().prepare("SELECT * FROM rewards WHERE id = ?").get(id) as
    | Record<string, string | number | null>
    | undefined;
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

export function createReward(data: RewardForm): string {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO rewards (id, title, description, point_cost, demo_value, stock, status, is_demo, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`
  ).run(id, data.title, data.description || null, data.point_cost, data.demo_value ?? null, data.stock, data.status, now, now);
  return id;
}

export function updateReward(id: string, data: RewardForm): void {
  const db = getDb();
  const exists = db.prepare("SELECT 1 FROM rewards WHERE id = ?").get(id);
  if (!exists) throw new RewardAdminError("Reward tidak ditemukan.");
  db.prepare(
    "UPDATE rewards SET title = ?, description = ?, point_cost = ?, demo_value = ?, stock = ?, status = ?, updated_at = ? WHERE id = ?"
  ).run(
    data.title, data.description || null, data.point_cost, data.demo_value ?? null,
    data.stock, data.status, new Date().toISOString(), id
  );
}
