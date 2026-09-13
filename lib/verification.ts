import { sql } from "./db";
import { awardBadges, calculateLevel } from "./gamification";
import { notify } from "./notifications";
import { REJECTION_REASONS } from "./review-constants";

export { REJECTION_REASONS };
export class VerificationError extends Error {}

const REVIEWABLE = ["PENDING", "UNDER_REVIEW"];

export interface ReviewData {
  submission: {
    id: string; status: string; description: string | null;
    proof_code_input: string | null; partner_code_input: string | null;
    risk_score: number; risk_level: string;
    risk_flags: { type: string; severity: string; message: string }[];
    revision_count: number; submitted_at: string; reviewed_at: string | null;
  };
  user: { id: string; full_name: string; email: string; total_xp: number; points_balance: number };
  mission: { id: string; title: string; xp_reward: number; point_reward: number };
  participation: { id: string; proof_code: string; status: string };
  impacts: { metric_id: string; name: string; unit: string; reported_value: number; verified_value: number | null }[];
  evidence: { id: string; evidence_type: string; mime_type: string }[];
  history: { approved: number; rejected: number };
  logs: { action: string; reason: string | null; note: string | null; created_at: string }[];
}

export async function getReviewData(submissionId: string): Promise<ReviewData | null> {
  const s = await sql<Record<string, string | number | null>>(
    `SELECT s.id, s.user_id, s.mission_id, s.participation_id, s.status, s.description,
            s.proof_code_input, s.partner_code_input, s.risk_score, s.risk_level, s.risk_flags,
            s.revision_count, s.submitted_at, s.reviewed_at,
            u.full_name, u.email, u.total_xp, u.points_balance,
            m.title AS mission_title, m.xp_reward, m.point_reward,
            p.proof_code, p.status AS part_status
     FROM submissions s
     JOIN users u ON u.id = s.user_id
     JOIN missions m ON m.id = s.mission_id
     JOIN participations p ON p.id = s.participation_id
     WHERE s.id = ?`,
    submissionId
  ).get();
  if (!s) return null;
  let riskFlags: ReviewData["submission"]["risk_flags"] = [];
  try {
    const rf = s["risk_flags"] as string;
    riskFlags = (typeof rf === "string" ? JSON.parse(rf) : rf) as ReviewData["submission"]["risk_flags"];
  } catch {
    riskFlags = [];
  }
  const impacts = await sql<ReviewData["impacts"][0]>(
    `SELECT si.mission_metric_id AS metric_id, mm.name, mm.unit, si.reported_value, si.verified_value
     FROM submission_impacts si JOIN mission_metrics mm ON mm.id = si.mission_metric_id
     WHERE si.submission_id = ?`,
    submissionId
  ).all();
  const evidence = await sql<ReviewData["evidence"][0]>(
    "SELECT id, evidence_type, mime_type FROM submission_evidence WHERE submission_id = ?",
    submissionId
  ).all();
  const hist = await sql<{ status: string; c: number }>(
    `SELECT status, COUNT(*) AS c FROM participations WHERE user_id = ? AND status IN ('APPROVED','REJECTED') GROUP BY status`,
    s["user_id"] as string
  ).all();
  const logs = await sql<ReviewData["logs"][0]>(
    "SELECT action, reason, note, created_at FROM verification_logs WHERE submission_id = ? ORDER BY created_at",
    submissionId
  ).all();
  return {
    submission: {
      id: s["id"] as string, status: s["status"] as string,
      description: s["description"] as string | null,
      proof_code_input: s["proof_code_input"] as string | null,
      partner_code_input: s["partner_code_input"] as string | null,
      risk_score: s["risk_score"] as number, risk_level: s["risk_level"] as string,
      risk_flags: riskFlags, revision_count: s["revision_count"] as number,
      submitted_at: s["submitted_at"] as string, reviewed_at: s["reviewed_at"] as string | null,
    },
    user: {
      id: s["user_id"] as string, full_name: s["full_name"] as string, email: s["email"] as string,
      total_xp: s["total_xp"] as number, points_balance: s["points_balance"] as number,
    },
    mission: { id: s["mission_id"] as string, title: s["mission_title"] as string, xp_reward: s["xp_reward"] as number, point_reward: s["point_reward"] as number },
    participation: { id: s["participation_id"] as string, proof_code: s["proof_code"] as string, status: s["part_status"] as string },
    impacts: impacts.map((m) => ({ ...m })),
    evidence: evidence.map((e) => ({ ...e })),
    history: {
      approved: Number(hist.find((h) => h.status === "APPROVED")?.c ?? 0),
      rejected: Number(hist.find((h) => h.status === "REJECTED")?.c ?? 0),
    },
    logs: logs.map((l) => ({ ...l })),
  };
}

async function writeLog(
  submissionId: string,
  verifierId: string,
  action: string,
  prev: string | null,
  next: string,
  reason?: string,
  note?: string
): Promise<void> {
  await sql(
    `INSERT INTO verification_logs (id, submission_id, verifier_id, action, reason, note, previous_status, new_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    crypto.randomUUID(), submissionId, verifierId, action, reason ?? null, note ?? null, prev, next
  ).run();
}

export async function startReview(verifierId: string, submissionId: string): Promise<void> {
  const s = await sql<{ status: string; participation_id: string }>(
    "SELECT status, participation_id FROM submissions WHERE id = ?",
    submissionId
  ).get();
  if (!s) throw new VerificationError("Submission tidak ditemukan.");
  if (s.status !== "PENDING") throw new VerificationError("Hanya PENDING yang bisa mulai review.");
  const now = new Date().toISOString();
  await sql("UPDATE submissions SET status = 'UNDER_REVIEW', updated_at = ? WHERE id = ?", now, submissionId).run();
  await sql("UPDATE participations SET status = 'UNDER_REVIEW', updated_at = ? WHERE id = ?", now, s.participation_id).run();
  await writeLog(submissionId, verifierId, "START_REVIEW", "PENDING", "UNDER_REVIEW");
}

export interface ApprovalResult {
  already: boolean;
  xp: number;
  points: number;
  leveledUp: boolean;
  newLevel: string;
  badges: string[];
}

export async function approveSubmission(
  verifierId: string,
  submissionId: string,
  verifiedValues: Record<string, number>
): Promise<ApprovalResult> {
  const now = new Date().toISOString();
  const s = await sql<{ id: string; user_id: string; mission_id: string; participation_id: string; status: string }>(
    "SELECT id, user_id, mission_id, participation_id, status FROM submissions WHERE id = ?",
    submissionId
  ).get();
  if (!s) throw new VerificationError("Submission tidak ditemukan.");
  if (s.status === "APPROVED") {
    const u = await sql<{ total_xp: number }>("SELECT total_xp FROM users WHERE id = ?", s.user_id).get();
    return { already: true, xp: 0, points: 0, leveledUp: false, newLevel: calculateLevel(u!.total_xp).title, badges: [] };
  }
  if (!REVIEWABLE.includes(s.status))
    throw new VerificationError("Hanya submission dalam review yang bisa disetujui.");

  const mission = await sql<{ xp_reward: number; point_reward: number }>(
    "SELECT xp_reward, point_reward FROM missions WHERE id = ?",
    s.mission_id
  ).get();
  if (!mission) throw new VerificationError("Misi tidak ditemukan.");

  const metrics = await sql<{ id: string }>(
    "SELECT id FROM mission_metrics WHERE mission_id = ?",
    s.mission_id
  ).all();
  for (const m of metrics) {
    const v = verifiedValues[m.id] ?? (m.id === "e0000000-0000-0000-0000-000000000001" ? verifiedValues["mm-waste"] : undefined) ?? (m.id === "e0000000-0000-0000-0000-000000000002" ? verifiedValues["mm-plant"] : undefined);
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1000000000)
      throw new VerificationError("Nilai verified impact wajib angka ≥ 0.");
    await sql(
      "UPDATE submission_impacts SET verified_value = ?, updated_at = ? WHERE submission_id = ? AND mission_metric_id = ?",
      v, now, submissionId, m.id
    ).run();
  }

  await sql("UPDATE submissions SET status = 'APPROVED', reviewed_at = ?, updated_at = ? WHERE id = ?", now, now, submissionId).run();
  await sql(
    "UPDATE participations SET status = 'APPROVED', completed_at = ?, rewarded = true, updated_at = ? WHERE id = ?",
    now, now, s.participation_id
  ).run();

  // Idempotent: lewati grant bila transaksi reward sudah ada.
  const hasXp = await sql(
    "SELECT 1 FROM xp_transactions WHERE user_id = ? AND transaction_type = 'MISSION_REWARD' AND source_id = ?",
    s.user_id, submissionId
  ).get();
  let xp = 0;
  let points = 0;
  if (!hasXp) {
    const before = (await sql<{ total_xp: number; points_balance: number }>(
      "SELECT total_xp, points_balance FROM users WHERE id = ?",
      s.user_id
    ).get())!;
    xp = mission.xp_reward;
    points = mission.point_reward;
    const newXp = Number(before.total_xp) + xp;
    const newBal = Number(before.points_balance) + points;
    await sql(
      "INSERT INTO xp_transactions (id, user_id, amount, transaction_type, source_type, source_id, description) VALUES (?, ?, ?, 'MISSION_REWARD', 'submission', ?, ?)",
      crypto.randomUUID(), s.user_id, xp, submissionId, `Reward misi ${submissionId}`
    ).run();
    await sql("UPDATE users SET total_xp = ?, updated_at = ? WHERE id = ?", newXp, now, s.user_id).run();
    await sql(
      "INSERT INTO point_transactions (id, user_id, amount, transaction_type, source_type, source_id, balance_after, description) VALUES (?, ?, ?, 'MISSION_REWARD', 'submission', ?, ?, ?)",
      crypto.randomUUID(), s.user_id, points, submissionId, newBal, `Reward misi ${submissionId}`
    ).run();
    await sql("UPDATE users SET points_balance = ?, updated_at = ? WHERE id = ?", newBal, now, s.user_id).run();

    await notify(s.user_id, "MISSION_VERIFIED", "Misi terverifikasi!",
      `Kamu dapat +${xp} XP dan +${points} Impact Points.`, "submission", submissionId);
    const leveled = calculateLevel(newXp).title !== calculateLevel(Number(before.total_xp)).title;
    if (leveled) {
      await notify(s.user_id, "LEVEL_UP", `Naik level: ${calculateLevel(newXp).title}!`,
        `Total XP kamu ${newXp}.`, "submission", submissionId);
    }
  }

  const badges = await awardBadges(s.user_id);
  await writeLog(submissionId, verifierId, "APPROVE", s.status, "APPROVED");

  const after = (await sql<{ total_xp: number }>("SELECT total_xp FROM users WHERE id = ?", s.user_id).get())!;
  return {
    already: false, xp, points,
    leveledUp: xp > 0 && calculateLevel(Number(after.total_xp)).title !== calculateLevel(Number(after.total_xp) - xp).title,
    newLevel: calculateLevel(Number(after.total_xp)).title,
    badges,
  };
}

export async function rejectSubmission(verifierId: string, submissionId: string, reason: string, note?: string): Promise<void> {
  if (!(REJECTION_REASONS as readonly string[]).includes(reason))
    throw new VerificationError("Alasan penolakan tidak valid.");
  const now = new Date().toISOString();
  const s = await sql<{ user_id: string; participation_id: string; status: string }>(
    "SELECT user_id, participation_id, status FROM submissions WHERE id = ?",
    submissionId
  ).get();
  if (!s) throw new VerificationError("Submission tidak ditemukan.");
  if (!REVIEWABLE.includes(s.status)) throw new VerificationError("Hanya submission dalam review yang bisa ditolak.");
  await sql("UPDATE submissions SET status = 'REJECTED', reviewed_at = ?, updated_at = ? WHERE id = ?", now, now, submissionId).run();
  await sql("UPDATE participations SET status = 'REJECTED', updated_at = ? WHERE id = ?", now, s.participation_id).run();
  await writeLog(submissionId, verifierId, "REJECT", s.status, "REJECTED", reason, note);
  await notify(s.user_id, "MISSION_REJECTED", "Submission ditolak.", note ?? reason, "submission", submissionId);
}

export async function requestRevision(verifierId: string, submissionId: string, note: string): Promise<void> {
  if (!note.trim()) throw new VerificationError("Catatan revisi wajib diisi.");
  const now = new Date().toISOString();
  const s = await sql<{ user_id: string; participation_id: string; status: string; revision_count: number }>(
    "SELECT user_id, participation_id, status, revision_count FROM submissions WHERE id = ?",
    submissionId
  ).get();
  if (!s) throw new VerificationError("Submission tidak ditemukan.");
  if (!REVIEWABLE.includes(s.status)) throw new VerificationError("Hanya submission dalam review yang bisa direvisi.");
  if (s.revision_count >= 1) throw new VerificationError("Revisi hanya boleh sekali.");
  await sql(
    "UPDATE submissions SET status = 'REVISION_REQUESTED', revision_count = 1, reviewed_at = ?, updated_at = ? WHERE id = ?",
    now, now, submissionId
  ).run();
  await sql("UPDATE participations SET status = 'REVISION_REQUESTED', updated_at = ? WHERE id = ?", now, s.participation_id).run();
  await writeLog(submissionId, verifierId, "REQUEST_REVISION", s.status, "REVISION_REQUESTED", undefined, note);
  await notify(s.user_id, "REVISION_REQUESTED", "Perlu revisi.", note, "submission", submissionId);
}
