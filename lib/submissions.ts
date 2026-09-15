import { rmSync } from "node:fs";
import { z } from "zod";
import { sql } from "./db";
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
  supporting?: File;
}

export async function submitEvidence(
  userId: string,
  participationId: string,
  form: { description?: string; proof_code_input?: string; partner_code_input?: string; metrics: Record<string, number> },
  files: SubmitFiles
): Promise<{ submissionId: string }> {
  const part = await sql<{
    id: string; user_id: string; mission_id: string; proof_code: string; status: string; expires_at: string;
  }>(
    "SELECT id, user_id, mission_id, proof_code, status, expires_at FROM participations WHERE id = ?",
    participationId
  ).get();
  if (!part || part.user_id !== userId) throw new SubmitError("Participation not found.");
  if (part.status !== "JOINED") throw new SubmitError("This participation has already been submitted or completed.");
  if (new Date(part.expires_at) < new Date()) {
    await sql("UPDATE participations SET status = 'EXPIRED' WHERE id = ?", participationId).run();
    throw new SubmitError("The participation window has expired.");
  }
  const mission = await sql<{
    id: string; requires_before_photo: boolean; requires_after_photo: boolean;
    requires_description: boolean; requires_proof_code: boolean; requires_partner_code: boolean;
  }>(
    `SELECT id, requires_before_photo, requires_after_photo, requires_description,
            requires_proof_code, requires_partner_code FROM missions WHERE id = ?`,
    part.mission_id
  ).get();
  if (!mission) throw new SubmitError("Mission not found.");

  const parsed = textSchema.safeParse({
    description: form.description,
    proof_code_input: form.proof_code_input,
    partner_code_input: form.partner_code_input,
  });
  if (!parsed.success) throw new SubmitError(parsed.error.issues[0]?.message ?? "Invalid input.");
  const { description, proof_code_input, partner_code_input } = parsed.data;

  if (mission.requires_description && !description)
    throw new SubmitError("Activity description is required.");
  let proofInvalid = false;
  if (mission.requires_proof_code) {
    if (!proof_code_input) throw new SubmitError("Proof code is required.");
    if (proof_code_input !== part.proof_code) throw new SubmitError("Incorrect proof code.");
  } else if (proof_code_input && proof_code_input !== part.proof_code) {
    proofInvalid = true;
  }
  if (mission.requires_partner_code && !partner_code_input)
    throw new SubmitError("Partner or event code is required.");
  if (mission.requires_before_photo && !files.before)
    throw new SubmitError("Before photo is required.");
  if (mission.requires_after_photo && !files.after)
    throw new SubmitError("After photo is required.");
  if (!mission.requires_before_photo && !mission.requires_after_photo && !files.supporting)
    throw new SubmitError("Action photo is required.");

  const metrics = await sql<{ id: string; metric_key: string }>(
    "SELECT id, metric_key FROM mission_metrics WHERE mission_id = ?",
    mission.id
  ).all();
  const reported = new Map<string, number>();
  for (const m of metrics) {
    const v = form.metrics[m.id] ?? (m.id === "e0000000-0000-0000-0000-000000000001" || m.metric_key === "waste_collected" ? form.metrics["mm-waste"] : undefined) ?? (m.id === "e0000000-0000-0000-0000-000000000002" || m.metric_key === "plants_added" ? form.metrics["mm-plant"] : undefined);
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1000000000)
      throw new SubmitError(`${m.metric_key} must be a number ≥ 0.`);
    reported.set(m.id, v);
  }

  const existing = await sql("SELECT 1 FROM submissions WHERE participation_id = ?", participationId).get();
  if (existing) throw new SubmitError("This participation has already been submitted.");

  const submissionId = crypto.randomUUID();
  const now = new Date().toISOString();
  const stored: { type: string; meta: Awaited<ReturnType<typeof storeEvidenceFile>> }[] = [];
  try {
    if (files.before)
      stored.push({ type: "BEFORE_PHOTO", meta: await storeEvidenceFile(files.before, userId, submissionId) });
    if (files.after)
      stored.push({ type: "AFTER_PHOTO", meta: await storeEvidenceFile(files.after, userId, submissionId) });
    if (files.supporting)
      stored.push({ type: "SUPPORTING_PHOTO", meta: await storeEvidenceFile(files.supporting, userId, submissionId) });
  } catch (e) {
    if (e instanceof EvidenceError) throw new SubmitError(e.message);
    throw e;
  }

  const risk = await calculateSubmissionRisk({
    userId,
    proofInvalid,
    fileHashes: stored.map((s) => s.meta.file_hash),
  });
  await sql(
    `INSERT INTO submissions (id, participation_id, user_id, mission_id, description,
      proof_code_input, partner_code_input, status, risk_score, risk_level, risk_flags,
      submitted_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?, ?)`,
    submissionId, participationId, userId, mission.id, description ?? null,
    proof_code_input ?? null, partner_code_input ?? null,
    risk.score, risk.level, JSON.stringify(risk.flags), now, now, now
  ).run();
  for (const [metricId, value] of reported) {
    await sql(
      "INSERT INTO submission_impacts (id, submission_id, mission_metric_id, reported_value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
      crypto.randomUUID(), submissionId, metricId, value, now, now
    ).run();
  }
  for (const s of stored) {
    await sql(
      `INSERT INTO submission_evidence (id, submission_id, evidence_type, storage_path, file_hash, mime_type, file_size, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      crypto.randomUUID(), submissionId, s.type, s.meta.storage_path, s.meta.file_hash, s.meta.mime_type, s.meta.file_size, now
    ).run();
  }
  await sql("UPDATE participations SET status = 'SUBMITTED', updated_at = ? WHERE id = ?", now, participationId).run();
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
  const sub = await sql<{
    id: string; user_id: string; mission_id: string; participation_id: string;
    status: string; revision_count: number; proof_code: string; part_status: string;
  }>(
    `SELECT s.id, s.user_id, s.mission_id, s.participation_id, s.status, s.revision_count,
            p.proof_code, p.status AS part_status
     FROM submissions s JOIN participations p ON p.id = s.participation_id
     WHERE s.id = ?`,
    submissionId
  ).get();
  if (!sub || sub.user_id !== userId) throw new SubmitError("Submission not found.");
  if (sub.status !== "REVISION_REQUESTED") throw new SubmitError("This submission is not in revision.");
  if (sub.revision_count !== 1) throw new SubmitError("Only one revision is allowed.");

  const mission = await sql<{
    id: string; requires_before_photo: boolean; requires_after_photo: boolean;
    requires_description: boolean; requires_proof_code: boolean; requires_partner_code: boolean;
  }>(
    `SELECT id, requires_before_photo, requires_after_photo, requires_description,
            requires_proof_code, requires_partner_code FROM missions WHERE id = ?`,
    sub.mission_id
  ).get();
  if (!mission) throw new SubmitError("Mission not found.");

  const parsed = textSchema.safeParse({
    description: form.description,
    proof_code_input: form.proof_code_input,
    partner_code_input: form.partner_code_input,
  });
  if (!parsed.success) throw new SubmitError(parsed.error.issues[0]?.message ?? "Invalid input.");
  const { description, proof_code_input, partner_code_input } = parsed.data;

  if (mission.requires_description && !description)
    throw new SubmitError("Activity description is required.");
  let proofInvalid = false;
  if (mission.requires_proof_code) {
    if (!proof_code_input) throw new SubmitError("Proof code is required.");
    if (proof_code_input !== sub.proof_code) throw new SubmitError("Incorrect proof code.");
  } else if (proof_code_input && proof_code_input !== sub.proof_code) {
    proofInvalid = true;
  }
  if (mission.requires_partner_code && !partner_code_input)
    throw new SubmitError("Partner or event code is required.");
  if (mission.requires_before_photo && !files.before)
    throw new SubmitError("Before photo must be re-uploaded.");
  if (mission.requires_after_photo && !files.after)
    throw new SubmitError("After photo must be re-uploaded.");
  if (!mission.requires_before_photo && !mission.requires_after_photo && !files.supporting)
    throw new SubmitError("Action photo must be re-uploaded.");

  const metrics = await sql<{ id: string; metric_key: string }>(
    "SELECT id, metric_key FROM mission_metrics WHERE mission_id = ?",
    mission.id
  ).all();
  const reported = new Map<string, number>();
  for (const m of metrics) {
    const v = form.metrics[m.id] ?? (m.id === "e0000000-0000-0000-0000-000000000001" || m.metric_key === "waste_collected" ? form.metrics["mm-waste"] : undefined) ?? (m.id === "e0000000-0000-0000-0000-000000000002" || m.metric_key === "plants_added" ? form.metrics["mm-plant"] : undefined);
    if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1000000000)
      throw new SubmitError(`${m.metric_key} must be a number ≥ 0.`);
    reported.set(m.id, v);
  }

  const now = new Date().toISOString();
  const stored: { type: string; meta: Awaited<ReturnType<typeof storeEvidenceFile>> }[] = [];
  try {
    if (files.before)
      stored.push({ type: "BEFORE_PHOTO", meta: await storeEvidenceFile(files.before, userId, submissionId) });
    if (files.after)
      stored.push({ type: "AFTER_PHOTO", meta: await storeEvidenceFile(files.after, userId, submissionId) });
    if (files.supporting)
      stored.push({ type: "SUPPORTING_PHOTO", meta: await storeEvidenceFile(files.supporting, userId, submissionId) });
  } catch (e) {
    if (e instanceof EvidenceError) throw new SubmitError(e.message);
    throw e;
  }

  const oldPaths = (
    await sql<{ storage_path: string }>(
      "SELECT storage_path FROM submission_evidence WHERE submission_id = ?",
      submissionId
    ).all()
  ).map((r) => r.storage_path);

  const risk = await calculateSubmissionRisk({
    userId,
    proofInvalid,
    fileHashes: stored.map((s) => s.meta.file_hash),
  });
  await sql(
    `UPDATE submissions SET description = ?, proof_code_input = ?, partner_code_input = ?,
      status = 'UNDER_REVIEW', risk_score = ?, risk_level = ?, risk_flags = ?,
      submitted_at = ?, reviewed_at = NULL, updated_at = ? WHERE id = ?`,
    description ?? null, proof_code_input ?? null, partner_code_input ?? null,
    risk.score, risk.level, JSON.stringify(risk.flags), now, now, submissionId
  ).run();
  for (const [metricId, value] of reported) {
    await sql(
      "UPDATE submission_impacts SET reported_value = ?, verified_value = NULL, updated_at = ? WHERE submission_id = ? AND mission_metric_id = ?",
      value, now, submissionId, metricId
    ).run();
  }
  await sql("DELETE FROM submission_evidence WHERE submission_id = ?", submissionId).run();
  for (const s of stored) {
    await sql(
      `INSERT INTO submission_evidence (id, submission_id, evidence_type, storage_path, file_hash, mime_type, file_size, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      crypto.randomUUID(), submissionId, s.type, s.meta.storage_path, s.meta.file_hash, s.meta.mime_type, s.meta.file_size, now
    ).run();
  }
  await sql("UPDATE participations SET status = 'UNDER_REVIEW', updated_at = ? WHERE id = ?", now, sub.participation_id).run();
  await sql(
    `INSERT INTO verification_logs (id, submission_id, verifier_id, action, previous_status, new_status, note)
     VALUES (?, ?, ?, 'START_REVIEW', 'REVISION_REQUESTED', 'UNDER_REVIEW', ?)`,
    crypto.randomUUID(), submissionId, userId, "Resubmitted by user."
  ).run();
  for (const p of oldPaths) {
    try {
      rmSync(evidenceAbsPath(p), { force: true });
    } catch {
      // abaikan
    }
  }
}

export interface SubmissionDetail {
  id: string;
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

export async function getSubmissionForUser(submissionId: string, userId: string, isAdmin: boolean): Promise<SubmissionDetail | null> {
  const sub = await sql<Omit<SubmissionDetail, "impacts" | "evidence" | "risk_flags"> & { user_id: string; risk_flags: string }>(
    `SELECT s.id, s.user_id, s.status, s.description, s.risk_level, s.risk_score, s.risk_flags, s.submitted_at,
            m.title AS mission_title, m.slug AS mission_slug
     FROM submissions s JOIN missions m ON m.id = s.mission_id WHERE s.id = ?`,
    submissionId
  ).get();
  if (!sub) return null;
  if (!isAdmin && sub.user_id !== userId) return null;
  let riskFlags: SubmissionDetail["risk_flags"] = [];
  try {
    const rf = sub.risk_flags;
    riskFlags = (typeof rf === "string" ? JSON.parse(rf) : rf) as SubmissionDetail["risk_flags"];
  } catch {
    riskFlags = [];
  }
  const impacts = await sql<SubmissionDetail["impacts"][0]>(
    `SELECT mm.name, mm.unit, si.reported_value, si.verified_value FROM submission_impacts si
     JOIN mission_metrics mm ON mm.id = si.mission_metric_id WHERE si.submission_id = ?`,
    submissionId
  ).all();
  const evidence = await sql<SubmissionDetail["evidence"][0]>(
    "SELECT id, evidence_type, mime_type FROM submission_evidence WHERE submission_id = ?",
    submissionId
  ).all();
  const timeline = await sql<SubmissionDetail["timeline"][0]>(
    "SELECT action, reason, note, created_at FROM verification_logs WHERE submission_id = ? ORDER BY created_at",
    submissionId
  ).all();
  return {
    id: sub.id, status: sub.status, description: sub.description, risk_level: sub.risk_level,
    risk_score: sub.risk_score, risk_flags: riskFlags,
    submitted_at: sub.submitted_at, mission_title: sub.mission_title, mission_slug: sub.mission_slug,
    impacts: impacts.map((i) => ({ ...i })),
    evidence: evidence.map((e) => ({ ...e })),
    timeline: timeline.map((t) => ({ ...t })),
  };
}
