import { PageFrame } from "@/components/layout/page-frame";
import { RecipientsConsole } from "@/components/recipients/recipients-console";

export default function RecipientsPage() {
  return (
    <PageFrame
      eyebrow="Recipients"
      title="A payout directory that stays calm even when the business gets messy."
      description="Add verified salary recipients, vendors, and contractors from one screen. Filter the directory, import a CSV with a validation report, and deactivate people in bulk without exposing raw account numbers."
    >
      <RecipientsConsole />
    </PageFrame>
  );
}
