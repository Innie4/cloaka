"use client";

import Link from "next/link";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  const { t } = useWorkspace();

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="sidebar-surface rounded-[32px] p-8 text-white">
          <div className="text-xs uppercase tracking-[0.18em] text-white/60">
            {t("Welcome back")}
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl leading-tight">
            {t("Salary day should feel boring, not stressful.")}
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/76">
            {t("This scaffold keeps the sign-in experience warm and low-noise, with enough trust framing to reassure a business owner before they land in the dashboard.")}
          </p>
        </section>

        <section className="surface rounded-[32px] p-6 sm:p-8">
          <div className="max-w-md">
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
              {t("Sign in")}
            </div>
            <h2 className="mt-4 font-[family-name:var(--font-heading)] text-3xl">
              {t("Access the Cloaka workspace")}
            </h2>
            <LoginForm />
            <p className="mt-4 text-sm text-[var(--color-ink-soft)]">
              {t("New here?")}{" "}
              <Link href="/register" className="font-semibold text-[var(--color-blue)]">
                {t("Create a business account")}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
