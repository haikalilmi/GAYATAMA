"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  MissionAdminError,
  createMission,
  missionFormSchema,
  setMissionStatus,
  updateMission,
  type MissionForm,
} from "@/lib/missions";

export interface MissionState {
  error: string;
}

async function mustAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new MissionAdminError("Admins only.");
  return user;
}

function readForm(form: FormData): MissionForm {
  const obj: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v === "string") obj[k] = v;
  }
  for (const c of ["requires_before_photo", "requires_after_photo", "requires_description", "requires_proof_code", "requires_partner_code"]) {
    if (!(c in obj)) obj[c] = "0";
  }
  const parsed = missionFormSchema.safeParse(obj);
  if (!parsed.success) throw new MissionAdminError(parsed.error.issues[0]?.message ?? "Invalid input.");
  return parsed.data;
}

export async function createMissionAction(_prev: MissionState | null, form: FormData): Promise<MissionState> {
  try {
    await mustAdmin();
    const id = await createMission(readForm(form));
    revalidatePath("/admin/missions");
    revalidatePath("/missions");
    redirect(`/admin/missions/${id}`);
  } catch (e) {
    if (e instanceof MissionAdminError) return { error: e.message };
    throw e;
  }
}

export async function updateMissionAction(_prev: MissionState | null, form: FormData): Promise<MissionState> {
  const id = form.get("mission_id");
  if (typeof id !== "string") return { error: "Incomplete data." };
  try {
    await mustAdmin();
    await updateMission(id, readForm(form));
    revalidatePath("/admin/missions");
    revalidatePath("/missions");
    revalidatePath(`/admin/missions/${id}`);
    return { error: "" };
  } catch (e) {
    if (e instanceof MissionAdminError) return { error: e.message };
    throw e;
  }
}

export async function missionStatusAction(_prev: MissionState | null, form: FormData): Promise<MissionState> {
  const id = form.get("mission_id");
  const next = form.get("next_status");
  if (typeof id !== "string" || typeof next !== "string") return { error: "Incomplete data." };
  try {
    await mustAdmin();
    await setMissionStatus(id, next);
    revalidatePath("/admin/missions");
    revalidatePath("/missions");
    return { error: "" };
  } catch (e) {
    if (e instanceof MissionAdminError) return { error: e.message };
    throw e;
  }
}
