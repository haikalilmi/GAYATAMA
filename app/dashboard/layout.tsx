import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser("/dashboard");
  return (
    <div className="space-y-8 animate-enter-tactile">
      {children}
    </div>
  );
}
