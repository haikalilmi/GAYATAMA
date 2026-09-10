import { getDb } from "./db";
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

export function getReviewData(submissionId: string): ReviewData | null {
  const db = getDb();
  const s = db
    .prepare(
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
       WHERE s.id = ?`
    )
    .get(submissionId) as Record<string, string | number | null> | undefined;
  if (!s) return null;
  let riskFlags: ReviewData["submission"]["risk_flags"] = [];
  try {
    riskFlags = JSON.parse((s["risk_flags"] as string) ?? "[]") as ReviewData["submission"]["risk_flags"];
  } catch {
    riskFlags = [];
  }
  const impacts = db
    .prepare(
      `SELECT si.mission_metric_id AS metric_id, mm.name, mm.unit, si.reported_value, si.verified_value
       FROM submission_impacts si JOIN mission_metrics mm ON mm.id = si.mission_metric_id
       WHERE si.submission_id = ?`
    )
    .all(submissionId) as unknown as ReviewData["impacts"];
  const evidence = db
    .prepare("SELECT id, evidence_type, mime_type FROM submission_evidence WHERE submission_id = ?")
    .all(submissionId) as unknown as ReviewData["evidence"];
  const hist = db
    .prepare(
      `SELECT status, COUNT(*) AS c FROM participations WHERE user_id = ? AND status IN ('APPROVED','REJECTED') GROUP BY status`
    )
    .all(s["user_id"] as string) as unknown as { status: string; c: number }[];
  const logs = db
    .prepare("SELECT action, reason, note, created_at FROM verification_logs WHERE submission_id = ? ORDER BY created_at")
    .all(submissionId) as unknown as ReviewData["logs"];
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
      approved: hist.find((h) => h.status === "APPROVED")?.c ?? 0,
      rejected: hist.find((h) => h.status === "REJECTED")?.c ?? 0,
    },
    logs: logs.map((l) => ({ ...l })),
  };
}

function writeLog(
  db: ReturnType<typeof getDb>,
  submissionId: string,
  verifierId: string,
  action: string,
  prev: string | null,
  next: string,
  reason?: string,
  note?: string
): void {
  db.prepare(
    `INSERT INTO verification_logs (id, submission_id, verifier_id, action, reason, note, previous_status, new_status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(crypto.randomUUID(), submissionId, verifierId, action, reason ?? null, note ?? null, prev, next);
}

export function startReview(verifierId: string, submissionId: string): void {
  const db = getDb();
  const s = db.prepare("SELECT status, participation_id FROM submissions WHERE id = ?").get(submissionId) as
    | { status: string; participation_id: string }
    | undefined;
  if (!s) throw new VerificationError("Submission tidak ditemukan.");
  if (s.status !== "PENDING") throw new VerificationError("Hanya PENDING yang bisa mulai review.");
  const now = new Date().toISOString();
  db.exec("BEGIN");
  try {
    db.prepare("UPDATE submissions SET status = 'UNDER_REVIEW', updated_at = ? WHERE id = ?").run(now, submissionId);
    db.prepare("UPDATE participations SET status = 'UNDER_REVIEW', updated_at = ? WHERE id = ?").run(now, s.participation_id);
    writeLog(db, submissionId, verifierId, "START_REVIEW", "PENDING", "UNDER_REVIEW");
    db.exec("COMMIT");
  } catch (e) {
    try { db.exec("ROLLBACK"); } catch { /* abaikan */ }
    throw e;
  }
}

export interface ApprovalResult {
  already: boolean;
  xp: number;
  points: number;
  leveledUp: boolean;
  newLevel: string;
  badges: string[];
}

export function approveSubmission(
  verifierId: string,
  submissionId: string,
  verifiedValues: Record<string, number>
): ApprovalResult {
  const db = getDb();
  const now = new Date().toISOString();
  db.exec("BEGIN");
  try {
    const s = db
      .prepare("SELECT id, user_id, mission_id, participation_id, status FROM submissions WHERE id = ?")
      .get(submissionId) as
      | { id: string; user_id: string; mission_id: string; participation_id: string; status: string }
      | undefined;
    if (!s) throw new VerificationError("Submission tidak ditemukan.");
    if (s.status === "APPROVED") {
      db.exec("COMMIT");
      const u = db.prepare("SELECT total_xp FROM users WHERE id = ?").get(s.user_id) as { total_xp: number };
      return { already: true, xp: 0, points: 0, leveledUp: false, newLevel: calculateLevel(u.total_xp).title, badges: [] };
    }
    if (!REVIEWABLE.includes(s.status))
      throw new VerificationError("Hanya submission dalam review yang bisa disetujui.");

    const mission = db.prepare("SELECT xp_reward, point_reward FROM missions WHERE id = ?").get(s.mission_id) as
      | { xp_reward: number; point_reward: number }
      | undefined;
    if (!mission) throw new VerificationError("Misi tidak ditemukan.");

    const metrics = db.prepare("SELECT id FROM mission_metrics WHERE mission_id = ?").all(s.mission_id) as unknown as {
      id: string;
    }[];
    for (const m of metrics) {
      const v = verifiedValues[m.id];
      if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1000000000)
        throw new VerificationError("Nilai verified impact wajib angka ≥ 0.");
      db.prepare("UPDATE submission_impacts SET verified_value = ?, updated_at = ? WHERE submission_id = ? AND mission_metric_id = ?").run(
        v, now, submissionId, m.id
      );
    }

    db.prepare("UPDATE submissions SET status = 'APPROVED', reviewed_at = ?, updated_at = ? WHERE id = ?").run(now, now, submissionId);
    db.prepare("UPDATE participations SET status = 'APPROVED', completed_at = ?, rewarded = 1, updated_at = ? WHERE id = ?").run(
      now, now, s.participation_id
    );

    // Idempotent: lewati grant bila transaksi reward sudah ada.
    const hasXp = db
      .prepare("SELECT 1 FROM xp_transactions WHERE user_id = ? AND transaction_type = 'MISSION_REWARD' AND source_id = ?")
      .get(s.user_id, submissionId);
    let xp = 0;
    let points = 0;
    if (!hasXp) {
      const before = db.prepare("SELECT total_xp, points_balance FROM users WHERE id = ?").get(s.user_id) as {
        total_xp: number;
        points_balance: number;
      };
      xp = mission.xp_reward;
      points = mission.point_reward;
      const newXp = before.total_xp + xp;
      const newBal = before.points_balance + points;
      db.prepare(
        "INSERT INTO xp_transactions (id, user_id, amount, transaction_type, source_type, source_id, description) VALUES (?, ?, ?, 'MISSION_REWARD', 'submission', ?, ?)"
      ).run(crypto.randomUUID(), s.user_id, xp, submissionId, `Reward misi ${submissionId}`);
      db.prepare("UPDATE users SET total_xp = ?, updated_at = ? WHERE id = ?").run(newXp, now, s.user_id);
      db.prepare(
        "INSERT INTO point_transactions (id, user_id, amount, transaction_type, source_type, source_id, balance_after, description) VALUES (?, ?, ?, 'MISSION_REWARD', 'submission', ?, ?, ?)"
      ).run(crypto.randomUUID(), s.user_id, points, submissionId, newBal, `Reward misi ${submissionId}`);
      db.prepare("UPDATE users SET points_balance = ?, updated_at = ? WHERE id = ?").run(newBal, now, s.user_id);

      notify(db, s.user_id, "MISSION_VERIFIED", "Misi terverifikasi!",
        `Kamu dapat +${xp} XP dan +${points} Impact Points.`, "submission", submissionId);
      const leveled = calculateLevel(newXp).title !== calculateLevel(before.total_xp).title;
      if (leveled) {
        notify(db, s.user_id, "LEVEL_UP", `Naik level: ${calculateLevel(newXp).title}!`,
          `Total XP kamu ${newXp}.`, "submission", submissionId);
      }
    }

    const badges = awardBadges(db, s.user_id);
    writeLog(db, submissionId, verifierId, "APPROVE", s.status, "APPROVED");
    db.exec("COMMIT");

    const after = db.prepare("SELECT total_xp FROM users WHERE id = ?").get(s.user_id) as { total_xp: number };
    return {
      already: false, xp, points,
      leveledUp: xp > 0 && calculateLevel(after.total_xp).title !== calculateLevel(after.total_xp - xp).title,
      newLevel: calculateLevel(after.total_xp).title,
      badges,
    };
  } catch (e) {
    try { db.exec("ROLLBACK"); } catch { /* abaikan */ }
    throw e;
  }
}

export function rejectSubmission(verifierId: string, submissionId: string, reason: string, note?: string): void {
  if (!(REJECTION_REASONS as readonly string[]).includes(reason))
    throw new VerificationError("Alasan penolakan tidak valid.");
  const db = getDb();
  const now = new Date().toISOString();
  db.exec("BEGIN");
  try {
    const s = db
      .prepare("SELECT user_id, participation_id, status FROM submissions WHERE id = ?")
      .get(submissionId) as { user_id: string; participation_id: string; status: string } | undefined;
    if (!s) throw new VerificationError("Submission tidak ditemukan.");
    if (!REVIEWABLE.includes(s.status)) throw new VerificationError("Hanya submission dalam review yang bisa ditolak.");
    db.prepare("UPDATE submissions SET status = 'REJECTED', reviewed_at = ?, updated_at = ? WHERE id = ?").run(now, now, submissionId);
    db.prepare("UPDATE participations SET status = 'REJECTED', updated_at = ? WHERE id = ?").run(now, s.participation_id);
    writeLog(db, submissionId, verifierId, "REJECT", s.status, "REJECTED", reason, note);
    notify(db, s.user_id, "MISSION_REJECTED", "Submission ditolak.", note ?? reason, "submission", submissionId);
    db.exec("COMMIT");
  } catch (e) {
    try { db.exec("ROLLBACK"); } catch { /* abaikan */ }
    throw e;
  }
}

export function requestRevision(verifierId: string, submissionId: string, note: string): void {
  if (!note.trim()) throw new VerificationError("Catatan revisi wajib diisi.");
  const db = getDb();
  const now = new Date().toISOString();
  db.exec("BEGIN");
  try {
    const s = db
      .prepare("SELECT user_id, participation_id, status, revision_count FROM submissions WHERE id = ?")
      .get(submissionId) as
      | { user_id: string; participation_id: string; status: string; revision_count: number }
      | undefined;
    if (!s) throw new VerificationError("Submission tidak ditemukan.");
    if (!REVIEWABLE.includes(s.status)) throw new VerificationError("Hanya submission dalam review yang bisa direvisi.");
    if (s.revision_count >= 1) throw new VerificationError("Revisi hanya boleh sekali.");
    db.prepare(
      "UPDATE submissions SET status = 'REVISION_REQUESTED', revision_count = 1, reviewed_at = ?, updated_at = ? WHERE id = ?"
    ).run(now, now, submissionId);
    db.prepare("UPDATE participations SET status = 'REVISION_REQUESTED', updated_at = ? WHERE id = ?").run(
      now, s.participation_id
    );
    writeLog(db, submissionId, verifierId, "REQUEST_REVISION", s.status, "REVISION_REQUESTED", undefined, note);
    notify(db, s.user_id, "REVISION_REQUESTED", "Perlu revisi.", note, "submission", submissionId);
    db.exec("COMMIT");
  } catch (e) {
    try { db.exec("ROLLBACK"); } catch { /* abaikan */ }
    throw e;
  }
}
