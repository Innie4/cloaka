import { FeaturePreviewPage } from "@/components/dashboard/feature-preview-page";
import { getRecipientCards } from "@/lib/api";

export default async function RecipientsPage() {
  const cards = await getRecipientCards();

  return (
    <FeaturePreviewPage
      eyebrow="Recipients"
      title="Recipient management should stay structured without feeling heavy."
      description="The PRD calls for employees, vendors, contractors, tags, CSV import, reverification, and notes. This page frames those jobs without collapsing into spreadsheet fatigue."
      cards={cards}
    />
  );
}
