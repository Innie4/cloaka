import { FeaturePreviewPage } from "@/components/dashboard/feature-preview-page";
import { getReportCards } from "@/lib/api";

export default async function ReportsPage() {
  const cards = await getReportCards();

  return (
    <FeaturePreviewPage
      eyebrow="Reports"
      title="Reporting should answer finance questions without drama."
      description="Charts should be plain, readable, and export-friendly. The point is confidence and accountability, not dashboard theatrics."
      cards={cards}
    />
  );
}
