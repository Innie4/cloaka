import { FeaturePreviewPage } from "@/components/dashboard/feature-preview-page";

const cards = [
  {
    eyebrow: "Owner",
    title: "Full control with billing authority",
    body: "Owners should manage every payment surface, team invitation, approval chain, and billing control.",
    meta: "1 active owner"
  },
  {
    eyebrow: "Admin",
    title: "Operate disbursements without billing risk",
    body: "Admins should create runs, update recipients, and manage payments without touching pricing or payment methods.",
    meta: "3 invited admins"
  },
  {
    eyebrow: "Viewer",
    title: "Read-only visibility for finance and audit",
    body: "Viewers need access to history and reports without edit capabilities.",
    meta: "2 viewers configured"
  }
];

export default function TeamPage() {
  return (
    <FeaturePreviewPage
      eyebrow="Team"
      title="Permissions should feel legible to non-technical operators."
      description="Scale and Enterprise tiers need a role system that is obvious, revocable, and fully attributed in the audit trail."
      cards={cards}
    />
  );
}
