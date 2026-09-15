import { RewardForm } from "../form";

export default async function NewRewardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">New Reward</h1>
      <RewardForm mode="create" />
    </div>
  );
}
