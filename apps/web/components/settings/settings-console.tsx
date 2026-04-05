"use client";

import { supportedCountries, supportedLanguages } from "@cloaka/shared";
import { useEffect, useState } from "react";
import { useWorkspace } from "@/components/providers/workspace-provider";
import { authedGet, authedPatch, authedPost, syncStoredSession, type AuthBusiness } from "@/lib/auth-client";

type SettingsPayload = {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    twoFactorEnabled: boolean;
  };
  business: AuthBusiness & {
    lowBalanceThreshold: string | null;
    emailNotifications: boolean;
    smsNotifications: boolean;
  };
};

type TwoFactorSetup = {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
  issuer: string;
  account: string;
};

export function SettingsConsole() {
  const { business: workspaceBusiness, formatMoney, t, languageCode } = useWorkspace();
  const [profile, setProfile] = useState<SettingsPayload | null>(null);
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [threshold, setThreshold] = useState("50000");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [countryCode, setCountryCode] = useState("NG");
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "fr">("en");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("Load a live session to manage security and notifications.");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadSettings() {
    try {
      const result = await authedGet<SettingsPayload>("/api/auth/me");
      setProfile(result);
      setThreshold(result.business.lowBalanceThreshold ?? "50000");
      setEmailNotifications(result.business.emailNotifications);
      setSmsNotifications(result.business.smsNotifications);
      setCountryCode(result.business.countryCode);
      setPreferredLanguage(result.business.languageCode);
      syncStoredSession({
        user: result.user,
        business: result.business
      });
      setStatus("Live business settings loaded.");
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to load settings.");
    }
  }

  useEffect(() => {
    loadSettings().catch(() => undefined);
  }, []);

  async function saveSettings() {
    setBusy(true);
    try {
      await authedPatch("/api/businesses/me/settings", {
        lowBalanceThreshold: threshold,
        emailNotifications,
        smsNotifications,
        countryCode,
        languageCode: preferredLanguage
      });
      await loadSettings();
      setStatus("Business settings updated.");
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }

  async function generateTwoFactor() {
    setBusy(true);
    try {
      const result = await authedPost<TwoFactorSetup>("/api/auth/2fa/setup", {});
      setSetup(result);
      setStatus("Scan the QR code with your authenticator app, then enter the 6-digit code to enable 2FA.");
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to start 2FA setup.");
    } finally {
      setBusy(false);
    }
  }

  async function enableTwoFactor() {
    if (!setup) {
      return;
    }

    setBusy(true);
    try {
      await authedPost("/api/auth/2fa/enable", {
        secret: setup.secret,
        otp
      });
      setSetup(null);
      setOtp("");
      await loadSettings();
      setStatus("Two-factor authentication enabled.");
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not enable 2FA.");
    } finally {
      setBusy(false);
    }
  }

  async function disableTwoFactor() {
    setBusy(true);
    try {
      await authedPost("/api/auth/2fa/disable", {
        otp
      });
      setOtp("");
      setSetup(null);
      await loadSettings();
      setStatus("Two-factor authentication disabled.");
      setError(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not disable 2FA.");
    } finally {
      setBusy(false);
    }
  }

  const activeCurrency = profile?.business.currencyCode ?? workspaceBusiness?.currencyCode ?? "NGN";
  const thresholdPreview = threshold ? formatMoney(threshold) : formatMoney(0);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="surface rounded-[28px] p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
          {t("Business")}
        </div>
        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
          {t("Thresholds, locale, and notification defaults")}
        </h3>
        <div className="mt-5 space-y-4 text-sm">
          <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
            <div className="font-semibold text-[var(--color-ink)]">
              {profile?.business.name ?? t("Business profile")}
            </div>
            <div className="mt-1 text-[var(--color-ink-soft)]">
              {t("Tier")}: {profile?.business.planTier ?? "Unknown"} | {t("Owner")}:{" "}
              {profile?.user.fullName ?? "Unknown"}
            </div>
            <div className="mt-1 text-[var(--color-ink-soft)]">
              {t("Country")}: {supportedCountries.find((country) => country.code === countryCode)?.name ?? countryCode} |{" "}
              {t("Currency")}: {activeCurrency} | {t("Preferred language")}:{" "}
              {supportedLanguages.find((language) => language.code === preferredLanguage)?.label ?? preferredLanguage}
            </div>
          </div>
          <label className="block space-y-2">
            <span className="font-medium">
              {t("Low balance threshold")} ({activeCurrency})
            </span>
            <input
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-blue)]"
              placeholder="50000"
            />
            <div className="text-xs text-[var(--color-ink-soft)]">
              {t("Alert preview")}: {thresholdPreview}
            </div>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="font-medium">{t("Country")}</span>
              <select
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value)}
                className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-blue)]"
              >
                {supportedCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.currencyCode})
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="font-medium">{t("Preferred language")}</span>
              <select
                value={preferredLanguage}
                onChange={(event) => setPreferredLanguage(event.target.value as "en" | "fr")}
                className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-blue)]"
              >
                {supportedLanguages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex items-center justify-between rounded-[24px] border border-[var(--color-line)] bg-white px-4 py-4">
            <span>{t("Email notifications")}</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) => setEmailNotifications(event.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between rounded-[24px] border border-[var(--color-line)] bg-white px-4 py-4">
            <span>{t("SMS notifications")}</span>
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={(event) => setSmsNotifications(event.target.checked)}
            />
          </label>
          <button
            type="button"
            onClick={saveSettings}
            disabled={busy}
            className="rounded-full bg-[var(--color-sidebar)] px-5 py-3 font-semibold text-white disabled:opacity-45"
          >
            {t("Save business settings")}
          </button>
        </div>
      </section>

      <section className="surface rounded-[28px] p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
          {t("Security")}
        </div>
        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
          {t("Two-factor authentication")}
        </h3>
        <div className="mt-5 space-y-4">
          <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4 text-sm leading-7 text-[var(--color-ink-soft)]">
            {error ? <span className="text-[var(--color-rose)]">{error}</span> : status}
          </div>
          <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4 text-sm">
            <div className="font-semibold text-[var(--color-ink)]">
              {t("Status")}: {profile?.user.twoFactorEnabled ? t("Enabled") : t("Disabled")}
            </div>
            <div className="mt-1 text-[var(--color-ink-soft)]">
              {t("Protect owner and admin access with a 6-digit authenticator code.")}
            </div>
          </div>
          {!profile?.user.twoFactorEnabled ? (
            <>
              <button
                type="button"
                onClick={generateTwoFactor}
                disabled={busy}
                className="rounded-full border border-[var(--color-line)] px-5 py-3 font-semibold disabled:opacity-45"
              >
                {t("Generate QR setup")}
              </button>
              {setup ? (
                <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
                  <img
                    src={setup.qrCodeDataUrl}
                    alt="2FA QR code"
                    className="h-52 w-52 rounded-2xl border border-[var(--color-line)]"
                  />
                  <div className="mt-3 text-sm text-[var(--color-ink-soft)]">
                    {t("Secret")}: <span className="font-mono text-[var(--color-ink)]">{setup.secret}</span>
                  </div>
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder={t("Enter 6-digit code")}
                    inputMode="numeric"
                    maxLength={6}
                    className="mt-4 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]"
                  />
                  <button
                    type="button"
                    onClick={enableTwoFactor}
                    disabled={busy}
                    className="mt-4 rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-45"
                  >
                    {t("Enable 2FA")}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder={t("Enter current 6-digit code")}
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]"
              />
              <button
                type="button"
                onClick={disableTwoFactor}
                disabled={busy}
                className="mt-4 rounded-full border border-[var(--color-line)] px-5 py-3 text-sm font-semibold disabled:opacity-45"
              >
                {t("Disable 2FA")}
              </button>
            </div>
          )}
          {languageCode !== preferredLanguage ? (
            <div className="rounded-[24px] border border-dashed border-[var(--color-line)] bg-[var(--color-cream)] p-4 text-sm text-[var(--color-ink-soft)]">
              {t("Save settings to apply the new language and currency formatting across the workspace.")}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
