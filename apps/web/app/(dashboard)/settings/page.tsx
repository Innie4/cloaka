import { FeaturePreviewPage } from "@/components/dashboard/feature-preview-page";

const cards = [
  {
    eyebrow: "Balance alerts",
    title: "Set threshold-based reminders before salary day",
    body: "The default low-balance threshold should be editable, with room for payroll-plus-buffer logic from the PRD.",
    meta: "Default: NGN 50k or next payroll + 20%"
  },
  {
    eyebrow: "Trust copy",
    title: "Explain partner banks and guarantees in plain language",
    body: "The settings area should support clear operational messaging, not only technical configuration.",
    meta: "Links to trust page"
  },
  {
    eyebrow: "Business profile",
    title: "Profile, KYB status, and notification preferences",
    body: "This is where the product should bring business identity, verification, and alert controls into one calm surface.",
    meta: "KYB pending in this shell"
  }
];

export default function SettingsPage() {
  return (
    <FeaturePreviewPage
      eyebrow="Settings"
      title="Configuration should stay calm, never buried in jargon."
      description="The shell focuses on business clarity first: alerts, trust messaging, profile completeness, and operational defaults."
      cards={cards}
    />
  );
}
