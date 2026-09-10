import type { DatabaseSync } from "node:sqlite";

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

export function calculateSubmissionRisk(db: DatabaseSync, input: RiskInput): RiskResult {
  const flags: RiskFlag[] = [];
  let score = 0;

  if (input.fileHashes.length > 0) {
    const dup = db
      .prepare(
        `SELECT 1 FROM submission_evidence WHERE file_hash IN (${input.fileHashes.map(() => "?").join(",")}) LIMIT 1`
      )
      .get(...input.fileHashes);
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

  const day = db
    .prepare(
      `SELECT COUNT(*) AS c FROM submissions WHERE user_id = ?
       AND submitted_at > strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 day')`
    )
    .get(input.userId) as { c: number };
  if (day.c >= 5) {
    score += 20;
    flags.push({
      type: "MANY_SUBMISSIONS",
      severity: "MEDIUM",
      message: `Sudah ${day.c} submission dalam 24 jam terakhir.`,
    });
  }

  const user = db
    .prepare("SELECT created_at FROM users WHERE id = ?")
    .get(input.userId) as { created_at: string } | undefined;
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
