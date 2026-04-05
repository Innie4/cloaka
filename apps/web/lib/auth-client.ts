"use client";

import type { SupportedLanguageCode, SupportedPlanTier, WorkspaceFeature } from "@cloaka/shared";

export type AuthBusiness = {
  id: string;
  name: string;
  slug: string;
  planTier: SupportedPlanTier;
  kybStatus: string;
  countryCode: string;
  currencyCode: string;
  languageCode: SupportedLanguageCode;
  locale: string;
  limits: {
    maxRecipients: number;
    maxTeamMembers: number;
  };
  features: WorkspaceFeature[];
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  twoFactorEnabled?: boolean;
};

type AuthSuccess = {
  business: AuthBusiness;
  user: AuthUser;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: {
    code?: string;
    message?: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

export class ApiRequestError extends Error {
  code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
  }
}

function saveSession(result: AuthSuccess) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("cloaka.accessToken", result.tokens.accessToken);
  window.localStorage.setItem("cloaka.refreshToken", result.tokens.refreshToken);
  window.localStorage.setItem("cloaka.user", JSON.stringify(result.user));
  window.localStorage.setItem("cloaka.business", JSON.stringify(result.business));
  window.dispatchEvent(new Event("cloaka-session-updated"));
}

export function syncStoredSession(input: { user?: AuthUser | null; business?: AuthBusiness | null }) {
  if (typeof window === "undefined") {
    return;
  }

  if (input.user) {
    window.localStorage.setItem("cloaka.user", JSON.stringify(input.user));
  }

  if (input.business) {
    window.localStorage.setItem("cloaka.business", JSON.stringify(input.business));
  }

  window.dispatchEvent(new Event("cloaka-session-updated"));
}

function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("cloaka.accessToken");
}

async function requestJson<T>(path: string, options?: RequestOptions): Promise<T> {
  const accessToken = getStoredAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`
          }
        : {})
    },
    body: options?.body ? JSON.stringify(options.body) : undefined
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    throw new ApiRequestError(
      payload?.error?.message ??
        "The request could not be completed. Make sure the API and database are running.",
      payload?.error?.code
    );
  }

  return payload.data;
}

export async function loginRequest(input: { email: string; password: string; otp?: string }) {
  const result = await requestJson<AuthSuccess>("/api/auth/login", {
    method: "POST",
    body: input
  });
  saveSession(result);
  return result;
}

export async function registerRequest(input: {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  planTier: SupportedPlanTier;
  countryCode: string;
  languageCode: SupportedLanguageCode;
}) {
  const result = await requestJson<AuthSuccess>("/api/auth/register", {
    method: "POST",
    body: input
  });
  saveSession(result);
  return result;
}

export async function authedGet<T>(path: string) {
  return requestJson<T>(path);
}

export async function authedPost<T>(path: string, body: unknown) {
  return requestJson<T>(path, {
    method: "POST",
    body
  });
}

export async function authedPatch<T>(path: string, body: unknown) {
  return requestJson<T>(path, {
    method: "PATCH",
    body
  });
}

export function getStoredSession() {
  if (typeof window === "undefined") {
    return {
      user: null,
      business: null
    };
  }

  const user = window.localStorage.getItem("cloaka.user");
  const business = window.localStorage.getItem("cloaka.business");

  return {
    user: user ? (JSON.parse(user) as AuthSuccess["user"]) : null,
    business: business ? (JSON.parse(business) as AuthSuccess["business"]) : null
  };
}
