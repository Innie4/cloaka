"use client";

import { nigerianBanks, type BankReference } from "@cloaka/shared";
import { useEffect, useMemo, useState } from "react";
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

const formatDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "Africa/Lagos"
      }).format(new Date(value))
    : "No payment yet";

const formatNgn = (value: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2
  }).format(Number(value));

const normalize = (form: FormState) => ({
  ...form,
  fullName: form.fullName.trim(),
  accountNumber: form.accountNumber.replace(/\D/g, ""),
  department: form.department.trim() || undefined,
  tags: form.tags.split(/[|,]/).map((tag) => tag.trim()).filter(Boolean)
});

function splitCsv(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (const character of line) {
    if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }
  cells.push(current.trim());
  return cells;
}

export function RecipientsConsole() {
  const [banks, setBanks] = useState<BankReference[]>(nigerianBanks);
  const [recipients, setRecipients] = useState<RecipientSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientDetail | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [verifiedAccount, setVerifiedAccount] = useState<VerifiedAccount | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<RecipientType | "ALL">("ALL");
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
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
    const file = event.target.files?.[0];
    if (!file) return;
    const lines = (await file.text()).split(/\r?\n/).filter(Boolean);
    const headers = splitCsv(lines[0] ?? "");
    const rows = lines.slice(1).map((line, index) => {
      const cells = splitCsv(line);
      const record = Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ""]));
      const row: FormState = {
        fullName: record.fullName ?? "",
        type: ((record.type as RecipientType) || "EMPLOYEE") as RecipientType,
        bankCode: record.bankCode ?? "",
        accountNumber: record.accountNumber ?? "",
        department: record.department ?? "",
        tags: record.tags ?? ""
      };
      const errors = [
        ...(row.fullName.trim().length < 2 ? ["Full name is required."] : []),
        ...(!["EMPLOYEE", "VENDOR", "CONTRACTOR", "OTHER"].includes(row.type)
          ? ["Type is invalid."]
          : []),
        ...(!banks.some((bank) => bank.code === row.bankCode) ? ["Bank code is invalid."] : []),
        ...(!/^\d{10}$/.test(row.accountNumber.replace(/\D/g, ""))
          ? ["Account number must be 10 digits."]
          : [])
      ];
      return { index: index + 2, row, errors };
    });
    setCsvRows(rows);
    setMessage(`${rows.filter((row) => row.errors.length === 0).length} rows are ready to import.`);
    event.target.value = "";
  }

  async function importValidRows() {
    const validRows = csvRows.filter((row) => row.errors.length === 0);
    if (!validRows.length) return;
    setBusy(true);
    const failures: string[] = [];
    for (const row of validRows) {
      try {
        await authedPost("/api/recipients/live", normalize(row.row));
      } catch (caughtError) {
        failures.push(`Row ${row.index}: ${caughtError instanceof Error ? caughtError.message : "Import failed."}`);
      }
    }
    await loadRecipients();
    setBusy(false);
    setError(failures.length ? failures.join(" ") : null);
    setMessage(
      failures.length
        ? `${validRows.length - failures.length} rows imported. ${failures.length} failed.`
        : `${validRows.length} recipients imported successfully.`
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">Directory health</div>
              <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">Verified recipients, not spreadsheet drift.</h3>
            </div>
            <button type="button" onClick={deactivateSelected} disabled={!selectedIds.length || busy} className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold disabled:opacity-40">Deactivate selected</button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="metric-cream rounded-[24px] border border-[var(--color-line)] p-4"><div className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">Active</div><div className="mt-3 text-3xl font-semibold">{recipients.filter((recipient) => recipient.isActive).length}</div></div>
            <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4"><div className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">Tags</div><div className="mt-3 text-3xl font-semibold">{tags.length}</div></div>
            <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4"><div className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">CSV ready</div><div className="mt-3 text-3xl font-semibold">{csvRows.filter((row) => row.errors.length === 0).length}</div></div>
          </div>
          <div className="mt-5 rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-4 text-sm leading-7 text-[var(--color-ink-soft)]">{error ? <span className="text-[var(--color-rose)]">{error}</span> : message}</div>
        </div>

        <form onSubmit={saveRecipient} className="surface rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">Add recipient</div>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">Verify before you save.</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input value={form.fullName} onChange={(event) => { setForm({ ...form, fullName: event.target.value }); }} className="sm:col-span-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Full name" required />
            <select value={form.type} onChange={(event) => { setForm({ ...form, type: event.target.value as RecipientType }); }} className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]"><option value="EMPLOYEE">Employee</option><option value="VENDOR">Vendor</option><option value="CONTRACTOR">Contractor</option><option value="OTHER">Other</option></select>
            <input value={form.department} onChange={(event) => { setForm({ ...form, department: event.target.value }); }} className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Department" />
            <select value={form.bankCode} onChange={(event) => { setForm({ ...form, bankCode: event.target.value }); setVerifiedAccount(null); }} className="sm:col-span-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" required><option value="">Select bank</option>{banks.map((bank) => <option key={bank.code} value={bank.code}>{bank.name} ({bank.code})</option>)}</select>
            <input value={form.accountNumber} onChange={(event) => { setForm({ ...form, accountNumber: event.target.value }); setVerifiedAccount(null); }} className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Account number" inputMode="numeric" maxLength={10} required />
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">{verifiedAccount?.accountName ?? "Verify to reveal account name."}</div>
            <input value={form.tags} onChange={(event) => { setForm({ ...form, tags: event.target.value }); }} className="sm:col-span-2 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Tags: salary, ops" />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={verifyAccount} disabled={busy} className="rounded-full border border-[var(--color-line)] px-4 py-3 text-sm font-semibold disabled:opacity-40">Verify account</button>
            <button type="submit" disabled={busy} className="rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">{busy ? "Working..." : "Save recipient"}</button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface rounded-[28px] p-5">
          <div className="flex items-center justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">CSV import</div><h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">Import with a validation report first.</h3></div><div className="flex gap-3"><button type="button" onClick={downloadTemplate} className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold">Download template</button><label className="rounded-full bg-[var(--color-sidebar)] px-4 py-2 text-sm font-semibold text-white">Upload CSV<input type="file" accept=".csv" className="hidden" onChange={previewCsv} /></label></div></div>
          <div className="mt-5 space-y-3">{csvRows.length ? csvRows.map((row) => <div key={`${row.index}-${row.row.fullName}`} className="rounded-[24px] border border-[var(--color-line)] bg-white p-4 text-sm"><div className="font-semibold">Row {row.index}: {row.row.fullName || "Unnamed recipient"}</div><div className={`mt-2 leading-7 ${row.errors.length ? "text-[var(--color-rose)]" : "text-[var(--color-ink-soft)]"}`}>{row.errors.length ? row.errors.join(" ") : "Ready to import."}</div></div>) : <div className="rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-5 text-sm leading-7 text-[var(--color-ink-soft)]">Upload a CSV to preview valid rows and errors before import.</div>}</div>
          {csvRows.length ? <button type="button" onClick={importValidRows} disabled={busy || !csvRows.some((row) => row.errors.length === 0)} className="mt-5 rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-40">Import valid rows</button> : null}
        </div>

        <div className="surface rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">Recipient detail</div>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">Payment history without leaving the table.</h3>
          {selectedRecipient ? <div className="mt-5 space-y-4"><div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4"><div className="text-xl font-semibold">{selectedRecipient.fullName}</div><div className="mt-1 text-sm text-[var(--color-ink-soft)]">{selectedRecipient.bankName} {selectedRecipient.maskedAccountNumber}</div><div className="mt-4 grid gap-3 text-sm text-[var(--color-ink-soft)] sm:grid-cols-2"><div>Verified name: {selectedRecipient.accountName}</div><div>Department: {selectedRecipient.department ?? "Not set"}</div><div>Last payment: {formatDate(selectedRecipient.lastPaymentAt)}</div><div>Tags: {selectedRecipient.tags.join(", ") || "No tags yet"}</div></div></div><div className="space-y-3">{selectedRecipient.paymentHistory.length ? selectedRecipient.paymentHistory.map((payment) => <div key={payment.id} className="rounded-[24px] border border-[var(--color-line)] bg-white p-4"><div className="flex items-center justify-between gap-2"><div className="text-sm font-semibold">{payment.reference}</div><div className="text-sm font-semibold">{formatNgn(payment.amount)}</div></div><div className="mt-2 text-sm text-[var(--color-ink-soft)]">{payment.status} • {payment.type} • {formatDate(payment.createdAt)}</div>{payment.failureReason ? <div className="mt-2 text-sm text-[var(--color-rose)]">{payment.failureReason}</div> : null}</div>) : <div className="rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-4 text-sm leading-7 text-[var(--color-ink-soft)]">No payments have been recorded for this recipient yet.</div>}</div></div> : <div className="mt-5 rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-5 text-sm leading-7 text-[var(--color-ink-soft)]">Select any recipient row to inspect its payment history.</div>}
        </div>
      </section>

      <section className="surface rounded-[28px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">Directory table</div><h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">Filter by type and search across the payout directory.</h3></div><div className="text-sm text-[var(--color-ink-soft)]">{filteredRecipients.length} visible recipients</div></div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1.3fr_0.7fr]"><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Search name, bank, or tag" /><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as RecipientType | "ALL")} className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]"><option value="ALL">All recipient types</option><option value="EMPLOYEE">Employees</option><option value="VENDOR">Vendors</option><option value="CONTRACTOR">Contractors</option><option value="OTHER">Other</option></select></div>
        {tags.length ? <div className="mt-4 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="rounded-full border border-[var(--color-line)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">{tag}</span>)}</div> : null}
        <div className="mt-5 overflow-x-auto rounded-[24px] border border-[var(--color-line)] bg-white"><table className="min-w-full text-left text-sm"><thead className="bg-[rgba(13,31,56,0.04)] text-[var(--color-ink-soft)]"><tr><th className="px-4 py-3"><input type="checkbox" checked={filteredRecipients.length > 0 && filteredRecipients.every((recipient) => selectedIds.includes(recipient.id))} onChange={(event) => setSelectedIds(event.target.checked ? filteredRecipients.map((recipient) => recipient.id) : [])} /></th><th className="px-4 py-3 font-medium">Name</th><th className="px-4 py-3 font-medium">Type</th><th className="px-4 py-3 font-medium">Bank</th><th className="px-4 py-3 font-medium">Account</th><th className="px-4 py-3 font-medium">Department</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead><tbody>{filteredRecipients.map((recipient) => <tr key={recipient.id} className="border-t border-[var(--color-line)] hover:bg-[rgba(13,31,56,0.02)]"><td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(recipient.id)} onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, recipient.id] : current.filter((value) => value !== recipient.id))} /></td><td className="px-4 py-4"><div className="font-semibold">{recipient.fullName}</div><div className="text-xs text-[var(--color-ink-soft)]">{recipient.tags.join(", ") || "No tags"}</div></td><td className="px-4 py-4"><span className="rounded-full bg-[rgba(37,99,235,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">{recipient.type}</span></td><td className="px-4 py-4 text-[var(--color-ink-soft)]">{recipient.bankName}</td><td className="px-4 py-4 text-[var(--color-ink-soft)]">{recipient.maskedAccountNumber}</td><td className="px-4 py-4 text-[var(--color-ink-soft)]">{recipient.department ?? "Not set"}</td><td className="px-4 py-4"><button type="button" onClick={() => openRecipient(recipient.id)} className="text-sm font-semibold text-[var(--color-blue)]">View detail</button></td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
