export function Topbar() {
  return (
    <div className="surface flex flex-col gap-4 rounded-[28px] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
          Lagos SME mode
        </div>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl sm:text-3xl">
          Business payment operating system
        </h1>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <div className="rounded-full bg-[rgba(21,159,107,0.12)] px-4 py-2 font-medium text-[var(--color-green)]">
          Wallet funded
        </div>
        <div className="rounded-full bg-[rgba(217,119,6,0.12)] px-4 py-2 font-medium text-[var(--color-amber)]">
          2 approvals pending
        </div>
      </div>
    </div>
  );
}
