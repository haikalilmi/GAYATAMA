"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { SubmitError, submitEvidence } from "@/lib/submissions";

export interface SubmitState {
  error: string;
}

function fileOrUndef(v: FormDataEntryValue | null): File | undefined {
  if (v instanceof File && v.size > 0) return v;
  return undefined;
}

export async function submitEvidenceAction(_prev: SubmitState | null, form: FormData): Promise<SubmitState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fmy-missions");
  const pid = form.get("participation_id");
  if (typeof pid !== "string") return { error: "Incomplete data." };

  const metrics: Record<string, number> = {};
  for (const [key, value] of form.entries()) {
    if (key.startsWith("metric_") && typeof value === "string" && value !== "") {
      const n = Number(value);
      if (!Number.isFinite(n)) return { error: `Invalid metric value.` };
      const rawKey = key.slice("metric_".length);
      metrics[rawKey] = n;
      if (rawKey === "mm-waste") metrics["e0000000-0000-0000-0000-000000000001"] = n;
      if (rawKey === "mm-plant") metrics["e0000000-0000-0000-0000-000000000002"] = n;
      if (rawKey === "e0000000-0000-0000-0000-000000000001") metrics["mm-waste"] = n;
      if (rawKey === "e0000000-0000-0000-0000-000000000002") metrics["mm-plant"] = n;
    }
  }

  try {
    const { submissionId } = await submitEvidence(
      user.id,
      pid,
      {
        description: typeof form.get("description") === "string" ? (form.get("description") as string) : undefined,
        proof_code_input: typeof form.get("proof_code_input") === "string" ? (form.get("proof_code_input") as string) : undefined,
        partner_code_input: typeof form.get("partner_code_input") === "string" ? (form.get("partner_code_input") as string) : undefined,
        metrics,
      },
      { before: fileOrUndef(form.get("before_photo")), after: fileOrUndef(form.get("after_photo")), supporting: fileOrUndef(form.get("supporting_photo")) }
    );
    redirect(`/submissions/${submissionId}`);
  } catch (e) {
    if (e instanceof SubmitError) return { error: e.message };
    throw e;
  }
}
