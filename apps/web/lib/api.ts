import type {
  DashboardOverview,
  HighlightCard,
  MarketingPageData,
  PaymentRow,
  TrustHighlight
} from "@cloaka/shared";
import {
  getDashboardOverview,
  getMarketingPageData,
  getPayments,
  getRecipients,
  getReports,
  getTrustHighlights
} from "@cloaka/shared";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function fetchFromApi<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      return fallback;
    }

    const payload = (await response.json()) as ApiEnvelope<T>;
    return payload.data;
  } catch {
    return fallback;
  }
}

export async function getOverviewData() {
  return fetchFromApi<DashboardOverview>("/api/overview", getDashboardOverview());
}

export async function getLandingData() {
  return fetchFromApi<MarketingPageData>("/api/landing", getMarketingPageData());
}

export async function getPaymentData() {
  return fetchFromApi<PaymentRow[]>("/api/payments", getPayments());
}

export async function getRecipientCards() {
  return fetchFromApi<HighlightCard[]>("/api/recipients", getRecipients());
}

export async function getReportCards() {
  return fetchFromApi<HighlightCard[]>("/api/reports", getReports());
}

export async function getTrustData() {
  return fetchFromApi<TrustHighlight[]>("/api/trust", getTrustHighlights());
}
