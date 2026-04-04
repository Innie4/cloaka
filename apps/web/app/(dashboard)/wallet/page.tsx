import { dashboardMetrics } from "@cloaka/shared";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PageFrame } from "@/components/layout/page-frame";

export default function WalletPage() {
  return (
    <PageFrame
      eyebrow="Wallet"
      title="The balance view should reassure first, then inform."
      description="This shell leans into Mercury-style calm: one proud balance number, available-versus-held context, and a ledger-first understanding of where money is going next."
    >
      <section className="metric-cream rounded-[30px] border border-[var(--color-line)] p-6 sm:p-8">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-amber)]">
          Current position
        </div>
        <div className="mt-4 font-[family-name:var(--font-heading)] text-5xl sm:text-6xl">
          NGN 12,480,000
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {dashboardMetrics.slice(0, 3).map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>
    </PageFrame>
  );
}
