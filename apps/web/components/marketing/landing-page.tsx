import Link from "next/link";
import type { MarketingPageData } from "@cloaka/shared";

type LandingPageProps = {
  data: MarketingPageData;
};

export function LandingPage({ data }: LandingPageProps) {
  return (
    <main className="relative overflow-hidden px-4 pb-20 pt-5 text-[var(--color-ink)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-[var(--color-line)] bg-white/70 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-blue)]">
              Cloaka
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-ink-soft)]">
              Payment operating system for Nigerian SMEs with a rules engine at the core.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold text-[var(--color-ink-soft)]">
            {[
              ["What it does", "#what-it-does"],
              ["How it works", "#how-it-works"],
              ["Plans", "#pricing"],
              ["Trust", "#trust"]
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-[var(--color-line)] bg-white px-4 py-2 transition hover:-translate-y-0.5 hover:border-[rgba(37,99,235,0.25)]"
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>

        <section className="relative overflow-hidden rounded-[36px] border border-[rgba(13,31,56,0.08)] bg-[linear-gradient(135deg,#fffef8_0%,#eef4ff_48%,#f7fbff_100%)] px-5 py-8 shadow-[0_32px_80px_rgba(15,23,42,0.1)] sm:px-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.2),transparent_45%)]" />
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <div className="relative z-10">
              <div className="inline-flex items-center rounded-full border border-[rgba(37,99,235,0.12)] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
                {data.badge}
              </div>
              <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-heading)] text-4xl leading-[1.04] sm:text-5xl lg:text-[4.35rem]">
                {data.headline}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--color-ink-soft)] sm:text-lg">
                {data.subheadline}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--color-ink)]/72 sm:text-base">
                {data.positioning}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-full bg-[var(--color-sidebar)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Start with Starter
                </Link>
                <Link
                  href="/trust"
                  className="rounded-full border border-[var(--color-line)] bg-white px-6 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:-translate-y-0.5"
                >
                  Read the trust page
                </Link>
                <Link
                  href="/login"
                  className="rounded-full border border-transparent bg-[rgba(37,99,235,0.08)] px-6 py-3 text-sm font-semibold text-[var(--color-blue)] transition hover:-translate-y-0.5"
                >
                  Open the dashboard
                </Link>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {data.stats.map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-[24px] border border-[rgba(15,23,42,0.08)] bg-white/88 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
                  >
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                      {stat.label}
                    </div>
                    <div className="mt-3 font-[family-name:var(--font-heading)] text-3xl text-[var(--color-sidebar)]">
                      {stat.value}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{stat.detail}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <div className="sidebar-surface overflow-hidden rounded-[32px] p-5 text-white">
                <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                        Operations map
                      </div>
                      <div className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-tight">
                        Tomorrow&apos;s money, visible today.
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-right">
                      <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                        Available
                      </div>
                      <div className="mt-2 text-xl font-semibold">NGN 12.48m</div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {data.paymentLanes.slice(0, 4).map((lane, index) => (
                      <div
                        key={lane.title}
                        className="rounded-[22px] border border-white/10 bg-white/5 px-4 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-white">{lane.title}</div>
                          <div className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/65">
                            Lane 0{index + 1}
                          </div>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/72">{lane.summary}</p>
                        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#9cc4ff]">
                          {lane.cue}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[24px] border border-dashed border-[#7bb0ff]/25 bg-[#081426]/55 p-4">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">
                      Rules engine sample
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-white/78">
                      <div className="rounded-2xl bg-white/6 px-3 py-3">
                        If payout type is <span className="font-semibold text-white">Vendor</span>
                      </div>
                      <div className="rounded-2xl bg-white/6 px-3 py-3">
                        and amount is above <span className="font-semibold text-white">NGN 300k</span>
                      </div>
                      <div className="rounded-2xl bg-[#2563eb]/20 px-3 py-3 text-[#d8e8ff]">
                        route to approval before disbursement starts
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[30px] bg-[var(--color-sidebar)] px-6 py-7 text-white shadow-[0_28px_70px_rgba(13,31,56,0.28)]">
            <div className="text-[11px] uppercase tracking-[0.22em] text-white/55">
              Why Cloaka exists
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-tight">
              Nigerian SMEs are forced to run payment day across spreadsheets, bank apps, and memory.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/74">
              Cloaka turns outgoing payments into one operating rhythm: verified recipients, visible
              balance, scheduled runs, approval checkpoints, clear receipts, and a rules layer for
              the cases that should never be manual again.
            </p>
          </article>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Manual transfer fatigue",
                body: "Salary day should not require dozens of separate bank actions."
              },
              {
                title: "Wrong account and wrong amount risk",
                body: "Recipient verification and one source of truth reduce repeated entry errors."
              },
              {
                title: "Approval bottlenecks",
                body: "Finance should review risky payouts without stalling every small transfer."
              },
              {
                title: "No central narrative",
                body: "Receipts, references, logs, and reports should already be in the system when someone asks."
              }
            ].map((item) => (
              <article key={item.title} className="surface rounded-[28px] p-5">
                <h3 className="font-[family-name:var(--font-heading)] text-2xl text-[var(--color-sidebar)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="what-it-does" className="mt-8 rounded-[34px] border border-[var(--color-line)] bg-white/78 px-5 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:px-7 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
              What businesses can do with Cloaka
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-tight sm:text-4xl">
              Six payment lanes, one operating system.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
              Cloaka is not a narrow payroll app. The system is designed around every outgoing
              payment a Nigerian SME needs to control from one place.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {data.paymentLanes.map((lane) => (
              <article
                key={lane.title}
                className="rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,255,0.92))] p-5"
              >
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                  Payment lane
                </div>
                <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl text-[var(--color-sidebar)]">
                  {lane.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{lane.summary}</p>
                <div className="mt-5 rounded-[20px] bg-[var(--color-cream)] px-4 py-3 text-sm font-medium text-[var(--color-sidebar)]">
                  {lane.cue}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mt-8 grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="surface rounded-[30px] p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
              Operating flow
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-tight">
              The product story follows a five-step payment rhythm.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
              The onboarding and payout lifecycle in the PRD reads like a sequence, so the landing
              page mirrors that same progression.
            </p>
          </article>

          <div className="grid gap-4">
            {data.workflow.map((step) => (
              <article
                key={step.step}
                className="grid gap-4 rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white/90 p-5 md:grid-cols-[80px_1fr]"
              >
                <div className="rounded-[22px] bg-[var(--color-sidebar)] px-4 py-4 text-center text-white">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-white/55">Step</div>
                  <div className="mt-2 font-[family-name:var(--font-heading)] text-3xl">{step.step}</div>
                </div>
                <div>
                  <h3 className="font-[family-name:var(--font-heading)] text-2xl text-[var(--color-sidebar)]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{step.body}</p>
                  <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                    {step.meta}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[34px] bg-[linear-gradient(135deg,#0d1f38_0%,#142c4e_52%,#143767_100%)] px-5 py-7 text-white shadow-[0_32px_70px_rgba(13,31,56,0.28)] sm:px-7 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
              Product atlas
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-tight sm:text-4xl">
              Every room in the product has a job.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/72 sm:text-base">
              The landing page should explain the surface area clearly, so buyers can see that
              Cloaka covers onboarding, recipient operations, wallet discipline, approvals, rules,
              and reporting as one connected system.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.productCapabilities.map((capability) => (
              <article
                key={capability.title}
                className="rounded-[28px] border border-white/10 bg-white/6 p-5"
              >
                <div className="text-[11px] uppercase tracking-[0.18em] text-[#9ac2ff]">
                  {capability.eyebrow}
                </div>
                <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl text-white">
                  {capability.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/72">{capability.body}</p>
                <div className="mt-5 rounded-[20px] bg-white/8 px-4 py-3 text-sm text-white/84">
                  {capability.outcome}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
          <article className="surface rounded-[32px] p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
              Rules engine
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-tight">
              This is the feature that makes Cloaka feel unlike every payroll clone.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
              The PRD is explicit that Cloaka should not stop at regular payroll. The rules engine
              is what allows event-based and conditional payment release logic to exist inside a
              calm operator-facing workflow.
            </p>

            <div className="mt-6 rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-[var(--color-cream)] p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
                Plain-language builder
              </div>
              <div className="mt-4 grid gap-2 text-sm text-[var(--color-sidebar)]">
                <div className="rounded-2xl bg-white px-4 py-3">
                  If payout type is <span className="font-semibold">Contractor</span>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  and completion status is <span className="font-semibold">Confirmed</span>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  and wallet coverage is <span className="font-semibold">Sufficient</span>
                </div>
                <div className="rounded-2xl bg-[var(--color-sidebar)] px-4 py-3 text-white">
                  then release payout, otherwise hold for review
                </div>
              </div>
            </div>
          </article>

          <div className="grid gap-4">
            {data.rulesExamples.map((example) => (
              <article key={example.title} className="surface rounded-[30px] p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                  {example.when}
                </div>
                <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl text-[var(--color-sidebar)]">
                  {example.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{example.logic}</p>
                <div className="mt-4 rounded-[20px] bg-[rgba(37,99,235,0.08)] px-4 py-3 text-sm font-medium text-[var(--color-sidebar)]">
                  {example.release}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="mt-8 rounded-[34px] border border-[rgba(15,23,42,0.08)] bg-white/86 px-5 py-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:px-7 lg:px-8">
          <div className="max-w-3xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
              Pricing from the PRD
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-tight sm:text-4xl">
              Four plans, clear recipient limits, and a free entry point.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)] sm:text-base">
              Starter stays free, Growth and Scale are self-serve, and the product promise includes
              a three-month money-back guarantee when Cloaka causes a failure.
            </p>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-4">
            {data.pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[30px] border p-5 ${
                  plan.highlight
                    ? "border-[rgba(37,99,235,0.3)] bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_100%)] shadow-[0_20px_50px_rgba(37,99,235,0.12)]"
                    : "border-[rgba(15,23,42,0.08)] bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                      {plan.name}
                    </div>
                    <h3 className="mt-3 font-[family-name:var(--font-heading)] text-3xl text-[var(--color-sidebar)]">
                      {plan.price}
                    </h3>
                    <div className="mt-1 text-sm text-[var(--color-ink-soft)]">{plan.cadence}</div>
                  </div>
                  {plan.highlight ? (
                    <div className="rounded-full bg-[var(--color-sidebar)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                      Recommended
                    </div>
                  ) : null}
                </div>

                <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">{plan.audience}</p>
                <div className="mt-4 rounded-[22px] bg-[var(--color-cream)] px-4 py-3 text-sm font-semibold text-[var(--color-sidebar)]">
                  {plan.recipientLimit}
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">{plan.note}</p>
                <div className="mt-5 grid gap-2">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="rounded-2xl border border-[rgba(15,23,42,0.06)] px-4 py-3 text-sm text-[var(--color-ink)]"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-[28px] bg-[var(--color-sidebar)] px-5 py-5 text-white">
            <div className="text-[11px] uppercase tracking-[0.2em] text-white/55">Commercial rule</div>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-white/76">
              The v1 PRD explicitly says there is no extra NGN domestic per-transaction fee, paid
              plans are instant and self-serve, and the guarantee language should be visible enough
              to reduce adoption anxiety.
            </p>
          </div>
        </section>

        <section id="trust" className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {data.trustSignals.map((signal) => (
            <article key={signal.title} className="surface rounded-[30px] p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                Trust signal
              </div>
              <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl text-[var(--color-sidebar)]">
                {signal.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{signal.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.84fr_1.16fr]">
          <article className="rounded-[32px] bg-[linear-gradient(135deg,#fff6e9_0%,#fffdf9_100%)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-blue)]">
              FAQ
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-tight text-[var(--color-sidebar)]">
              Questions buyers will ask before they trust a new payment layer.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
              The answers here mirror the product framing in the PRD: broader than payroll, grounded
              in trust, and calm for non-technical operators.
            </p>
          </article>

          <div className="grid gap-4">
            {data.faq.map((item) => (
              <article key={item.question} className="surface rounded-[28px] p-5">
                <h3 className="font-[family-name:var(--font-heading)] text-2xl text-[var(--color-sidebar)]">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[34px] bg-[linear-gradient(135deg,#0d1f38_0%,#183f6f_56%,#20538f_100%)] px-6 py-8 text-white shadow-[0_28px_70px_rgba(13,31,56,0.32)] sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
                Ready to move from transfer chaos to operating rhythm?
              </div>
              <h2 className="mt-3 max-w-3xl font-[family-name:var(--font-heading)] text-3xl leading-tight sm:text-4xl">
                Start with the free plan, then unlock approvals, KYB, multi-admin controls, and the
                rules engine as the business grows.
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/75 sm:text-base">
                Cloaka is designed to earn trust before it earns expansion. The landing page should
                feel like that promise from the very first screen.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-sidebar)] transition hover:-translate-y-0.5"
              >
                Create workspace
              </Link>
              <Link
                href="/trust"
                className="rounded-full border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Review infrastructure story
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
