import { join } from "node:path";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { getProjectRoot } from "./db";

export class EvidenceError extends Error {}

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function checkMagic(buf: Buffer, mime: string): boolean {
  if (mime === "image/jpeg") return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (mime === "image/png")
    return (
      buf.length >= 8 &&
      buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
      buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a
    );
  if (mime === "image/webp")
    return (
      buf.length >= 12 &&
      buf.toString("ascii", 0, 4) === "RIFF" &&
      buf.toString("ascii", 8, 12) === "WEBP"
    );
  return false;
}

export interface StoredEvidence {
  storage_path: string;
  file_hash: string;
  mime_type: string;
  file_size: number;
}

export async function storeEvidenceFile(
  file: File,
  userId: string,
  submissionId: string
): Promise<StoredEvidence> {
  const ext = MIME_TO_EXT[file.type];
  if (!ext) throw new EvidenceError("Format gambar harus JPG, PNG, atau WEBP.");
  if (file.size <= 0) throw new EvidenceError("File gambar kosong.");
  if (file.size > MAX_FILE_BYTES) throw new EvidenceError("Ukuran gambar maksimal 5 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  if (!checkMagic(buf, file.type)) throw new EvidenceError("Isi file bukan gambar valid.");
  const fileHash = createHash("sha256").update(buf).digest("hex");
  // data/evidence/{user_id}/{submission_id}/{uuid}.ext, relatif dari root proyek
  const rel = join("data", "evidence", userId, submissionId, `${crypto.randomUUID()}.${ext}`);
  const abs = join(getProjectRoot(), rel);
  mkdirSync(join(abs, ".."), { recursive: true });
  writeFileSync(abs, buf);
  return { storage_path: rel, file_hash: fileHash, mime_type: file.type, file_size: buf.length };
}

export function evidenceAbsPath(storagePath: string): string {
  return join(getProjectRoot(), storagePath);
}
