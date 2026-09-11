"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { JoinError, cancelParticipation } from "@/lib/participation";

export interface CancelState {
  error: string;
}

export async function cancelParticipationAction(_prev: CancelState | null, form: FormData): Promise<CancelState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fmy-missions");
  const id = form.get("participation_id");
  if (typeof id !== "string") return { error: "Data tidak lengkap." };
  try {
    await cancelParticipation(user.id, id);
  } catch (e) {
    if (e instanceof JoinError) return { error: e.message };
    throw e;
  }
  revalidatePath("/my-missions");
  return { error: "" };
}
