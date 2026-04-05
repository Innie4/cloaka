import { ApprovalsConsole } from "@/components/approvals/approvals-console";
import { PageFrame } from "@/components/layout/page-frame";

export default function ApprovalsPage() {
  return (
    <PageFrame
      eyebrow="Approvals"
      title="Approve and reject actions should never hide below the fold."
      description="Pending payouts now arrive with amount, requester, recipient, and action in one place so the decision stays obvious."
    >
      <ApprovalsConsole />
    </PageFrame>
  );
}
