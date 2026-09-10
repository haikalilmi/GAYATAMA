import { RewardForm } from "../form";

export default async function NewRewardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Reward Baru</h1>
      <RewardForm mode="create" />
    </div>
  );
}
