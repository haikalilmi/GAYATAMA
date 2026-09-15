import { randomInt } from "node:crypto";
import { sql } from "./db";

export class JoinError extends Error {}

const ACTIVE_STATUSES = ["JOINED", "SUBMITTED", "UNDER_REVIEW", "REVISION_REQUESTED", "RESUBMITTED"];

export interface Participation {
  id: string;
  mission_id: string;
  proof_code: string;
  status: string;
  joined_at: string;
  expires_at: string;
}

function genProofCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "IQ-";
  for (let i = 0; i < 6; i++) out += chars[randomInt(chars.length)];
  return out;
}

interface MissionRow {
  id: string;
  status: string;
  start_at: string | null;
  end_at: string | null;
  repeat_type: string;
  participation_expiry_hours: number;
}

export async function joinMission(userId: string, userRole: string, missionId: string): Promise<Participation> {
  if (userRole !== "USER") throw new JoinError("Only USER accounts can join missions.");
  const mission = await sql<MissionRow>(
    "SELECT id, status, start_at, end_at, repeat_type, participation_expiry_hours FROM missions WHERE id = ?",
    missionId
  ).get();
  if (!mission) throw new JoinError("Mission not found.");
  if (mission.status !== "ACTIVE") throw new JoinError("The mission is not active and cannot be joined.");

  const now = new Date();
  if (mission.start_at && now < new Date(mission.start_at)) throw new JoinError("The mission has not started yet.");
  if (mission.end_at && now > new Date(mission.end_at)) throw new JoinError("The mission period has ended.");

  // Expire stale entries even when joining directly from a mission page.
  await markExpiredParticipations(userId);

  // Build IN clause with $N
  const ph = ACTIVE_STATUSES.map((_, i) => `$${i + 3}`).join(",");
  const dup = await sql(
    `SELECT 1 FROM participations WHERE user_id = $1 AND mission_id = $2
     AND status IN (${ph})`,
    userId, missionId, ...ACTIVE_STATUSES
  ).get();
  if (dup) throw new JoinError("You already joined this mission. Complete or cancel it first.");

  if (mission.repeat_type === "ONCE") {
    const done = await sql(
      "SELECT 1 FROM participations WHERE user_id = ? AND mission_id = ? AND status = 'APPROVED'",
      userId, missionId
    ).get();
    if (done) throw new JoinError("This mission can only be completed once.");
  }
  if (mission.repeat_type === "WEEKLY") {
    const last = await sql<{ completed_at: string }>(
      `SELECT completed_at FROM participations WHERE user_id = ? AND mission_id = ?
       AND status = 'APPROVED' AND rewarded = true ORDER BY completed_at DESC LIMIT 1`,
      userId, missionId
    ).get();
    if (last) {
      const next = new Date(last.completed_at).getTime() + 7 * 86400000;
      if (Date.now() < next) {
        const days = Math.ceil((next - Date.now()) / 86400000);
        throw new JoinError(`This weekly mission can be joined again in ${days} days.`);
      }
    }
  }

  const joinedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + mission.participation_expiry_hours * 3600000).toISOString();
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = crypto.randomUUID();
    const proofCode = genProofCode();
    try {
      await sql(
        "INSERT INTO participations (id, user_id, mission_id, proof_code, status, joined_at, expires_at) VALUES (?, ?, ?, ?, 'JOINED', ?, ?)",
        id, userId, missionId, proofCode, joinedAt, expiresAt
      ).run();
      return { id, mission_id: missionId, proof_code: proofCode, status: "JOINED", joined_at: joinedAt, expires_at: expiresAt };
    } catch {
      // kemungkinan tabrakan kode, coba lagi
    }
  }
  throw new JoinError("Failed to create participation. Please try again.");
}

export async function getUserParticipation(userId: string, missionId: string): Promise<Participation | null> {
  const row = await sql<Participation>(
    `SELECT id, mission_id, proof_code, status, joined_at, expires_at FROM participations
     WHERE user_id = ? AND mission_id = ? ORDER BY created_at DESC LIMIT 1`,
    userId, missionId
  ).get();
  return row ?? null;
}

export interface ParticipationRow extends Participation {
  mission_title: string;
  mission_slug: string;
  submission_id: string | null;
}

export async function markExpiredParticipations(userId: string): Promise<void> {
  await sql(
    `UPDATE participations SET status = 'EXPIRED', updated_at = NOW()
     WHERE user_id = ? AND status = 'JOINED' AND expires_at < NOW()`,
    userId
  ).run();
}

export async function listUserParticipations(userId: string): Promise<ParticipationRow[]> {
  await markExpiredParticipations(userId);
  return sql<ParticipationRow>(
    `SELECT p.id, p.mission_id, p.proof_code, p.status, p.joined_at, p.expires_at,
            m.title AS mission_title, m.slug AS mission_slug, s.id AS submission_id
     FROM participations p JOIN missions m ON m.id = p.mission_id
     LEFT JOIN submissions s ON s.participation_id = p.id
     WHERE p.user_id = ? ORDER BY p.created_at DESC`,
    userId
  ).all();
}

export async function cancelParticipation(userId: string, participationId: string): Promise<void> {
  const row = await sql<{ user_id: string; status: string }>(
    "SELECT user_id, status FROM participations WHERE id = ?",
    participationId
  ).get();
  if (!row || row.user_id !== userId) throw new JoinError("Participation not found.");
  if (row.status !== "JOINED") throw new JoinError("Only JOINED participations can be cancelled.");
  await sql(
    `UPDATE participations SET status = 'CANCELLED', cancelled_at = NOW(),
     updated_at = NOW() WHERE id = ?`,
    participationId
  ).run();
}
