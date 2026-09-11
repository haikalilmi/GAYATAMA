"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { markAllRead } from "@/lib/impact";

export async function markReadAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fnotifications");
  await markAllRead(user.id);
  revalidatePath("/notifications");
}
