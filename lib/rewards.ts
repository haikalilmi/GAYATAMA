import { randomInt } from "node:crypto";
import { getDb } from "./db";
import { notify } from "./notifications";

export class RedeemError extends Error {}

export interface Reward {
  id: string;
  title: string;
  description: string | null;
  point_cost: number;
  demo_value: number | null;
  stock: number;
  status: string;
}

export function listRewards(): Reward[] {
  return getDb()
    .prepare(
      "SELECT id, title, description, point_cost, demo_value, stock, status FROM rewards WHERE status = 'ACTIVE' ORDER BY point_cost"
    )
    .all() as unknown as Reward[];
}

export interface Redemption {
  id: string;
  reward_title: string;
  point_cost: number;
  demo_code: string;
  created_at: string;
}

export function listRedemptions(userId: string): Redemption[] {
  return getDb()
    .prepare(
      `SELECT rr.id, r.title AS reward_title, rr.point_cost, rr.demo_code, rr.created_at
       FROM reward_redemptions rr JOIN rewards r ON r.id = rr.reward_id
       WHERE rr.user_id = ? ORDER BY rr.created_at DESC`
    )
    .all(userId) as unknown as Redemption[];
}

function genDemoCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "DEMO-";
  for (let i = 0; i < 8; i++) out += chars[randomInt(chars.length)];
  return out;
}

export function redeemReward(userId: string, rewardId: string): { demoCode: string; newBalance: number } {
  const db = getDb();
  db.exec("BEGIN");
  try {
    const reward = db
      .prepare("SELECT id, title, point_cost, stock, status FROM rewards WHERE id = ?")
      .get(rewardId) as
      | { id: string; title: string; point_cost: number; stock: number; status: string }
      | undefined;
    if (!reward || reward.status !== "ACTIVE") throw new RedeemError("Reward tidak tersedia.");
    if (reward.stock <= 0) throw new RedeemError("Stok reward habis.");
    const user = db.prepare("SELECT points_balance FROM users WHERE id = ?").get(userId) as
      | { points_balance: number }
      | undefined;
    if (!user) throw new RedeemError("User tidak ditemukan.");
    if (user.points_balance < reward.point_cost)
      throw new RedeemError(`Poin kurang. Butuh ${reward.point_cost}, saldo ${user.points_balance}.`);

    const now = new Date().toISOString();
    const newBalance = user.points_balance - reward.point_cost;
    let demoCode = "";
    for (let i = 0; i < 5; i++) {
      demoCode = genDemoCode();
      const clash = db.prepare("SELECT 1 FROM reward_redemptions WHERE demo_code = ?").get(demoCode);
      if (!clash) break;
      demoCode = "";
    }
    if (!demoCode) throw new RedeemError("Gagal buat kode. Coba lagi.");

    db.prepare("UPDATE users SET points_balance = ?, updated_at = ? WHERE id = ?").run(newBalance, now, userId);
    db.prepare(
      "INSERT INTO point_transactions (id, user_id, amount, transaction_type, source_type, source_id, balance_after, description) VALUES (?, ?, ?, 'REWARD_REDEMPTION', 'reward', ?, ?, ?)"
    ).run(crypto.randomUUID(), userId, -reward.point_cost, rewardId, newBalance, `Tukar ${reward.title}`);
    db.prepare("UPDATE rewards SET stock = stock - 1, updated_at = ? WHERE id = ?").run(now, rewardId);
    const redemptionId = crypto.randomUUID();
    db.prepare(
      "INSERT INTO reward_redemptions (id, user_id, reward_id, point_cost, demo_code, status) VALUES (?, ?, ?, ?, ?, 'REDEEMED')"
    ).run(redemptionId, userId, rewardId, reward.point_cost, demoCode);
    notify(db, userId, "REWARD_REDEEMED", `${reward.title} ditukar!`, `Kode demo: ${demoCode}.`, "redemption", redemptionId);
    db.exec("COMMIT");
    return { demoCode, newBalance };
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // abaikan
    }
    throw e;
  }
}
