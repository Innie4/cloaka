import { PageFrame } from "@/components/layout/page-frame";
import { SchedulesConsole } from "@/components/schedules/schedules-console";

export default function SchedulesPage() {
  return (
    <PageFrame
      eyebrow="Schedules"
      title="Recurring runs should feel predictable, not mysterious."
      description="Build named runs, attach recipients with fixed amounts, and trigger the schedule when you need it without losing idempotent safeguards."
    >
      <SchedulesConsole />
    </PageFrame>
  );
}
