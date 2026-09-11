"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RedeemError, redeemReward } from "@/lib/rewards";

export interface RedeemState {
  error: string;
}

export async function redeemAction(_prev: RedeemState | null, form: FormData): Promise<RedeemState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Frewards");
  const id = form.get("reward_id");
  if (typeof id !== "string") return { error: "Data tidak lengkap." };
  try {
    const { demoCode } = await redeemReward(user.id, id);
    redirect(`/rewards/history?code=${encodeURIComponent(demoCode)}`);
  } catch (e) {
    if (e instanceof RedeemError) return { error: e.message };
    throw e;
  }
}
