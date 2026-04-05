"use client";

import { useEffect, useState } from "react";
import { authedGet } from "@/lib/auth-client";

type OverviewPayload = {
  wallet: {
    totalBalance: number;
    heldBalance: number;
    availableBalance: number;
    lowBalanceThreshold: number;
    needsAttention: boolean;
  };
  recipientCount: number;
  pendingApprovals: number;
  schedules: Array<{ id: string; name: string; type: string; recipientCount: number }>;
  payments: Array<{
    id: string;
    reference: string;
    amount: number;
    status: string;
    recipient: string;
    createdAt: string;
  }>;
};

const formatNgn = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2
  }).format(value);

export function OverviewConsole() {
  const [data, setData] = useState<OverviewPayload | null>(null);

  useEffect(() => {
    authedGet<OverviewPayload>("/api/dashboard/live")
      .then(setData)
      .catch(() => setData(null));
  }, []);

  if (!data) {
    return (
      <div className="surface rounded-[28px] p-5 text-sm text-[var(--color-ink-soft)]">
        Sign in to load your live dashboard overview.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-4">
        {[
          ["Available balance", formatNgn(data.wallet.availableBalance)],
          ["Held funds", formatNgn(data.wallet.heldBalance)],
          ["Active recipients", String(data.recipientCount)],
          ["Pending approvals", String(data.pendingApprovals)]
        ].map(([label, value]) => (
          <article key={label} className="surface rounded-[28px] p-5">
            <div className="text-sm text-[var(--color-ink-soft)]">{label}</div>
            <div className="mt-4 font-[family-name:var(--font-heading)] text-4xl">{value}</div>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="metric-cream rounded-[30px] border border-[var(--color-line)] p-6">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-amber)]">
            Wallet hero
          </div>
          <div className="mt-4 font-[family-name:var(--font-heading)] text-5xl sm:text-6xl">
            {formatNgn(data.wallet.totalBalance)}
          </div>
          <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">
            Threshold: {formatNgn(data.wallet.lowBalanceThreshold)}.
            {data.wallet.needsAttention ? " Wallet balance needs attention." : " Wallet is above the alert threshold."}
          </p>
        </article>

        <div className="space-y-4">
          {data.schedules.map((schedule) => (
            <article key={schedule.id} className="surface rounded-[28px] p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
                {schedule.type}
              </div>
              <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl">
                {schedule.name}
              </h3>
              <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
                {schedule.recipientCount} recipients linked to this run.
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="surface overflow-hidden rounded-[30px]">
        <div className="border-b border-[var(--color-line)] px-5 py-4 sm:px-6">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl">Recent payment activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
              <tr>
                <th className="px-5 py-4 sm:px-6">Reference</th>
                <th className="px-5 py-4">Recipient</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="border-t border-[var(--color-line)] px-5 py-4 sm:px-6">{payment.reference}</td>
                  <td className="border-t border-[var(--color-line)] px-5 py-4">{payment.recipient}</td>
                  <td className="border-t border-[var(--color-line)] px-5 py-4">{formatNgn(payment.amount)}</td>
                  <td className="border-t border-[var(--color-line)] px-5 py-4">{payment.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
