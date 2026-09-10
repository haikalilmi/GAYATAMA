import { randomInt } from "node:crypto";
import { getDb } from "./db";

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

export function joinMission(userId: string, userRole: string, missionId: string): Participation {
  if (userRole !== "USER") throw new JoinError("Hanya akun USER yang bisa ikut misi.");
  const db = getDb();
  const mission = db
    .prepare("SELECT id, status, start_at, end_at, repeat_type, participation_expiry_hours FROM missions WHERE id = ?")
    .get(missionId) as MissionRow | undefined;
  if (!mission) throw new JoinError("Misi tidak ditemukan.");
  if (mission.status !== "ACTIVE") throw new JoinError("Misi tidak aktif dan tidak bisa diikuti.");

  const now = new Date();
  if (mission.start_at && now < new Date(mission.start_at)) throw new JoinError("Misi belum dimulai.");
  if (mission.end_at && now > new Date(mission.end_at)) throw new JoinError("Masa misi sudah berakhir.");

  const dup = db
    .prepare(
      `SELECT 1 FROM participations WHERE user_id = ? AND mission_id = ?
       AND status IN (${ACTIVE_STATUSES.map(() => "?").join(",")})`
    )
    .get(userId, missionId, ...ACTIVE_STATUSES);
  if (dup) throw new JoinError("Kamu sudah ikut misi ini. Selesaikan atau batalkan dulu.");

  if (mission.repeat_type === "ONCE") {
    const done = db
      .prepare("SELECT 1 FROM participations WHERE user_id = ? AND mission_id = ? AND status = 'APPROVED'")
      .get(userId, missionId);
    if (done) throw new JoinError("Misi ini hanya bisa diselesaikan sekali.");
  }
  if (mission.repeat_type === "WEEKLY") {
    const last = db
      .prepare(
        `SELECT completed_at FROM participations WHERE user_id = ? AND mission_id = ?
         AND status = 'APPROVED' AND rewarded = 1 ORDER BY completed_at DESC LIMIT 1`
      )
      .get(userId, missionId) as { completed_at: string } | undefined;
    if (last) {
      const next = new Date(last.completed_at).getTime() + 7 * 86400000;
      if (Date.now() < next) {
        const days = Math.ceil((next - Date.now()) / 86400000);
        throw new JoinError(`Misi mingguan ini bisa diikuti lagi dalam ${days} hari.`);
      }
    }
  }

  const joinedAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + mission.participation_expiry_hours * 3600000).toISOString();
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = crypto.randomUUID();
    const proofCode = genProofCode();
    try {
      db.prepare(
        "INSERT INTO participations (id, user_id, mission_id, proof_code, status, joined_at, expires_at) VALUES (?, ?, ?, ?, 'JOINED', ?, ?)"
      ).run(id, userId, missionId, proofCode, joinedAt, expiresAt);
      return { id, mission_id: missionId, proof_code: proofCode, status: "JOINED", joined_at: joinedAt, expires_at: expiresAt };
    } catch {
      // kemungkinan tabrakan kode, coba lagi
    }
  }
  throw new JoinError("Gagal membuat partisipasi. Coba lagi.");
}

export function getUserParticipation(userId: string, missionId: string): Participation | null {
  const row = getDb()
    .prepare(
      `SELECT id, mission_id, proof_code, status, joined_at, expires_at FROM participations
       WHERE user_id = ? AND mission_id = ? ORDER BY created_at DESC LIMIT 1`
    )
    .get(userId, missionId) as Participation | undefined;
  return row ?? null;
}

export interface ParticipationRow extends Participation {
  mission_title: string;
  mission_slug: string;
  submission_id: string | null;
}

export function markExpiredParticipations(userId: string): void {
  getDb()
    .prepare(
      `UPDATE participations SET status = 'EXPIRED', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       WHERE user_id = ? AND status = 'JOINED' AND expires_at < strftime('%Y-%m-%dT%H:%M:%fZ','now')`
    )
    .run(userId);
}

export function listUserParticipations(userId: string): ParticipationRow[] {
  markExpiredParticipations(userId);
  return getDb()
    .prepare(
      `SELECT p.id, p.mission_id, p.proof_code, p.status, p.joined_at, p.expires_at,
              m.title AS mission_title, m.slug AS mission_slug, s.id AS submission_id
       FROM participations p JOIN missions m ON m.id = p.mission_id
       LEFT JOIN submissions s ON s.participation_id = p.id
       WHERE p.user_id = ? ORDER BY p.created_at DESC`
    )
    .all(userId) as unknown as ParticipationRow[];
}

export function cancelParticipation(userId: string, participationId: string): void {
  const db = getDb();
  const row = db
    .prepare("SELECT user_id, status FROM participations WHERE id = ?")
    .get(participationId) as { user_id: string; status: string } | undefined;
  if (!row || row.user_id !== userId) throw new JoinError("Partisipasi tidak ditemukan.");
  if (row.status !== "JOINED") throw new JoinError("Hanya partisipasi JOINED yang bisa dibatalkan.");
  db.prepare(
    `UPDATE participations SET status = 'CANCELLED', cancelled_at = strftime('%Y-%m-%dT%H:%M:%fZ','now'),
     updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
  ).run(participationId);
}
