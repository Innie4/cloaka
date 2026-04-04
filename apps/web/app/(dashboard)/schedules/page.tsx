import { scheduleCards } from "@cloaka/shared";
import { FeaturePreviewPage } from "@/components/dashboard/feature-preview-page";

export default function SchedulesPage() {
  return (
    <FeaturePreviewPage
      eyebrow="Schedules"
      title="Recurring runs should feel predictable, not mysterious."
      description="These cards sketch the core scheduling primitives from the PRD: named runs, recipient groups, amount models, and approval-aware timing."
      cards={scheduleCards}
    />
  );
}
