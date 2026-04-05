"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { ApiRequestError, loginRequest } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const { t } = useWorkspace();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(
    t("Sign in with your business email and password. If 2FA is enabled, Cloaka will ask for your 6-digit code.")
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(
      requiresTwoFactor ? t("Verifying your 2FA code...") : t("Signing you in...")
    );

    try {
      const result = await loginRequest({
        email,
        password,
        otp: requiresTwoFactor ? otp : undefined
      });
      setStatus("idle");
      setMessage(t("Welcome back, {{name}}. Redirecting to the dashboard...", { name: result.user.fullName }));
      router.push("/");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiRequestError && error.code === "TWO_FACTOR_REQUIRED") {
        setRequiresTwoFactor(true);
        setStatus("idle");
        setMessage(t("Enter your 6-digit authenticator code to finish signing in."));
        return;
      }

      setStatus("error");
      setMessage(error instanceof Error ? error.message : t("Unable to sign in right now."));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">{t("Work email")}</span>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
          placeholder="you@business.com"
          autoComplete="email"
          required
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">{t("Password")}</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
          placeholder={t("Enter your password")}
          autoComplete="current-password"
          required
        />
      </label>
      {requiresTwoFactor ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">{t("Two-factor code")}</span>
          <input
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            inputMode="numeric"
            maxLength={6}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
            placeholder="123456"
            required
          />
        </label>
      ) : null}
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {status === "loading"
          ? requiresTwoFactor
            ? t("Verifying code...")
            : t("Signing in...")
          : requiresTwoFactor
            ? t("Finish sign-in")
            : t("Enter dashboard")}
      </button>
      <p
        className={`text-sm leading-6 ${
          status === "error" ? "text-[var(--color-rose)]" : "text-[var(--color-ink-soft)]"
        }`}
      >
        {message}
      </p>
    </form>
  );
}
