"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  RewardAdminError,
  createReward,
  rewardFormSchema,
  updateReward,
  type RewardForm,
} from "@/lib/rewards-admin";

export interface RewardState {
  error: string;
}

async function mustAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new RewardAdminError("Hanya ADMIN.");
}

function readForm(form: FormData): RewardForm {
  const obj: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v === "string") obj[k] = v;
  }
  if (!obj.demo_value) delete obj.demo_value;
  if (!obj.description) delete obj.description;
  const parsed = rewardFormSchema.safeParse(obj);
  if (!parsed.success) throw new RewardAdminError(parsed.error.issues[0]?.message ?? "Invalid input.");
  return parsed.data;
}

export async function createRewardAction(_prev: RewardState | null, form: FormData): Promise<RewardState> {
  try {
    await mustAdmin();
    const id = await createReward(readForm(form));
    revalidatePath("/admin/rewards");
    redirect(`/admin/rewards/${id}`);
  } catch (e) {
    if (e instanceof RewardAdminError) return { error: e.message };
    throw e;
  }
}

export async function updateRewardAction(_prev: RewardState | null, form: FormData): Promise<RewardState> {
  const id = form.get("reward_id");
  if (typeof id !== "string") return { error: "Incomplete data." };
  try {
    await mustAdmin();
    await updateReward(id, readForm(form));
    revalidatePath("/admin/rewards");
    return { error: "" };
  } catch (e) {
    if (e instanceof RewardAdminError) return { error: e.message };
    throw e;
  }
}
