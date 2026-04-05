import { OverviewConsole } from "@/components/dashboard/overview-console";
import { PageFrame } from "@/components/layout/page-frame";

export default function DashboardPage() {
  return (
    <PageFrame
      eyebrow="Overview"
      title="A serious financial dashboard that still feels easy to breathe in."
      description="Live wallet, payments, schedules, and approvals now feed this home view, so the hero numbers stay useful instead of decorative."
    >
      <OverviewConsole />
    </PageFrame>
  );
}
