"use client";

import { nigerianBanks, type BankReference } from "@cloaka/shared";
import { useEffect, useMemo, useState } from "react";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { authedGet, authedPost } from "@/lib/auth-client";

type RecipientType = "EMPLOYEE" | "VENDOR" | "CONTRACTOR" | "OTHER";
type RecipientSummary = {
  id: string;
  type: RecipientType;
  fullName: string;
  bankName: string;
  bankCode: string | null;
  maskedAccountNumber: string;
  accountName: string;
  department: string | null;
  tags: string[];
  isActive: boolean;
  lastPaymentAt: string | null;
};
type RecipientDetail = RecipientSummary & {
  paymentHistory: Array<{
    id: string;
    reference: string;
    amount: string;
    status: string;
    type: string;
    createdAt: string;
    failureReason: string | null;
  }>;
};
type VerifiedAccount = {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  provider: string;
};
type FormState = {
  fullName: string;
  type: RecipientType;
  bankCode: string;
  accountNumber: string;
  department: string;
  tags: string;
};
type CsvRow = { index: number; row: FormState; errors: string[] };

const initialForm: FormState = {
  fullName: "",
  type: "EMPLOYEE",
  bankCode: "",
  accountNumber: "",
  department: "",
  tags: ""
};

const normalize = (form: FormState) => ({
  ...form,
  fullName: form.fullName.trim(),
  accountNumber: form.accountNumber.replace(/\D/g, ""),
  department: form.department.trim() || undefined,
  tags: form.tags
    .split(/[|,]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
});

export function RecipientsConsole() {
  const { business, formatDate, formatMoney, hasFeature, t } = useWorkspace();
  const [banks, setBanks] = useState<BankReference[]>(nigerianBanks);
  const [recipients, setRecipients] = useState<RecipientSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientDetail | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [verifiedAccount, setVerifiedAccount] = useState<VerifiedAccount | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecipientType | "ALL">("ALL");
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvContent, setCsvContent] = useState("");
  const [message, setMessage] = useState("Load a live session to manage recipients.");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const tags = useMemo(
    () => [...new Set(recipients.flatMap((recipient) => recipient.tags))].sort(),
    [recipients]
  );

  const filteredRecipients = useMemo(
    () =>
      recipients.filter((recipient) => {
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          recipient.fullName.toLowerCase().includes(query) ||
          recipient.bankName.toLowerCase().includes(query) ||
          recipient.tags.some((tag) => tag.toLowerCase().includes(query));
        const matchesType = typeFilter === "ALL" || recipient.type === typeFilter;
        return matchesSearch && matchesType;
      }),
    [recipients, search, typeFilter]
  );

  async function loadRecipients() {
    try {
      const [bankData, recipientData] = await Promise.all([
        authedGet<BankReference[]>("/api/recipients/banks"),
        authedGet<RecipientSummary[]>("/api/recipients/live")
      ]);
      setBanks(bankData);
      setRecipients(recipientData);
      setMessage(
        recipientData.length
          ? `${recipientData.length} recipients loaded from the live API.`
          : "No recipients yet. Add one or import a CSV template."
      );
      setError(null);
    } catch (caughtError) {
      const nextError =
        caughtError instanceof Error ? caughtError.message : "Unable to load recipients.";
      setError(nextError);
      setMessage(nextError);
    }
  }

  useEffect(() => {
    loadRecipients().catch(() => undefined);
  }, []);

  async function verifyAccount() {
    setBusy(true);
    try {
      const verification = await authedPost<VerifiedAccount>("/api/recipients/verify-account", {
        bankCode: form.bankCode,
        accountNumber: form.accountNumber
      });
      setVerifiedAccount(verification);
      setMessage(`Verified with ${verification.provider}: ${verification.accountName}`);
      setError(null);
    } catch (caughtError) {
      setVerifiedAccount(null);
      setError(caughtError instanceof Error ? caughtError.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  async function saveRecipient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = normalize(form);
      if (
        !verifiedAccount ||
        verifiedAccount.bankCode !== payload.bankCode ||
        verifiedAccount.accountNumber !== payload.accountNumber
      ) {
        throw new Error("Verify the account before saving this recipient.");
      }
      await authedPost("/api/recipients/live", payload);
      setForm(initialForm);
      setVerifiedAccount(null);
      await loadRecipients();
      setMessage("Recipient saved successfully.");
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not save recipient.");
    } finally {
      setBusy(false);
    }
  }

  async function openRecipient(id: string) {
    try {
      setSelectedRecipient(await authedGet<RecipientDetail>(`/api/recipients/live/${id}`));
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load detail.");
    }
  }

  async function deactivateSelected() {
    if (!selectedIds.length) return;
    setBusy(true);
    try {
      const result = await authedPost<{ deactivatedCount: number }>(
        "/api/recipients/live/bulk-deactivate",
        { ids: selectedIds }
      );
      setSelectedIds([]);
      await loadRecipients();
      setMessage(`${result.deactivatedCount} recipients were deactivated.`);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Bulk deactivate failed.");
    } finally {
      setBusy(false);
    }
  }

  function downloadTemplate() {
    const template = [
      "fullName,type,bankCode,accountNumber,department,tags",
      "Adaobi Nwosu,EMPLOYEE,058,0123456789,Operations,salary|ops",
      "Luma Logistics,VENDOR,044,1234567890,Procurement,vendor|fleet"
    ].join("\n");
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cloaka-recipient-template.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async function previewCsv(event: React.ChangeEvent<HTMLInputElement>) {
    if (!hasFeature("csv_import")) {
      setMessage("Upgrade to Growth or above to use CSV recipient import.");
      event.target.value = "";
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;
    const nextCsvContent = await file.text();
    setBusy(true);

    try {
      const result = await authedPost<{
        totalRows: number;
        validRows: number;
        rows: Array<{
          rowNumber: number;
          valid: boolean;
          input: Record<string, string>;
          errors: string[];
        }>;
      }>("/api/recipients/import", {
        csvContent: nextCsvContent,
        commit: false
      });

      setCsvContent(nextCsvContent);
      setCsvRows(
        result.rows.map((row) => ({
          index: row.rowNumber,
          row: {
            fullName: row.input.fullName ?? "",
            type: ((row.input.type as RecipientType) || "EMPLOYEE") as RecipientType,
            bankCode: row.input.bankCode ?? "",
            accountNumber: row.input.accountNumber ?? "",
            department: row.input.department ?? "",
            tags: row.input.tags ?? ""
          },
          errors: row.errors
        }))
      );
      setMessage(`${result.validRows} rows are ready to import.`);
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not parse the CSV.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  async function importValidRows() {
    if (!hasFeature("csv_import")) {
      setMessage("Upgrade to Growth or above to use CSV recipient import.");
      return;
    }

    if (!csvContent) return;
    setBusy(true);
    try {
      const result = await authedPost<{
        importedCount: number;
        failedCount: number;
        failures: Array<{ rowNumber: number; message: string }>;
      }>("/api/recipients/import", {
        csvContent,
        commit: true
      });

      await loadRecipients();
      setCsvRows([]);
      setCsvContent("");
      setError(
        result.failedCount
          ? result.failures.map((failure) => `Row ${failure.rowNumber}: ${failure.message}`).join(" ")
          : null
      );
      setMessage(
        result.failedCount
          ? `${result.importedCount} rows imported. ${result.failedCount} rows failed.`
          : `${result.importedCount} recipients imported successfully.`
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
                {t("Directory health")}
              </div>
              <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
                {t("Verified recipients, not spreadsheet drift.")}
              </h3>
            </div>
            <button type="button" onClick={deactivateSelected} disabled={!selectedIds.length || busy} className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold disabled:opacity-40">
              {t("Deactivate selected")}
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="metric-cream rounded-[24px] border border-[var(--color-line)] p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">{t("Active")}</div>
              <div className="mt-3 text-3xl font-semibold">{recipients.filter((recipient) => recipient.isActive).length}</div>
            </div>
            <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">{t("Tags")}</div>
              <div className="mt-3 text-3xl font-semibold">{tags.length}</div>
            </div>
            <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">{t("CSV ready")}</div>
              <div className="mt-3 text-3xl font-semibold">{csvRows.filter((row) => row.errors.length === 0).length}</div>
            </div>
          </div>
          <div className="mt-5 rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-4 text-sm leading-7 text-[var(--color-ink-soft)]">
            {error ? <span className="text-[var(--color-rose)]">{error}</span> : message}
          </div>
          <div className="mt-4 rounded-[24px] border border-dashed border-[var(--color-line)] bg-[var(--color-cream)] p-4 text-sm text-[var(--color-ink-soft)]">
            {t("Plan limit")}: {business?.limits.maxRecipients ?? 5} {t("recipients")} |{" "}
            {hasFeature("csv_import") ? t("CSV import enabled") : t("CSV import unlocks on Growth and above")}
          </div>
        </div>

        <form onSubmit={saveRecipient} className="surface rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">{t("Add recipient")}</div>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">{t("Verify before you save.")}</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input value={form.fullName} onChange={(event) => { setForm({ ...form, fullName: event.target.value }); }} className="sm:col-span-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder={t("Full name")} required />
            <select value={form.type} onChange={(event) => { setForm({ ...form, type: event.target.value as RecipientType }); }} className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]"><option value="EMPLOYEE">{t("Employee")}</option><option value="VENDOR">{t("Vendor")}</option><option value="CONTRACTOR">{t("Contractor")}</option><option value="OTHER">{t("Other")}</option></select>
            <input value={form.department} onChange={(event) => { setForm({ ...form, department: event.target.value }); }} className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder={t("Department")} />
            <select value={form.bankCode} onChange={(event) => { setForm({ ...form, bankCode: event.target.value }); setVerifiedAccount(null); }} className="sm:col-span-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" required><option value="">{t("Select bank")}</option>{banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name} ({bank.code})</option>)}</select>
            <input value={form.accountNumber} onChange={(event) => { setForm({ ...form, accountNumber: event.target.value }); setVerifiedAccount(null); }} className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder={t("Account number")} inputMode="numeric" maxLength={10} required />
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">{verifiedAccount?.accountName ?? t("Verify to reveal account name.")}</div>
            <input value={form.tags} onChange={(event) => { setForm({ ...form, tags: event.target.value }); }} className="sm:col-span-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder={t("Tags: salary, ops")} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={verifyAccount} disabled={busy} className="rounded-full border border-[var(--color-line)] px-4 py-3 text-sm font-semibold disabled:opacity-40">{t("Verify account")}</button>
            <button type="submit" disabled={busy} className="rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy ? t("Working...") : t("Save recipient")}</button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">{t("CSV import")}</div>
              <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">{t("Import with a validation report first.")}</h3>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={downloadTemplate} className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold">{t("Download template")}</button>
              <label className={`rounded-full px-4 py-2 text-sm font-semibold ${hasFeature("csv_import") ? "bg-[var(--color-sidebar)] text-white" : "border border-[var(--color-line)] text-[var(--color-ink-soft)]"}`}>
                {hasFeature("csv_import") ? t("Upload CSV") : t("Locked on Starter")}
                <input type="file" accept=".csv" className="hidden" onChange={previewCsv} disabled={!hasFeature("csv_import")} />
              </label>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {csvRows.length ? (
              csvRows.map((row) => (
                <div key={`${row.index}-${row.row.fullName}`} className="rounded-[24px] border border-[var(--color-line)] bg-white p-4 text-sm">
                  <div className="font-semibold">
                    {t("Row")} {row.index}: {row.row.fullName || t("Unnamed recipient")}
                  </div>
                  <div className={`mt-2 leading-7 ${row.errors.length ? "text-[var(--color-rose)]" : "text-[var(--color-ink-soft)]"}`}>
                    {row.errors.length ? row.errors.join(" ") : t("Ready to import.")}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-5 text-sm leading-7 text-[var(--color-ink-soft)]">
                {t("Upload a CSV to preview valid rows and errors before import.")}
              </div>
            )}
          </div>
          {csvRows.length ? (
            <button type="button" onClick={importValidRows} disabled={busy || !csvRows.some((row) => row.errors.length === 0) || !hasFeature("csv_import")} className="mt-5 rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">
              {t("Import valid rows")}
            </button>
          ) : null}
        </div>

        <div className="surface rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">{t("Recipient detail")}</div>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">{t("Payment history without leaving the table.")}</h3>
          {selectedRecipient ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
                <div className="text-xl font-semibold">{selectedRecipient.fullName}</div>
                <div className="mt-1 text-sm text-[var(--color-ink-soft)]">
                  {selectedRecipient.bankName} {selectedRecipient.maskedAccountNumber}
                </div>
                <div className="mt-4 grid gap-3 text-sm text-[var(--color-ink-soft)] sm:grid-cols-2">
                  <div>{t("Verified name")}: {selectedRecipient.accountName}</div>
                  <div>{t("Department")}: {selectedRecipient.department ?? t("Not set")}</div>
                  <div>{t("Last payment")}: {selectedRecipient.lastPaymentAt ? formatDate(selectedRecipient.lastPaymentAt) : t("No payment yet")}</div>
                  <div>{t("Tags")}: {selectedRecipient.tags.join(", ") || t("No tags yet")}</div>
                </div>
              </div>
              <div className="space-y-3">
                {selectedRecipient.paymentHistory.length ? (
                  selectedRecipient.paymentHistory.map((payment) => (
                    <div key={payment.id} className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{payment.reference}</div>
                        <div className="text-sm font-semibold">{formatMoney(payment.amount)}</div>
                      </div>
                      <div className="mt-2 text-sm text-[var(--color-ink-soft)]">
                        {payment.status} | {payment.type} | {formatDate(payment.createdAt)}
                      </div>
                      {payment.failureReason ? <div className="mt-2 text-sm text-[var(--color-rose)]">{payment.failureReason}</div> : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-4 text-sm leading-7 text-[var(--color-ink-soft)]">
                    {t("No payments have been recorded for this recipient yet.")}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-5 text-sm leading-7 text-[var(--color-ink-soft)]">
              {t("Select any recipient row to inspect its payment history.")}
            </div>
          )}
        </div>
      </section>

      <section className="surface rounded-[28px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">{t("Directory table")}</div>
            <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">{t("Filter by type and search across the payout directory.")}</h3>
          </div>
          <div className="text-sm text-[var(--color-ink-soft)]">
            {filteredRecipients.length} {t("visible recipients")}
          </div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
          <input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder={t("Search name, bank, or tag")} />
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as RecipientType | "ALL")} className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]"><option value="ALL">{t("All recipient types")}</option><option value="EMPLOYEE">{t("Employees")}</option><option value="VENDOR">{t("Vendors")}</option><option value="CONTRACTOR">{t("Contractors")}</option><option value="OTHER">{t("Other")}</option></select>
        </div>
        {tags.length ? <div className="mt-4 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full border border-[var(--color-line)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">{tag}</span>)}</div> : null}
        <div className="mt-5 overflow-x-auto rounded-[24px] border border-[var(--color-line)] bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-[rgba(13,31,56,0.04)] text-[var(--color-ink-soft)]"><tr><th className="px-4 py-3"><input type="checkbox" checked={filteredRecipients.length > 0 && filteredRecipients.every((recipient) => selectedIds.includes(recipient.id))} onChange={(event) => setSelectedIds(event.target.checked ? filteredRecipients.map((recipient) => recipient.id) : [])} /></th><th className="px-4 py-3 font-medium">{t("Name")}</th><th className="px-4 py-3 font-medium">{t("Type")}</th><th className="px-4 py-3 font-medium">{t("Bank")}</th><th className="px-4 py-3 font-medium">{t("Account")}</th><th className="px-4 py-3 font-medium">{t("Department")}</th><th className="px-4 py-3 font-medium">{t("Actions")}</th></tr></thead><tbody>{filteredRecipients.map((recipient) => <tr key={recipient.id} className="border-t border-[var(--color-line)] hover:bg-[rgba(13,31,56,0.02)]"><td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(recipient.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, recipient.id] : current.filter((value) => value !== recipient.id))} /></td><td className="px-4 py-4"><div className="font-semibold">{recipient.fullName}</div><div className="text-xs text-[var(--color-ink-soft)]">{recipient.tags.join(", ") || t("No tags")}</div></td><td className="px-4 py-4"><span className="rounded-full bg-[rgba(37,99,235,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">{recipient.type}</span></td><td className="px-4 py-4 text-[var(--color-ink-soft)]">{recipient.bankName}</td><td className="px-4 py-4 text-[var(--color-ink-soft)]">{recipient.maskedAccountNumber}</td><td className="px-4 py-4 text-[var(--color-ink-soft)]">{recipient.department ?? t("Not set")}</td><td className="px-4 py-4"><button type="button" onClick={() => openRecipient(recipient.id)} className="text-sm font-semibold text-[var(--color-blue)]">{t("View detail")}</button></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
