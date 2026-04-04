import { FeaturePreviewPage } from "@/components/dashboard/feature-preview-page";

const cards = [
  {
    eyebrow: "Activity log",
    title: "Every sensitive action gets a timestamp",
    body: "Logins, recipient edits, rule changes, approvals, and disbursements should all leave immutable records.",
    meta: "Retention varies by plan"
  },
  {
    eyebrow: "Actor trace",
    title: "Every change has a person behind it",
    body: "Email identity, IP address, action type, and affected object should be clear enough for dispute resolution.",
    meta: "Export required on higher tiers"
  },
  {
    eyebrow: "Investigation speed",
    title: "When something goes wrong, the trail should be obvious",
    body: "Audit design must support support teams and finance managers under pressure, not just compliance checklists.",
    meta: "Immutable by default"
  }
];

export default function AuditPage() {
  return (
    <FeaturePreviewPage
      eyebrow="Audit"
      title="Audit should feel like a product feature, not buried admin debris."
      description="The visual direction here stays clean so log density never overwhelms the people who need it most."
      cards={cards}
    />
  );
}
