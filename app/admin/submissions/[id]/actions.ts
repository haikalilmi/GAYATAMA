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
  if (typeof id !== "string") return { error: "Incomplete data.", ok: "" };
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
  if (typeof id !== "string") return { error: "Incomplete data.", ok: "" };
  const values: Record<string, number> = {};
  for (const [k, v] of form.entries()) {
    if (k.startsWith("verified_") && typeof v === "string" && v !== "") {
      const n = Number(v);
      if (!Number.isFinite(n)) return { error: "Invalid verified value.", ok: "" };
      const rawKey = k.slice("verified_".length);
      values[rawKey] = n;
      if (rawKey === "mm-waste") values["e0000000-0000-0000-0000-000000000001"] = n;
      if (rawKey === "mm-plant") values["e0000000-0000-0000-0000-000000000002"] = n;
      if (rawKey === "e0000000-0000-0000-0000-000000000001") values["mm-waste"] = n;
      if (rawKey === "e0000000-0000-0000-0000-000000000002") values["mm-plant"] = n;
    }
  }
  try {
    const r = await approveSubmission(admin.id, id, values);
    revalidatePath(`/admin/submissions/${id}`);
    if (r.already) redirect(`/admin/submissions/${id}?msg=${encodeURIComponent("Already approved; no duplicate reward issued.")}`);
    const bits = [`Approved! +${r.xp} XP, +${r.points} points.`];
    if (r.leveledUp) bits.push(`Level up: ${r.newLevel}.`);
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
    return { error: "Incomplete data.", ok: "" };
  if (!(REJECTION_REASONS as readonly string[]).includes(reason))
    return { error: "Invalid reason.", ok: "" };
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
    return { error: "Revision note is required.", ok: "" };
  try {
    await requestRevision(admin.id, id, note);
    revalidatePath(`/admin/submissions/${id}`);
    redirect(`/admin/submissions/${id}?msg=${encodeURIComponent("Revision requested.")}`);
  } catch (e) {
    if (e instanceof VerificationError) return { error: e.message, ok: "" };
    throw e;
  }
}
