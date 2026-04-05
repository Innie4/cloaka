"use client";

import { useEffect, useState } from "react";
import { authedGet } from "@/lib/auth-client";
import { useWorkspace } from "@/components/providers/workspace-provider";

type MePayload = {
  user: {
    fullName: string;
  };
  business: {
    name: string;
    planTier: string;
    lowBalanceThreshold: string | null;
    countryCode: string;
    currencyCode: string;
    languageCode: string;
  };
};

type NotificationRecord = {
  id: string;
  title: string;
  body: string;
  level: "info" | "success" | "warning";
  createdAt: string;
};

export function Topbar() {
  const [me, setMe] = useState<MePayload | null>(null);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const { t, planLabel, business } = useWorkspace();

  useEffect(() => {
    async function load() {
      try {
        const [profile, items] = await Promise.all([
          authedGet<MePayload>("/api/auth/me"),
          authedGet<NotificationRecord[]>("/api/notifications")
        ]);
        setMe(profile);
        setNotifications(items);
      } catch {
        setMe(null);
        setNotifications([]);
      }
    }

    load().catch(() => undefined);
  }, []);

  return (
    <div className="surface flex flex-col gap-4 rounded-[28px] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
          {me?.business.name ?? business?.name ?? "Cloaka"}
        </div>
        <h1 className="mt-2 font-[family-name:var(--font-heading)] text-2xl sm:text-3xl">
          {t("Business payment operating system")}
        </h1>
      </div>
      <div className="flex flex-wrap gap-3 text-sm">
        <div className="rounded-full bg-[rgba(21,159,107,0.12)] px-4 py-2 font-medium text-[var(--color-green)]">
          {planLabel} plan
        </div>
        <div className="rounded-full bg-[rgba(217,119,6,0.12)] px-4 py-2 font-medium text-[var(--color-amber)]">
          {notifications.length} notifications
        </div>
        {me?.business.countryCode ? (
          <div className="rounded-full bg-[rgba(37,99,235,0.12)] px-4 py-2 font-medium text-[var(--color-blue)]">
            {me.business.countryCode} · {me.business.currencyCode} · {me.business.languageCode.toUpperCase()}
          </div>
        ) : null}
        {notifications[0] ? (
          <div className="rounded-full bg-[rgba(37,99,235,0.12)] px-4 py-2 font-medium text-[var(--color-blue)]">
            {notifications[0].title}
          </div>
        ) : null}
      </div>
    </div>
  );
}
