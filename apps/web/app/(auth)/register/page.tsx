"use client";

import Link from "next/link";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  const { t } = useWorkspace();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="surface rounded-[32px] p-6 sm:p-8">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
            {t("3-step registration")}
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl leading-tight">
            {t("Create a business account in minutes, then finish KYB only when it matters.")}
          </h1>
          <RegisterForm />
        </section>

        <section className="metric-cream rounded-[32px] border border-[var(--color-line)] p-8">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-amber)]">
            {t("Why this flow")}
          </div>
          <h2 className="mt-4 font-[family-name:var(--font-heading)] text-3xl leading-tight">
            {t("Warm like Gusto, serious like payroll.")}
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-ink-soft)]">
            {t("The onboarding shell is intentionally short, progress-oriented, and gentle with trust cues about partner banks, notifications, and first disbursement readiness.")}
          </p>
          <p className="mt-6 text-sm text-[var(--color-ink-soft)]">
            {t("Already registered?")}{" "}
            <Link href="/login" className="font-semibold text-[var(--color-blue)]">
              {t("Sign in instead")}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
