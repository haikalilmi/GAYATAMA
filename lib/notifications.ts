import type { DatabaseSync } from "node:sqlite";

export type NotificationType =
  | "MISSION_VERIFIED"
  | "REVISION_REQUESTED"
  | "MISSION_REJECTED"
  | "BADGE_UNLOCKED"
  | "LEVEL_UP"
  | "REWARD_REDEEMED";

export function notify(
  db: DatabaseSync,
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  referenceType?: string,
  referenceId?: string
): void {
  db.prepare(
    `INSERT INTO notifications (id, user_id, type, title, message, reference_type, reference_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(crypto.randomUUID(), userId, type, title, message, referenceType ?? null, referenceId ?? null);
}
