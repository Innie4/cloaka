"use client";

import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { authedGet, authedPost } from "@/lib/auth-client";

type Recipient = { id: string; fullName: string; type: string };
type Payment = {
  id: string;
  reference: string;
  type: string;
  amount: string;
  status: string;
  recipient: { fullName: string } | null;
};

export function PaymentsConsole() {
  const { formatMoney, hasFeature, t } = useWorkspace();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [recipientId, setRecipientId] = useState("");
  const [amount, setAmount] = useState("165000");
  const [type, setType] = useState("Salary");
  const [message, setMessage] = useState("Create and execute live payments from this console.");

  async function load() {
    try {
      const [paymentData, recipientData] = await Promise.all([
        authedGet<Payment[]>("/api/payments/live"),
        authedGet<Array<{ id: string; fullName: string; type: string }>>("/api/recipients/live")
      ]);
      setPayments(paymentData);
      setRecipients(recipientData);
      if (!recipientId && recipientData[0]) {
        setRecipientId(recipientData[0].id);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load payments.");
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function createPayment() {
    await authedPost("/api/payments/live", {
      recipientId,
      amount: Number(amount),
      type
    });
    await load();
    setMessage("Payment created. It will execute immediately unless rules or approvals intercept it.");
  }

  async function runAction(path: string) {
    await authedPost(path, {});
    await load();
    setMessage("Payment action completed.");
  }

  return (
    <div className="space-y-6">
      <section className="surface rounded-[28px] p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">{t("Create payment")}</div>
        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">{t("One-time disbursement")}</h3>
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">{message}</p>
        {!hasFeature("approvals") ? (
          <div className="mt-4 rounded-[24px] border border-dashed border-[var(--color-line)] bg-[var(--color-cream)] p-4 text-sm text-[var(--color-ink-soft)]">
            {t("Starter workspaces can still create payments, but approval routing unlocks on Growth and above.")}
          </div>
        ) : null}
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_0.7fr_0.7fr_auto]">
          <select value={recipientId} onChange={(event) => setRecipientId(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]">
            {recipients.map((recipient) => (
              <option key={recipient.id} value={recipient.id}>
                {recipient.fullName} ({recipient.type})
              </option>
            ))}
          </select>
          <input value={type} onChange={(event) => setType(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" />
          <input value={amount} onChange={(event) => setAmount(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" />
          <button type="button" onClick={() => createPayment().catch(() => undefined)} className="rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white">{t("Create")}</button>
        </div>
      </section>

      <section className="surface overflow-hidden rounded-[30px]">
        <div className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4 sm:px-6">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl">{t("Live payments")}</h3>
          <button type="button" onClick={() => runAction("/api/payments/reconcile").catch(() => undefined)} className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold">{t("Reconcile")}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
              <tr>
                <th className="px-5 py-4 sm:px-6">{t("Reference")}</th>
                <th className="px-5 py-4">{t("Recipient")}</th>
                <th className="px-5 py-4">{t("Amount")}</th>
                <th className="px-5 py-4">{t("Status")}</th>
                <th className="px-5 py-4">{t("Action")}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="border-t border-[var(--color-line)] px-5 py-4 sm:px-6">{payment.reference}</td>
                  <td className="border-t border-[var(--color-line)] px-5 py-4">{payment.recipient?.fullName ?? t("No recipient")}</td>
                  <td className="border-t border-[var(--color-line)] px-5 py-4">{formatMoney(payment.amount)}</td>
                  <td className="border-t border-[var(--color-line)] px-5 py-4">{payment.status}</td>
                  <td className="border-t border-[var(--color-line)] px-5 py-4">
                    {payment.status === "FAILED" ? (
                      <button type="button" onClick={() => runAction(`/api/payments/${payment.id}/retry`).catch(() => undefined)} className="text-sm font-semibold text-[var(--color-blue)]">{t("Retry")}</button>
                    ) : payment.status === "SCHEDULED" ? (
                      <button type="button" onClick={() => runAction(`/api/payments/${payment.id}/execute`).catch(() => undefined)} className="text-sm font-semibold text-[var(--color-blue)]">{t("Execute")}</button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
