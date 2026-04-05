import { AuditConsole } from "@/components/audit/audit-console";
import { PageFrame } from "@/components/layout/page-frame";

export default function AuditPage() {
  return (
    <PageFrame
      eyebrow="Audit"
      title="Audit should feel like a product feature, not buried admin debris."
      description="Every sensitive action is now searchable with actor attribution, timestamps, and structured metadata."
    >
      <AuditConsole />
    </PageFrame>
  );
}
