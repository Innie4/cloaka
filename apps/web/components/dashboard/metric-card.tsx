import type { Metric } from "@cloaka/shared";

const toneClass: Record<Metric["tone"], string> = {
  neutral: "text-[var(--color-blue)] bg-[rgba(37,99,235,0.08)]",
  positive: "text-[var(--color-green)] bg-[rgba(21,159,107,0.1)]",
  warning: "text-[var(--color-amber)] bg-[rgba(217,119,6,0.12)]"
};

export function MetricCard({ label, value, change, tone }: Metric) {
  return (
    <article className="surface rounded-[28px] p-5">
      <div className="text-sm text-[var(--color-ink-soft)]">{label}</div>
      <div className="mt-4 font-[family-name:var(--font-heading)] text-4xl">{value}</div>
      <div
        className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${toneClass[tone]}`}
      >
        {change}
      </div>
    </article>
  );
}
