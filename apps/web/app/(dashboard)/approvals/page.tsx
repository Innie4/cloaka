import { approvalCards } from "@cloaka/shared";
import { FeaturePreviewPage } from "@/components/dashboard/feature-preview-page";

export default function ApprovalsPage() {
  return (
    <FeaturePreviewPage
      eyebrow="Approvals"
      title="Approve and reject actions should never hide below the fold."
      description="This surface is meant to evolve into a sharp decision workflow with the amount, context, and reviewer notes all visible before action."
      cards={approvalCards}
    />
  );
}
