"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { JoinError, joinMission } from "@/lib/participation";

export interface JoinState {
  error: string;
}

export async function joinMissionAction(_prev: JoinState | null, form: FormData): Promise<JoinState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const missionId = form.get("mission_id");
  const slug = form.get("slug");
  if (typeof missionId !== "string" || typeof slug !== "string") return { error: "Data misi tidak lengkap." };
  try {
    await joinMission(user.id, user.role, missionId);
  } catch (e) {
    if (e instanceof JoinError) return { error: e.message };
    throw e;
  }
  revalidatePath(`/missions/${slug}`);
  redirect(`/missions/${slug}?joined=1`);
}
