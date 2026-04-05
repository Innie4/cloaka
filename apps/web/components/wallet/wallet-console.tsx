"use client";

import { useEffect, useState } from "react";
import { authedGet, authedPost } from "@/lib/auth-client";

type WalletSummary = {
  totalBalance: number;
  heldBalance: number;
  availableBalance: number;
  lowBalanceThreshold: number;
  virtualAccountNumber: string | null;
  virtualAccountBank: string | null;
  accountName: string;
  needsAttention: boolean;
};

type LedgerEntry = {
  id: string;
  type: string;
  amount: string;
  reference: string;
  narration: string;
  occurredAt: string;
};

const formatNgn = (value: number | string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2
  }).format(Number(value));

export function WalletConsole() {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [amount, setAmount] = useState("500000");
  const [message, setMessage] = useState("Load a session to view wallet activity.");

  async function load() {
    try {
      const [nextSummary, nextLedger] = await Promise.all([
        authedGet<WalletSummary>("/api/wallet/summary"),
        authedGet<LedgerEntry[]>("/api/wallet/ledger")
      ]);
      setSummary(nextSummary);
      setLedger(nextLedger);
      setMessage("Live wallet data loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load wallet data.");
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function fundWallet() {
    await authedPost("/api/wallet/fund", {
      amount: Number(amount),
      narration: "Manual wallet funding"
    });
    await load();
    setMessage("Wallet funded successfully.");
  }

  return (
    <div className="space-y-6">
      <section className="metric-cream rounded-[30px] border border-[var(--color-line)] p-6 sm:p-8">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-amber)]">Current position</div>
        <div className="mt-4 font-[family-name:var(--font-heading)] text-5xl sm:text-6xl">
          {summary ? formatNgn(summary.totalBalance) : "NGN 0.00"}
        </div>
        <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{message}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {summary
            ? [
                ["Available", formatNgn(summary.availableBalance)],
                ["Held", formatNgn(summary.heldBalance)],
                ["Threshold", formatNgn(summary.lowBalanceThreshold)]
              ].map(([label, value]) => (
                <div key={label} className="rounded-[24px] bg-white/70 p-4">
                  <div className="text-xs uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">{label}</div>
                  <div className="mt-2 text-xl font-semibold">{value}</div>
                </div>
              ))
            : null}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="surface rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">Virtual account</div>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
            {summary?.virtualAccountBank ?? "Providus Bank"}
          </h3>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
            {summary?.accountName ?? "Cloaka Business"} • {summary?.virtualAccountNumber ?? "Not assigned"}
          </p>
          <div className="mt-5 flex gap-3">
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]"
            />
            <button
              type="button"
              onClick={() => fundWallet().catch(() => undefined)}
              className="rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white"
            >
              Fund
            </button>
          </div>
        </div>

        <div className="surface overflow-hidden rounded-[30px]">
          <div className="border-b border-[var(--color-line)] px-5 py-4 sm:px-6">
            <h3 className="font-[family-name:var(--font-heading)] text-2xl">Wallet ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
                <tr>
                  <th className="px-5 py-4 sm:px-6">Type</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Narration</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((entry) => (
                  <tr key={entry.id}>
                    <td className="border-t border-[var(--color-line)] px-5 py-4 sm:px-6">{entry.type}</td>
                    <td className="border-t border-[var(--color-line)] px-5 py-4">{formatNgn(entry.amount)}</td>
                    <td className="border-t border-[var(--color-line)] px-5 py-4">{entry.narration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
