import { readFile } from "node:fs/promises";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { evidenceAbsPath } from "@/lib/evidence";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const row = await sql<{ storage_path: string; mime_type: string; user_id: string }>(
    `SELECT se.storage_path, se.mime_type, s.user_id FROM submission_evidence se
     JOIN submissions s ON s.id = se.submission_id WHERE se.id = ?`,
    id
  ).get();
  if (!row) return new Response("Not found.", { status: 404 });
  if (user.role !== "ADMIN" && row.user_id !== user.id)
    return new Response("Access denied.", { status: 403 });
  try {
    const buf = await readFile(evidenceAbsPath(row.storage_path));
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": row.mime_type, "Cache-Control": "private, max-age=3600" },
    });
  } catch {
    return new Response("File missing.", { status: 410 });
  }
}
