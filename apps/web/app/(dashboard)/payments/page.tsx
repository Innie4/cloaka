import { TransactionTable } from "@/components/dashboard/transaction-table";
import { PageFrame } from "@/components/layout/page-frame";
import { getPaymentData } from "@/lib/api";

export default async function PaymentsPage() {
  const payments = await getPaymentData();

  return (
    <PageFrame
      eyebrow="Payments"
      title="Payment history should scan in seconds."
      description="The table treatment here is intentionally direct: recipient, amount, state, and timing first, with richer detail deferred to later flow work."
    >
      <TransactionTable rows={payments} />
    </PageFrame>
  );
}
