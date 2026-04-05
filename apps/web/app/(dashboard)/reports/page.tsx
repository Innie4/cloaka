import { PageFrame } from "@/components/layout/page-frame";
import { ReportsConsole } from "@/components/reports/reports-console";

export default function ReportsPage() {
  return (
    <PageFrame
      eyebrow="Reports"
      title="Reporting should answer finance questions without drama."
      description="The live reports surface now breaks down paid, failed, withheld, and pending disbursements with simple totals and failure visibility."
    >
      <ReportsConsole />
    </PageFrame>
  );
}
