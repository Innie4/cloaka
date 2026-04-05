import { PageFrame } from "@/components/layout/page-frame";
import { RulesConsole } from "@/components/rules/rules-console";

export default function RulesPage() {
  return (
    <PageFrame
      eyebrow="Rules engine"
      title="The product moat should feel as simple as a spreadsheet filter."
      description="Plain-language conditions now map directly to approval or withhold behavior, and each saved rule can be tested against sample payloads."
    >
      <RulesConsole />
    </PageFrame>
  );
}
