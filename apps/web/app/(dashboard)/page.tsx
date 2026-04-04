import { MetricCard } from "@/components/dashboard/metric-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { TransactionTable } from "@/components/dashboard/transaction-table";
import { PageFrame } from "@/components/layout/page-frame";
import { getOverviewData } from "@/lib/api";

export default async function DashboardPage() {
  const overview = await getOverviewData();

  return (
    <PageFrame
      eyebrow="Overview"
      title="A serious financial dashboard that still feels easy to breathe in."
      description="This first shell leans into the design board: dark navy navigation, warm balance treatment, scan-first tables, and approval context that stays above the fold."
    >
      <section className="grid gap-4 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="metric-cream rounded-[30px] border border-[var(--color-line)] p-6">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-amber)]">
            Wallet hero
          </div>
          <div className="mt-4 font-[family-name:var(--font-heading)] text-5xl sm:text-6xl">
            NGN 12,480,000
          </div>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-ink-soft)]">
            Available balance should be the proudest number on the page. Pair it with direct trust
            language about partner-bank custody and real-time ledger visibility.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              ["Available now", "NGN 12.48m"],
              ["Held for queued runs", "NGN 1.08m"],
              ["Low-balance threshold", "NGN 2.50m"]
            ].map(([label, value]) => (
              <div key={label} className="rounded-[24px] bg-white/70 p-4">
                <div className="text-xs uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                  {label}
                </div>
                <div className="mt-2 text-xl font-semibold">{value}</div>
              </div>
            ))}
          </div>
        </article>

        <div className="grid gap-4">
          <SectionCard {...overview.approvals[0]} />
          <SectionCard {...overview.rules[0]} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {overview.schedules.map((card) => (
          <SectionCard key={card.title} {...card} />
        ))}
      </section>

      <TransactionTable rows={overview.payments} />
    </PageFrame>
  );
}
