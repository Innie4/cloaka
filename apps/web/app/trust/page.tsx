import { getTrustData } from "@/lib/api";

export default async function TrustPage() {
  const trustPoints = await getTrustData();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="sidebar-surface overflow-hidden rounded-[32px] px-6 py-8 text-white sm:px-10">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">
              Public trust draft
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl leading-tight sm:text-5xl">
              Cloaka should explain trust before it asks anyone to move payroll through it.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/74">
              This page is a first shell for the trust narrative described in the PRD:
              infrastructure clarity, partner disclosure, audit visibility, incident response, and
              plain-language compliance framing.
            </p>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {trustPoints.map((item) => (
            <article key={item.title} className="surface rounded-[28px] p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
                Trust pillar
              </div>
              <h2 className="mt-3 font-[family-name:var(--font-heading)] text-2xl">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{item.body}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
