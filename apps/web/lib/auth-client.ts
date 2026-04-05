"use client";

type AuthSuccess = {
  business: {
    id: string;
    name: string;
    slug: string;
    planTier: string;
    kybStatus: string;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: {
    message?: string;
  };
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
};

function saveSession(result: AuthSuccess) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("cloaka.accessToken", result.tokens.accessToken);
  window.localStorage.setItem("cloaka.refreshToken", result.tokens.refreshToken);
  window.localStorage.setItem("cloaka.user", JSON.stringify(result.user));
  window.localStorage.setItem("cloaka.business", JSON.stringify(result.business));
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
    throw new Error(
      payload?.error?.message ??
        "The request could not be completed. Make sure the API and database are running."
    );
  }

  return payload.data;
}

export async function loginRequest(input: { email: string; password: string }) {
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
