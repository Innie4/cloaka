import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-8">
      <section className="surface max-w-2xl rounded-[32px] p-8 text-center">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
          Verification pending
        </div>
        <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl leading-tight">
          Check your inbox and confirm your business email.
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
          Cloaka should gate access behind email verification, then continue into the saved
          onboarding wizard without losing progress.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
