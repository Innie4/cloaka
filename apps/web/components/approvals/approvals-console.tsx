"use client";

import { useEffect, useState } from "react";
import { authedGet, authedPost } from "@/lib/auth-client";

type ApprovalRow = {
  id: string;
  status: string;
  comment: string | null;
  payment: {
    id: string;
    reference: string;
    amount: string;
    status: string;
    recipient: {
      fullName: string;
    } | null;
  };
  requester: {
    fullName: string;
    role: string;
  };
  approver: {
    fullName: string;
    role: string;
  };
  createdAt: string;
};

const formatNgn = (value: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2
  }).format(Number(value));

export function ApprovalsConsole() {
  const [approvals, setApprovals] = useState<ApprovalRow[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("Review pending payouts without losing context.");

  async function load() {
    try {
      const approvalData = await authedGet<ApprovalRow[]>("/api/approvals/live");
      setApprovals(approvalData);
      setMessage("Live approvals loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load approvals.");
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function approve(id: string) {
    await authedPost(`/api/approvals/${id}/approve`, {});
    await load();
    setMessage("Approval completed.");
  }

  async function reject(id: string) {
    await authedPost(`/api/approvals/${id}/reject`, {
      comment: comments[id] || "Rejected from the approvals console."
    });
    await load();
    setMessage("Approval rejected.");
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-[28px] p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
          Decision queue
        </div>
        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
          Amount first, action second, ambiguity nowhere
        </h3>
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">{message}</p>
      </section>

      <section className="grid gap-4">
        {approvals.map((approval) => (
          <article key={approval.id} className="surface rounded-[28px] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.16em] text-[var(--color-blue)]">
                  {approval.status}
                </div>
                <h3 className="mt-2 font-[family-name:var(--font-heading)] text-3xl">
                  {formatNgn(approval.payment.amount)}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                  {approval.payment.recipient?.fullName ?? "No recipient"} | {approval.payment.reference}
                </p>
              </div>
              <div className="rounded-[24px] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
                Requested by {approval.requester.fullName}
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
              <input value={comments[approval.id] || ""} onChange={(event) => setComments((current) => ({ ...current, [approval.id]: event.target.value }))} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Optional rejection reason" />
              <button type="button" onClick={() => reject(approval.id).catch(() => undefined)} className="rounded-full border border-[var(--color-line)] px-4 py-3 text-sm font-semibold">
                Reject
              </button>
              <button type="button" onClick={() => approve(approval.id).catch(() => undefined)} className="rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white">
                Approve
              </button>
            </div>
          </article>
        ))}
        {!approvals.length ? (
          <div className="rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-5 text-sm text-[var(--color-ink-soft)]">
            No approvals are waiting right now.
          </div>
        ) : null}
      </section>
    </div>
  );
}
