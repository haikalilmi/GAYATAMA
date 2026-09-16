import { randomInt } from "node:crypto";
import { sql } from "./db";
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

export async function listRewards(): Promise<Reward[]> {
  return sql<Reward>(
    "SELECT id, title, description, point_cost, demo_value, stock, status FROM rewards WHERE status = 'ACTIVE' ORDER BY point_cost"
  ).all();
}

export interface Redemption {
  id: string;
  reward_title: string;
  point_cost: number;
  demo_code: string;
  created_at: string;
}

export async function listRedemptions(userId: string): Promise<Redemption[]> {
  return sql<Redemption>(
    `SELECT rr.id, r.title AS reward_title, rr.point_cost, rr.demo_code, rr.created_at
     FROM reward_redemptions rr JOIN rewards r ON r.id = rr.reward_id
     WHERE rr.user_id = ? ORDER BY rr.created_at DESC`,
    userId
  ).all();
}

function genDemoCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "DEMO-";
  for (let i = 0; i < 8; i++) out += chars[randomInt(chars.length)];
  return out;
}

export async function redeemReward(userId: string, rewardId: string): Promise<{ demoCode: string; newBalance: number }> {
  const reward = await sql<{ id: string; title: string; point_cost: number; stock: number; status: string }>(
    "SELECT id, title, point_cost, stock, status FROM rewards WHERE id = ?",
    rewardId
  ).get();
  if (!reward || reward.status !== "ACTIVE") throw new RedeemError("Reward is not available.");
  if (reward.stock <= 0) throw new RedeemError("Reward is out of stock.");
  const user = await sql<{ points_balance: number }>(
    "SELECT points_balance FROM users WHERE id = ?",
    userId
  ).get();
  if (!user) throw new RedeemError("User not found.");
  if (Number(user.points_balance) < reward.point_cost)
    throw new RedeemError(`Not enough points. Need ${reward.point_cost}, balance ${user.points_balance}.`);

  const now = new Date().toISOString();
  const newBalance = Number(user.points_balance) - reward.point_cost;
  let demoCode = "";
  for (let i = 0; i < 5; i++) {
    demoCode = genDemoCode();
    const clash = await sql("SELECT 1 FROM reward_redemptions WHERE demo_code = ?", demoCode).get();
    if (!clash) break;
    demoCode = "";
  }
  if (!demoCode) throw new RedeemError("Failed to generate a code. Please try again.");

  await sql("UPDATE users SET points_balance = ?, updated_at = ? WHERE id = ?", newBalance, now, userId).run();
  await sql(
    "INSERT INTO point_transactions (id, user_id, amount, transaction_type, source_type, source_id, balance_after, description) VALUES (?, ?, ?, 'REWARD_REDEMPTION', 'reward', ?, ?, ?)",
    crypto.randomUUID(), userId, -reward.point_cost, rewardId, newBalance, `Redeem ${reward.title}`
  ).run();
  await sql("UPDATE rewards SET stock = stock - 1, updated_at = ? WHERE id = ?", now, rewardId).run();
  const redemptionId = crypto.randomUUID();
  await sql(
    "INSERT INTO reward_redemptions (id, user_id, reward_id, point_cost, demo_code, status) VALUES (?, ?, ?, ?, ?, 'REDEEMED')",
    redemptionId, userId, rewardId, reward.point_cost, demoCode
  ).run();
  await notify(userId, "REWARD_REDEEMED", `${reward.title} redeemed!`, `Demo code: ${demoCode}.`, "redemption", redemptionId);
  return { demoCode, newBalance };
}
