import { ruleCards } from "@cloaka/shared";
import { FeaturePreviewPage } from "@/components/dashboard/feature-preview-page";

export default function RulesPage() {
  return (
    <FeaturePreviewPage
      eyebrow="Rules engine"
      title="The product moat should feel as simple as a spreadsheet filter."
      description="This page stays intentionally calm. The eventual builder should read like plain language, not code, with testable conditions and friendly AND/OR controls."
      cards={ruleCards}
    />
  );
}
