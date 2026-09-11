"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  REJECTION_REASONS,
  VerificationError,
  approveSubmission,
  rejectSubmission,
  requestRevision,
  startReview,
} from "@/lib/verification";

export interface ReviewState {
  error: string;
  ok: string;
}

export async function startReviewAction(_prev: ReviewState | null, form: FormData): Promise<ReviewState> {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return { error: "Hanya ADMIN.", ok: "" };
  const id = form.get("submission_id");
  if (typeof id !== "string") return { error: "Data tidak lengkap.", ok: "" };
  try {
    await startReview(admin.id, id);
    revalidatePath(`/admin/submissions/${id}`);
    return { error: "", ok: "Review dimulai." };
  } catch (e) {
    if (e instanceof VerificationError) return { error: e.message, ok: "" };
    throw e;
  }
}

export async function approveAction(_prev: ReviewState | null, form: FormData): Promise<ReviewState> {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return { error: "Hanya ADMIN.", ok: "" };
  const id = form.get("submission_id");
  if (typeof id !== "string") return { error: "Data tidak lengkap.", ok: "" };
  const values: Record<string, number> = {};
  for (const [k, v] of form.entries()) {
    if (k.startsWith("verified_") && typeof v === "string" && v !== "") {
      const n = Number(v);
      if (!Number.isFinite(n)) return { error: "Nilai verified tidak valid.", ok: "" };
      values[k.slice("verified_".length)] = n;
    }
  }
  try {
    const r = await approveSubmission(admin.id, id, values);
    revalidatePath(`/admin/submissions/${id}`);
    if (r.already) redirect(`/admin/submissions/${id}?msg=${encodeURIComponent("Sudah disetujui sebelumnya, tidak ada reward ganda.")}`);
    const bits = [`Disetujui! +${r.xp} XP, +${r.points} poin.`];
    if (r.leveledUp) bits.push(`Naik level: ${r.newLevel}.`);
    if (r.badges.length > 0) bits.push(`Badge: ${r.badges.join(", ")}.`);
    redirect(`/admin/submissions/${id}?msg=${encodeURIComponent(bits.join(" "))}`);
  } catch (e) {
    if (e instanceof VerificationError) return { error: e.message, ok: "" };
    throw e;
  }
}

export async function rejectAction(_prev: ReviewState | null, form: FormData): Promise<ReviewState> {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return { error: "Hanya ADMIN.", ok: "" };
  const id = form.get("submission_id");
  const reason = form.get("reason");
  const note = form.get("note");
  if (typeof id !== "string" || typeof reason !== "string")
    return { error: "Data tidak lengkap.", ok: "" };
  if (!(REJECTION_REASONS as readonly string[]).includes(reason))
    return { error: "Alasan tidak valid.", ok: "" };
  try {
    await rejectSubmission(admin.id, id, reason, typeof note === "string" && note ? note : undefined);
    revalidatePath(`/admin/submissions/${id}`);
    redirect(`/admin/submissions/${id}?msg=${encodeURIComponent("Submission ditolak.")}`);
  } catch (e) {
    if (e instanceof VerificationError) return { error: e.message, ok: "" };
    throw e;
  }
}

export async function revisionAction(_prev: ReviewState | null, form: FormData): Promise<ReviewState> {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "ADMIN") return { error: "Hanya ADMIN.", ok: "" };
  const id = form.get("submission_id");
  const note = form.get("note");
  if (typeof id !== "string" || typeof note !== "string" || !note.trim())
    return { error: "Catatan revisi wajib diisi.", ok: "" };
  try {
    await requestRevision(admin.id, id, note);
    revalidatePath(`/admin/submissions/${id}`);
    redirect(`/admin/submissions/${id}?msg=${encodeURIComponent("Revisi diminta.")}`);
  } catch (e) {
    if (e instanceof VerificationError) return { error: e.message, ok: "" };
    throw e;
  }
}
