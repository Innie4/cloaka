"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerRequest } from "@/lib/auth-client";

type RegisterState = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
};

const initialState: RegisterState = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  password: ""
};

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState(
    "This form will create a real business record once the API has a running Postgres database."
  );

  function updateField<K extends keyof RegisterState>(field: K, value: RegisterState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("Creating your business account...");

    try {
      const result = await registerRequest(form);
      setStatus("idle");
      setMessage(`Account created for ${result.business.name}. Redirecting to the dashboard...`);
      router.push("/");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to create the account right now.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Business name</span>
          <input
            value={form.businessName}
            onChange={(event) => updateField("businessName", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
            placeholder="Cloaka Demo Logistics"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Owner full name</span>
          <input
            value={form.ownerName}
            onChange={(event) => updateField("ownerName", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
            placeholder="Adaeze Okoro"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Work email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => updateField("email", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
            placeholder="owner@business.com"
            autoComplete="email"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">Phone number</span>
          <input
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
            placeholder="+2348012345678"
            autoComplete="tel"
            required
          />
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">Password</span>
        <input
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          required
        />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {status === "loading" ? "Creating account..." : "Create account"}
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
