"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginRequest } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(
    "Use a real account once Postgres is running, or keep exploring the shell."
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("Signing you in...");

    try {
      const result = await loginRequest({ email, password });
      setStatus("idle");
      setMessage(`Welcome back, ${result.user.fullName}. Redirecting to the dashboard...`);
      router.push("/");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to sign in right now.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">Work email</span>
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
        <span className="text-sm font-medium text-[var(--color-ink)]">Password</span>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {status === "loading" ? "Signing in..." : "Enter dashboard"}
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
