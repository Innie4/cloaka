import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-5 py-8 text-[var(--color-ink)] sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <section className="surface overflow-hidden rounded-[32px]">
          <div className="grid gap-10 px-6 py-8 sm:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-12 lg:py-12">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full bg-[rgba(37,99,235,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                Cloaka v0 shell
              </div>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-[family-name:var(--font-heading)] text-4xl leading-tight sm:text-5xl lg:text-6xl">
                  A calmer way for Nigerian businesses to run every outgoing payment.
                </h1>
                <p className="max-w-2xl text-base leading-7 text-[var(--color-ink-soft)] sm:text-lg">
                  Cloaka is being shaped as a trust-first payment operating system for salaries,
                  contractor payouts, vendors, suppliers, approvals, and rule-based disbursement
                  logic.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Open dashboard shell
                </Link>
                <Link
                  href="/trust"
                  className="rounded-full border border-[var(--color-line)] bg-white px-5 py-3 text-sm font-semibold text-[var(--color-ink)]"
                >
                  Review trust page
                </Link>
              </div>
            </div>
            <div className="sidebar-surface rounded-[28px] p-5 text-white">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Design direction
                </div>
                <div className="mt-3 font-[family-name:var(--font-heading)] text-3xl">
                  Dark navy sidebar.
                  <br />
                  Light content surface.
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "Stripe-grade tables",
                    "Mercury-style balance hero",
                    "Ramp-clean approvals",
                    "Notion-calm rules builder"
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-white/80"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
