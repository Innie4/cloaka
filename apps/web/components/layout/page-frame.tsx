type PageFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function PageFrame({ eyebrow, title, description, children }: PageFrameProps) {
  return (
    <div className="space-y-6">
      <section className="surface rounded-[30px] p-6 sm:p-7">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
          {eyebrow}
        </div>
        <h2 className="mt-3 font-[family-name:var(--font-heading)] text-3xl leading-tight">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-ink-soft)]">
          {description}
        </p>
      </section>
      {children}
    </div>
  );
}
