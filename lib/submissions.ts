import { rmSync } from "node:fs";
import { z } from "zod";
import { getDb } from "./db";
import { EvidenceError, evidenceAbsPath, storeEvidenceFile } from "./evidence";
import { calculateSubmissionRisk } from "./risk";

export class SubmitError extends Error {}

const textSchema = z.object({
  description: z.string().trim().max(2000).optional(),
  proof_code_input: z.string().trim().max(32).optional(),
  partner_code_input: z.string().trim().max(64).optional(),
});

export interface SubmitFiles {
  before?: File;
  after?: File;
}

export async function submitEvidence(
  userId: string,
  participationId: string,
  form: { description?: string; proof_code_input?: string; partner_code_input?: string; metrics: Record<string, number> },
  files: SubmitFiles
): Promise<{ submissionId: string }> {
  const db = getDb();
  const part = db
    .prepare("SELECT id, user_id, mission_id, proof_code, status, expires_at FROM participations WHERE id = ?")
    .get(participationId) as
    | { id: string; user_id: string; mission_id: string; proof_code: string; status: string; expires_at: string }
    | undefined;
  if (!part || part.user_id !== userId) throw new SubmitError("Partisipasi tidak ditemukan.");
  if (part.status !== "JOINED") throw new SubmitError("Partisipasi ini sudah disubmit atau selesai.");
  if (new Date(part.expires_at) < new Date()) {
    db.prepare("UPDATE participations SET status = 'EXPIRED' WHERE id = ?").run(participationId);
    throw new SubmitError("Masa partisipasi kedaluwarsa.");
  }
  const mission = db
    .prepare(
      `SELECT id, requires_before_photo, requires_after_photo, requires_description,
              requires_proof_code, requires_partner_code FROM missions WHERE id = ?`
    )
    .get(part.mission_id) as
    | {
        id: string;
        requires_before_photo: number;
        requires_after_photo: number;
        requires_description: number;
        requires_proof_code: number;
        requires_partner_code: number;
      }
    | undefined;
  if (!mission) throw new SubmitError("Misi tidak ditemukan.");

  const parsed = textSchema.safeParse({
    description: form.description,
    proof_code_input: form.proof_code_input,
    partner_code_input: form.partner_code_input,
  });
  if (!parsed.success) throw new SubmitError(parsed.error.issues[0]?.message ?? "Input tidak valid.");
  const { description, proof_code_input, partner_code_input } = parsed.data;

  if (mission.requires_description && !description)
    throw new SubmitError("Deskripsi kegiatan wajib diisi.");
  let proofInvalid = false;
  if (mission.requires_proof_code) {
    if (!proof_code_input) throw new SubmitError("Kode bukti wajib diisi.");
    if (proof_code_input !== part.proof_code) throw new SubmitError("Kode bukti salah.");
  } else if (proof_code_input && proof_code_input !== part.proof_code) {
    // Kode diisi padahal tak wajib dan salah: jangan tolak, tandai risiko.
    proofInvalid = true;
  }
  if (mission.requires_partner_code && !partner_code_input)
    throw new SubmitError("Kode partner/acara wajib diisi.");
  if (mission.requires_before_photo && !files.before)
    throw new SubmitError("Foto sebelum wajib diunggah.");
  if (mission.requires_after_photo && !files.after)
    throw new SubmitError("Foto sesudah wajib diunggah.");

  const metrics = db
    .prepare("SELECT id, metric_key FROM mission_metrics WHERE mission_id = ?")
    .all(mission.id) as unknown as { id: string; metric_key: string }[];
  const reported = new Map<string, number>();
  for (const m of metrics) {
    const v = form.metrics[m.id];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1000000000)
      throw new SubmitError(`Nilai ${m.metric_key} wajib angka ≥ 0.`);
    reported.set(m.id, v);
  }

  const existing = db
    .prepare("SELECT 1 FROM submissions WHERE participation_id = ?")
    .get(participationId);
  if (existing) throw new SubmitError("Partisipasi ini sudah disubmit.");

  const submissionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const stored: { type: string; meta: Awaited<ReturnType<typeof storeEvidenceFile>> }[] = [];
  try {
    if (files.before)
      stored.push({ type: "BEFORE_PHOTO", meta: await storeEvidenceFile(files.before, userId, submissionId) });
    if (files.after)
      stored.push({ type: "AFTER_PHOTO", meta: await storeEvidenceFile(files.after, userId, submissionId) });
  } catch (e) {
    if (e instanceof EvidenceError) throw new SubmitError(e.message);
    throw e;
  }

  db.exec("BEGIN");
  try {
    const risk = calculateSubmissionRisk(db, {
      userId,
      proofInvalid,
      fileHashes: stored.map((s) => s.meta.file_hash),
    });
    db.prepare(
      `INSERT INTO submissions (id, participation_id, user_id, mission_id, description,
        proof_code_input, partner_code_input, status, risk_score, risk_level, risk_flags,
        submitted_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?)`
    ).run(submissionId, participationId, userId, mission.id, description ?? null,
      proof_code_input ?? null, partner_code_input ?? null,
      risk.score, risk.level, JSON.stringify(risk.flags), now, now, now);
    for (const [metricId, value] of reported) {
      db.prepare(
        "INSERT INTO submission_impacts (id, submission_id, mission_metric_id, reported_value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
      ).run(crypto.randomUUID(), submissionId, metricId, value, now, now);
    }
    for (const s of stored) {
      db.prepare(
        `INSERT INTO submission_evidence (id, submission_id, evidence_type, storage_path, file_hash, mime_type, file_size, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(crypto.randomUUID(), submissionId, s.type, s.meta.storage_path, s.meta.file_hash, s.meta.mime_type, s.meta.file_size, now);
    }
    db.prepare("UPDATE participations SET status = 'SUBMITTED', updated_at = ? WHERE id = ?").run(now, participationId);
    db.exec("COMMIT");
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // abaikan
    }
    throw e;
  }
  return { submissionId };
}

export interface ResubmitInput {
  description?: string;
  proof_code_input?: string;
  partner_code_input?: string;
  metrics: Record<string, number>;
}

// Submit ulang setelah REVISION_REQUESTED. Syarat sama seperti submit awal.
// File baru menggantikan file lama. revision_count tetap 1 (revisi hanya sekali).
export async function resubmitEvidence(
  userId: string,
  submissionId: string,
  form: ResubmitInput,
  files: SubmitFiles
): Promise<void> {
  const db = getDb();
  const sub = db
    .prepare(
      `SELECT s.id, s.user_id, s.mission_id, s.participation_id, s.status, s.revision_count,
              p.proof_code, p.status AS part_status
       FROM submissions s JOIN participations p ON p.id = s.participation_id
       WHERE s.id = ?`
    )
    .get(submissionId) as
    | {
        id: string; user_id: string; mission_id: string; participation_id: string;
        status: string; revision_count: number; proof_code: string; part_status: string;
      }
    | undefined;
  if (!sub || sub.user_id !== userId) throw new SubmitError("Submission tidak ditemukan.");
  if (sub.status !== "REVISION_REQUESTED") throw new SubmitError("Submission ini tidak dalam masa revisi.");
  if (sub.revision_count !== 1) throw new SubmitError("Revisi hanya boleh sekali.");

  const mission = db
    .prepare(
      `SELECT id, requires_before_photo, requires_after_photo, requires_description,
              requires_proof_code, requires_partner_code FROM missions WHERE id = ?`
    )
    .get(sub.mission_id) as
    | {
        id: string; requires_before_photo: number; requires_after_photo: number;
        requires_description: number; requires_proof_code: number; requires_partner_code: number;
      }
    | undefined;
  if (!mission) throw new SubmitError("Misi tidak ditemukan.");

  const parsed = textSchema.safeParse({
    description: form.description,
    proof_code_input: form.proof_code_input,
    partner_code_input: form.partner_code_input,
  });
  if (!parsed.success) throw new SubmitError(parsed.error.issues[0]?.message ?? "Input tidak valid.");
  const { description, proof_code_input, partner_code_input } = parsed.data;

  if (mission.requires_description && !description)
    throw new SubmitError("Deskripsi kegiatan wajib diisi.");
  let proofInvalid = false;
  if (mission.requires_proof_code) {
    if (!proof_code_input) throw new SubmitError("Kode bukti wajib diisi.");
    if (proof_code_input !== sub.proof_code) throw new SubmitError("Kode bukti salah.");
  } else if (proof_code_input && proof_code_input !== sub.proof_code) {
    proofInvalid = true;
  }
  if (mission.requires_partner_code && !partner_code_input)
    throw new SubmitError("Kode partner/acara wajib diisi.");
  if (mission.requires_before_photo && !files.before)
    throw new SubmitError("Foto sebelum wajib diunggah ulang.");
  if (mission.requires_after_photo && !files.after)
    throw new SubmitError("Foto sesudah wajib diunggah ulang.");

  const metrics = db
    .prepare("SELECT id, metric_key FROM mission_metrics WHERE mission_id = ?")
    .all(mission.id) as unknown as { id: string; metric_key: string }[];
  const reported = new Map<string, number>();
  for (const m of metrics) {
    const v = form.metrics[m.id];
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1000000000)
      throw new SubmitError(`Nilai ${m.metric_key} wajib angka ≥ 0.`);
    reported.set(m.id, v);
  }

  const now = new Date().toISOString();
  const stored: { type: string; meta: Awaited<ReturnType<typeof storeEvidenceFile>> }[] = [];
  try {
    if (files.before)
      stored.push({ type: "BEFORE_PHOTO", meta: await storeEvidenceFile(files.before, userId, submissionId) });
    if (files.after)
      stored.push({ type: "AFTER_PHOTO", meta: await storeEvidenceFile(files.after, userId, submissionId) });
  } catch (e) {
    if (e instanceof EvidenceError) throw new SubmitError(e.message);
    throw e;
  }

  const oldPaths = (
    db.prepare("SELECT storage_path FROM submission_evidence WHERE submission_id = ?").all(submissionId) as unknown as {
      storage_path: string;
    }[]
  ).map((r) => r.storage_path);

  db.exec("BEGIN");
  try {
    const risk = calculateSubmissionRisk(db, {
      userId,
      proofInvalid,
      fileHashes: stored.map((s) => s.meta.file_hash),
    });
    db.prepare(
      `UPDATE submissions SET description = ?, proof_code_input = ?, partner_code_input = ?,
        status = 'UNDER_REVIEW', risk_score = ?, risk_level = ?, risk_flags = ?,
        submitted_at = ?, reviewed_at = NULL, updated_at = ? WHERE id = ?`
    ).run(
      description ?? null, proof_code_input ?? null, partner_code_input ?? null,
      risk.score, risk.level, JSON.stringify(risk.flags), now, now, submissionId
    );
    for (const [metricId, value] of reported) {
      db.prepare("UPDATE submission_impacts SET reported_value = ?, verified_value = NULL, updated_at = ? WHERE submission_id = ? AND mission_metric_id = ?").run(
        value, now, submissionId, metricId
      );
    }
    db.prepare("DELETE FROM submission_evidence WHERE submission_id = ?").run(submissionId);
    for (const s of stored) {
      db.prepare(
        `INSERT INTO submission_evidence (id, submission_id, evidence_type, storage_path, file_hash, mime_type, file_size, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(crypto.randomUUID(), submissionId, s.type, s.meta.storage_path, s.meta.file_hash, s.meta.mime_type, s.meta.file_size, now);
    }
    db.prepare("UPDATE participations SET status = 'UNDER_REVIEW', updated_at = ? WHERE id = ?").run(
      now, sub.participation_id
    );
    db.prepare(
      `INSERT INTO verification_logs (id, submission_id, verifier_id, action, previous_status, new_status, note)
       VALUES (?, ?, ?, 'START_REVIEW', 'REVISION_REQUESTED', 'UNDER_REVIEW', ?)`
    ).run(crypto.randomUUID(), submissionId, userId, "Resubmit oleh user.");
    db.exec("COMMIT");
  } catch (e) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // abaikan
    }
    throw e;
  }
  for (const p of oldPaths) {
    try {
      rmSync(evidenceAbsPath(p), { force: true });
    } catch {
      // abaikan
    }
  }
}

export interface SubmissionDetail {  id: string;
  status: string;
  description: string | null;
  risk_level: string;
  risk_score: number;
  risk_flags: { type: string; severity: string; message: string }[];
  submitted_at: string;
  mission_title: string;
  mission_slug: string;
  impacts: { name: string; unit: string; reported_value: number; verified_value: number | null }[];
  evidence: { id: string; evidence_type: string; mime_type: string }[];
  timeline: { action: string; reason: string | null; note: string | null; created_at: string }[];
}

export function getSubmissionForUser(submissionId: string, userId: string, isAdmin: boolean): SubmissionDetail | null {
  const db = getDb();
  const sub = db
    .prepare(
      `SELECT s.id, s.user_id, s.status, s.description, s.risk_level, s.risk_score, s.risk_flags, s.submitted_at,
              m.title AS mission_title, m.slug AS mission_slug
       FROM submissions s JOIN missions m ON m.id = s.mission_id WHERE s.id = ?`
    )
    .get(submissionId) as
    | (Omit<SubmissionDetail, "impacts" | "evidence" | "risk_flags"> & { user_id: string; risk_flags: string })
    | undefined;
  if (!sub) return null;
  if (!isAdmin && sub.user_id !== userId) return null;
  let riskFlags: SubmissionDetail["risk_flags"] = [];
  try {
    riskFlags = JSON.parse(sub.risk_flags) as SubmissionDetail["risk_flags"];
  } catch {
    riskFlags = [];
  }
  const impacts = db
    .prepare(
      `SELECT mm.name, mm.unit, si.reported_value, si.verified_value FROM submission_impacts si
       JOIN mission_metrics mm ON mm.id = si.mission_metric_id WHERE si.submission_id = ?`
    )
    .all(submissionId) as unknown as SubmissionDetail["impacts"];
  const evidence = db
    .prepare("SELECT id, evidence_type, mime_type FROM submission_evidence WHERE submission_id = ?")
    .all(submissionId) as unknown as SubmissionDetail["evidence"];
  const timeline = db
    .prepare("SELECT action, reason, note, created_at FROM verification_logs WHERE submission_id = ? ORDER BY created_at")
    .all(submissionId) as unknown as SubmissionDetail["timeline"];
  return { id: sub.id, status: sub.status, description: sub.description, risk_level: sub.risk_level,
    risk_score: sub.risk_score, risk_flags: riskFlags,
    submitted_at: sub.submitted_at, mission_title: sub.mission_title, mission_slug: sub.mission_slug, impacts, evidence,
    timeline: timeline.map((t) => ({ ...t })) };
}
