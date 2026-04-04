type SectionCardProps = {
  eyebrow: string;
  title: string;
  body: string;
  meta: string;
};

export function SectionCard({ eyebrow, title, body, meta }: SectionCardProps) {
  return (
    <article className="surface rounded-[28px] p-5">
      <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
        {eyebrow}
      </div>
      <h3 className="mt-3 font-[family-name:var(--font-heading)] text-2xl leading-tight">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{body}</p>
      <div className="mt-4 rounded-full bg-[rgba(15,23,42,0.04)] px-3 py-2 text-xs font-medium text-[var(--color-ink-soft)]">
        {meta}
      </div>
    </article>
  );
}
