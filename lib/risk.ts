import { sql } from "./db";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export interface RiskFlag {
  type: "EXACT_DUPLICATE" | "INVALID_PROOF_CODE" | "MANY_SUBMISSIONS" | "NEW_ACCOUNT";
  severity: "HIGH" | "MEDIUM" | "LOW";
  message: string;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  flags: RiskFlag[];
}

export function riskLevelFor(score: number): RiskLevel {
  if (score >= 60) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

export interface RiskInput {
  userId: string;
  // null = tidak dinilai (misal proof wajib dan sudah cocok / tidak diisi)
  proofInvalid: boolean;
  fileHashes: string[];
}

export async function calculateSubmissionRisk(input: RiskInput): Promise<RiskResult> {
  const flags: RiskFlag[] = [];
  let score = 0;

  if (input.fileHashes.length > 0) {
    const ph = input.fileHashes.map((_, i) => `$${i + 1}`).join(",");
    const dup = await sql(
      `SELECT 1 FROM submission_evidence WHERE file_hash IN (${ph}) LIMIT 1`,
      ...input.fileHashes
    ).get();
    if (dup) {
      score += 50;
      flags.push({
        type: "EXACT_DUPLICATE",
        severity: "HIGH",
        message: "File yang sama persis pernah disubmit sebelumnya.",
      });
    }
  }

  if (input.proofInvalid) {
    score += 30;
    flags.push({
      type: "INVALID_PROOF_CODE",
      severity: "MEDIUM",
      message: "Kode bukti tidak cocok dengan kode partisipasi.",
    });
  }

  const day = await sql<{ c: number }>(
    `SELECT COUNT(*) AS c FROM submissions WHERE user_id = ?
     AND submitted_at > (NOW() - INTERVAL '1 day')`,
    input.userId
  ).get();
  if (day && day.c >= 5) {
    score += 20;
    flags.push({
      type: "MANY_SUBMISSIONS",
      severity: "MEDIUM",
      message: `Sudah ${day.c} submission dalam 24 jam terakhir.`,
    });
  }

  const user = await sql<{ created_at: string }>(
    "SELECT created_at FROM users WHERE id = ?",
    input.userId
  ).get();
  if (user) {
    const ageMs = Date.now() - new Date(user.created_at).getTime();
    if (ageMs < 24 * 3600000) {
      score += 10;
      flags.push({
        type: "NEW_ACCOUNT",
        severity: "LOW",
        message: "Akun dibuat kurang dari 24 jam lalu.",
      });
    }
  }

  return { score, level: riskLevelFor(score), flags };
}
