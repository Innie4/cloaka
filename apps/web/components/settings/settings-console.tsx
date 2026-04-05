"use client";

import { useEffect, useState } from "react";
import { authedGet, authedPatch, authedPost } from "@/lib/auth-client";

type SettingsPayload = {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    twoFactorEnabled: boolean;
  };
  business: {
    id: string;
    name: string;
    planTier: string;
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
  const [profile, setProfile] = useState<SettingsPayload | null>(null);
  const [setup, setSetup] = useState<TwoFactorSetup | null>(null);
  const [threshold, setThreshold] = useState("50000");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
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
        smsNotifications
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

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="surface rounded-[28px] p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">Business</div>
        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
          Thresholds and notification defaults
        </h3>
        <div className="mt-5 space-y-4 text-sm">
          <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
            <div className="font-semibold text-[var(--color-ink)]">
              {profile?.business.name ?? "Business profile"}
            </div>
            <div className="mt-1 text-[var(--color-ink-soft)]">
              Tier: {profile?.business.planTier ?? "Unknown"} • Owner: {profile?.user.fullName ?? "Unknown"}
            </div>
          </div>
          <label className="block space-y-2">
            <span className="font-medium">Low balance threshold (NGN)</span>
            <input
              value={threshold}
              onChange={(event) => setThreshold(event.target.value)}
              className="w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 outline-none focus:border-[var(--color-blue)]"
              placeholder="50000"
            />
          </label>
          <label className="flex items-center justify-between rounded-[24px] border border-[var(--color-line)] bg-white px-4 py-4">
            <span>Email notifications</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(event) => setEmailNotifications(event.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between rounded-[24px] border border-[var(--color-line)] bg-white px-4 py-4">
            <span>SMS notifications</span>
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
            Save business settings
          </button>
        </div>
      </section>

      <section className="surface rounded-[28px] p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">Security</div>
        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
          Two-factor authentication
        </h3>
        <div className="mt-5 space-y-4">
          <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4 text-sm leading-7 text-[var(--color-ink-soft)]">
            {error ? <span className="text-[var(--color-rose)]">{error}</span> : status}
          </div>
          <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4 text-sm">
            <div className="font-semibold text-[var(--color-ink)]">
              Status: {profile?.user.twoFactorEnabled ? "Enabled" : "Disabled"}
            </div>
            <div className="mt-1 text-[var(--color-ink-soft)]">
              Protect owner and admin access with a 6-digit authenticator code.
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
                Generate QR setup
              </button>
              {setup ? (
                <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
                  <img
                    src={setup.qrCodeDataUrl}
                    alt="2FA QR code"
                    className="h-52 w-52 rounded-2xl border border-[var(--color-line)]"
                  />
                  <div className="mt-3 text-sm text-[var(--color-ink-soft)]">
                    Secret: <span className="font-mono text-[var(--color-ink)]">{setup.secret}</span>
                  </div>
                  <input
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter 6-digit code"
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
                    Enable 2FA
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter current 6-digit code"
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
                Disable 2FA
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
