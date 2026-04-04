import type { PaymentRow } from "@cloaka/shared";

const statusClass: Record<PaymentRow["status"], string> = {
  Paid: "bg-[rgba(21,159,107,0.12)] text-[var(--color-green)]",
  Scheduled: "bg-[rgba(37,99,235,0.1)] text-[var(--color-blue)]",
  Withheld: "bg-[rgba(180,83,9,0.12)] text-[var(--color-rose)]",
  "Needs approval": "bg-[rgba(217,119,6,0.12)] text-[var(--color-amber)]"
};

export function TransactionTable({ rows }: { rows: PaymentRow[] }) {
  return (
    <div className="surface overflow-hidden rounded-[30px]">
      <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4 sm:px-6">
        <div>
          <h3 className="font-[family-name:var(--font-heading)] text-2xl">
            Recent payment activity
          </h3>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Stripe-grade density, but calmer and warmer for day-to-day payroll operations.
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
              <th className="px-5 py-4 font-medium sm:px-6">Recipient</th>
              <th className="px-5 py-4 font-medium">Type</th>
              <th className="px-5 py-4 font-medium">Amount</th>
              <th className="px-5 py-4 font-medium">Status</th>
              <th className="px-5 py-4 font-medium sm:px-6">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.recipient}-${row.date}`}>
                <td className="border-t border-[var(--color-line)] px-5 py-4 font-semibold sm:px-6">
                  {row.recipient}
                </td>
                <td className="border-t border-[var(--color-line)] px-5 py-4 text-sm text-[var(--color-ink-soft)]">
                  {row.type}
                </td>
                <td className="border-t border-[var(--color-line)] px-5 py-4 text-sm font-semibold">
                  {row.amount}
                </td>
                <td className="border-t border-[var(--color-line)] px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass[row.status]}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="border-t border-[var(--color-line)] px-5 py-4 text-sm text-[var(--color-ink-soft)] sm:px-6">
                  {row.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
