import Link from "next/link";
import { getRewardForAdmin } from "@/lib/rewards-admin";
import { RewardForm } from "../form";

export default async function EditRewardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reward = await getRewardForAdmin(id);
  if (!reward) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Reward tidak ketemu.</h1>
        <Link href="/admin/rewards" className="text-sm underline">Kembali</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Edit: {reward.title}</h1>
      <RewardForm mode="edit" rewardId={reward.id} initial={reward} />
      <Link href="/admin/rewards" className="text-sm underline">Kembali ke daftar</Link>
    </div>
  );
}
