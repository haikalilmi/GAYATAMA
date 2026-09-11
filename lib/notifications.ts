import { sql } from "./db";

export type NotificationType =
  | "MISSION_VERIFIED"
  | "REVISION_REQUESTED"
  | "MISSION_REJECTED"
  | "BADGE_UNLOCKED"
  | "LEVEL_UP"
  | "REWARD_REDEEMED";

export async function notify(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  referenceType?: string,
  referenceId?: string
): Promise<void> {
  await sql(
    `INSERT INTO notifications (id, user_id, type, title, message, reference_type, reference_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    crypto.randomUUID(), userId, type, title, message, referenceType ?? null, referenceId ?? null
  ).run();
}
