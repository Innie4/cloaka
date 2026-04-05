"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supportedCountries, supportedLanguages, type SupportedLanguageCode, type SupportedPlanTier } from "@cloaka/shared";
import { registerRequest } from "@/lib/auth-client";

type RegisterState = {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  planTier: SupportedPlanTier;
  countryCode: string;
  languageCode: SupportedLanguageCode;
};

const initialState: RegisterState = {
  businessName: "",
  ownerName: "",
  email: "",
  phone: "",
  password: "",
  planTier: "STARTER",
  countryCode: "NG",
  languageCode: "en"
};

const copy = {
  en: {
    loading: "Creating your business account...",
    success: "Account created for {{name}}. Redirecting to the dashboard...",
    fallback: "Unable to create the account right now.",
    intro: "Create an individual business dashboard with the right country, currency, language, and plan from day one.",
    businessName: "Business name",
    ownerName: "Owner full name",
    email: "Work email",
    phone: "Phone number",
    country: "Country",
    language: "Preferred language",
    plan: "Plan",
    password: "Password",
    passwordHint: "At least 8 characters",
    submit: "Create account",
    submitting: "Creating account..."
  },
  fr: {
    loading: "Creation de votre compte entreprise...",
    success: "Compte cree pour {{name}}. Redirection vers le tableau de bord...",
    fallback: "Impossible de creer le compte pour le moment.",
    intro: "Creez un tableau de bord entreprise individuel avec le bon pays, la bonne devise, la bonne langue et le bon plan des le premier jour.",
    businessName: "Nom de l'entreprise",
    ownerName: "Nom complet du proprietaire",
    email: "E-mail professionnel",
    phone: "Numero de telephone",
    country: "Pays",
    language: "Langue preferee",
    plan: "Plan",
    password: "Mot de passe",
    passwordHint: "Au moins 8 caracteres",
    submit: "Creer le compte",
    submitting: "Creation du compte..."
  }
} as const;

function interpolate(template: string, values?: Record<string, string>) {
  if (!values) {
    return template;
  }

  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, value),
    template
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const dictionary = copy[form.languageCode];
  const [message, setMessage] = useState<string>(dictionary.intro);

  function updateField<K extends keyof RegisterState>(field: K, value: RegisterState[K]) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage(copy[form.languageCode].loading);

    try {
      const result = await registerRequest(form);
      setStatus("idle");
      setMessage(interpolate(copy[form.languageCode].success, { name: result.business.name }));
      router.push("/");
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : copy[form.languageCode].fallback);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <p className="text-sm leading-6 text-[var(--color-ink-soft)]">{dictionary.intro}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">{dictionary.businessName}</span>
          <input
            value={form.businessName}
            onChange={(event) => updateField("businessName", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
            placeholder="Cloaka Demo Logistics"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">{dictionary.ownerName}</span>
          <input
            value={form.ownerName}
            onChange={(event) => updateField("ownerName", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
            placeholder="Adaeze Okoro"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">{dictionary.email}</span>
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
          <span className="text-sm font-medium text-[var(--color-ink)]">{dictionary.phone}</span>
          <input
            value={form.phone}
            onChange={(event) => updateField("phone", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
            placeholder="+2348012345678"
            autoComplete="tel"
            required
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">{dictionary.country}</span>
          <select
            value={form.countryCode}
            onChange={(event) => updateField("countryCode", event.target.value)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
          >
            {supportedCountries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.currencyCode})
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">{dictionary.language}</span>
          <select
            value={form.languageCode}
            onChange={(event) => {
              const languageCode = event.target.value as SupportedLanguageCode;
              updateField("languageCode", languageCode);
              setMessage(copy[languageCode].intro);
            }}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
          >
            {supportedLanguages.map((language) => (
              <option key={language.code} value={language.code}>
                {language.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-2 sm:col-span-2">
          <span className="text-sm font-medium text-[var(--color-ink)]">{dictionary.plan}</span>
          <select
            value={form.planTier}
            onChange={(event) => updateField("planTier", event.target.value as SupportedPlanTier)}
            className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
          >
            <option value="STARTER">Starter</option>
            <option value="GROWTH">Growth</option>
            <option value="SCALE">Scale</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-ink)]">{dictionary.password}</span>
        <input
          type="password"
          value={form.password}
          onChange={(event) => updateField("password", event.target.value)}
          className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--color-blue)]"
          placeholder={dictionary.passwordHint}
          autoComplete="new-password"
          required
        />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {status === "loading" ? dictionary.submitting : dictionary.submit}
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
