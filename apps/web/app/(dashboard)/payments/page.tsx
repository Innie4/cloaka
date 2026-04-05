import { PageFrame } from "@/components/layout/page-frame";
import { PaymentsConsole } from "@/components/payments/payments-console";

export default function PaymentsPage() {
  return (
    <PageFrame
      eyebrow="Payments"
      title="Payment history should scan in seconds."
      description="Create, retry, execute, and reconcile disbursements from one surface, with payment status and recipient context kept in the same view."
    >
      <PaymentsConsole />
    </PageFrame>
  );
}
