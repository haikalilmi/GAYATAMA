"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SubmitError, resubmitEvidence } from "@/lib/submissions";
import type { EvidenceFormState } from "@/app/my-missions/[id]/submit/form";

function fileOrUndef(v: FormDataEntryValue | null): File | undefined {
  if (v instanceof File && v.size > 0) return v;
  return undefined;
}

export async function resubmitEvidenceAction(
  _prev: EvidenceFormState | null,
  form: FormData
): Promise<EvidenceFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const sid = form.get("submission_id");
  if (typeof sid !== "string") return { error: "Data tidak lengkap." };

  const metrics: Record<string, number> = {};
  for (const [key, value] of form.entries()) {
    if (key.startsWith("metric_") && typeof value === "string" && value !== "") {
      const n = Number(value);
      if (!Number.isFinite(n)) return { error: "Nilai metrik tidak valid." };
      metrics[key.slice("metric_".length)] = n;
    }
  }

  try {
    await resubmitEvidence(
      user.id,
      sid,
      {
        description: typeof form.get("description") === "string" ? (form.get("description") as string) : undefined,
        proof_code_input: typeof form.get("proof_code_input") === "string" ? (form.get("proof_code_input") as string) : undefined,
        partner_code_input: typeof form.get("partner_code_input") === "string" ? (form.get("partner_code_input") as string) : undefined,
        metrics,
      },
      { before: fileOrUndef(form.get("before_photo")), after: fileOrUndef(form.get("after_photo")) }
    );
    redirect(`/submissions/${sid}`);
  } catch (e) {
    if (e instanceof SubmitError) return { error: e.message };
    throw e;
  }
}
