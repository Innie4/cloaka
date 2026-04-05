"use client";

import { useEffect, useState } from "react";
import { authedGet } from "@/lib/auth-client";

type ReportsPayload = {
  summary: {
    totalDisbursed: number;
    paidCount: number;
    failedCount: number;
    pendingApprovalCount: number;
    withheldCount: number;
  };
  byStatus: Array<{
    status: string;
    count: number;
    totalAmount: number;
  }>;
  byType: Array<{
    type: string;
    count: number;
    totalAmount: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    count: number;
    totalAmount: number;
  }>;
  failedPayments: Array<{
    id: string;
    reference: string;
    amount: number;
    recipient: string;
    failureReason: string | null;
    createdAt: string;
  }>;
};

const formatNgn = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2
  }).format(value);

export function ReportsConsole() {
  const [data, setData] = useState<ReportsPayload | null>(null);
  const [message, setMessage] = useState("Live reporting for payments, failures, and trends.");

  useEffect(() => {
    authedGet<ReportsPayload>("/api/reports/live")
      .then((result) => {
        setData(result);
        setMessage("Live reports loaded.");
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "Unable to load reports.");
      });
  }, []);

  return (
    <div className="space-y-6">
      <section className="surface rounded-[28px] p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
          Reporting
        </div>
        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
          Answers first, spreadsheets second
        </h3>
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">{message}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {data
            ? [
                ["Disbursed", formatNgn(data.summary.totalDisbursed)],
                ["Paid", String(data.summary.paidCount)],
                ["Failed", String(data.summary.failedCount)],
                ["Awaiting approval", String(data.summary.pendingApprovalCount)],
                ["Withheld", String(data.summary.withheldCount)]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">{label}</div>
                  <div className="mt-2 text-2xl font-semibold">{value}</div>
                </div>
              ))
            : null}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="surface rounded-[28px] p-5">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl">By status</h3>
          <div className="mt-4 space-y-3">
            {data?.byStatus.map((item) => (
              <div key={item.status} className="rounded-[22px] border border-[var(--color-line)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{item.status}</div>
                  <div className="text-sm text-[var(--color-ink-soft)]">{item.count} payments</div>
                </div>
                <div className="mt-2 text-sm text-[var(--color-ink-soft)]">{formatNgn(item.totalAmount)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface rounded-[28px] p-5">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl">By type</h3>
          <div className="mt-4 space-y-3">
            {data?.byType.map((item) => (
              <div key={item.type} className="rounded-[22px] border border-[var(--color-line)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{item.type}</div>
                  <div className="text-sm text-[var(--color-ink-soft)]">{item.count} payments</div>
                </div>
                <div className="mt-2 text-sm text-[var(--color-ink-soft)]">{formatNgn(item.totalAmount)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="surface rounded-[28px] p-5">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl">Monthly trend</h3>
          <div className="mt-4 space-y-3">
            {data?.monthlyTrend.map((item) => (
              <div key={item.month} className="rounded-[22px] border border-[var(--color-line)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{item.month}</div>
                  <div className="text-sm text-[var(--color-ink-soft)]">{item.count} payments</div>
                </div>
                <div className="mt-2 text-sm text-[var(--color-ink-soft)]">{formatNgn(item.totalAmount)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="surface rounded-[28px] p-5">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl">Recent failures</h3>
          <div className="mt-4 space-y-3">
            {data?.failedPayments.length ? data.failedPayments.map((payment) => (
              <div key={payment.id} className="rounded-[22px] border border-[var(--color-line)] bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">{payment.reference}</div>
                  <div className="text-sm text-[var(--color-ink-soft)]">{formatNgn(payment.amount)}</div>
                </div>
                <div className="mt-2 text-sm text-[var(--color-ink-soft)]">
                  {payment.recipient} | {payment.failureReason || "Unknown reason"}
                </div>
              </div>
            )) : (
              <div className="rounded-[22px] border border-dashed border-[var(--color-line)] bg-white p-4 text-sm text-[var(--color-ink-soft)]">
                No failed payments right now.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
