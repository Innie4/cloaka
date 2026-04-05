import { findNigerianBankByCode, nigerianBanks } from "@cloaka/shared";
import { env } from "../config/env";
import { AppError } from "../lib/app-error";

export type BankVerificationResult = {
  accountName: string;
  accountNumber: string;
  bankCode: string;
  bankName: string;
  provider: "paystack" | "mock";
};

type PaystackResolveResponse = {
  status?: boolean;
  message?: string;
  data?: {
    account_number?: string;
    account_name?: string;
  };
};

function sanitizeAccountNumber(accountNumber: string) {
  return accountNumber.replace(/\D/g, "");
}

function buildMockVerification(accountNumber: string, bankCode: string, bankName: string) {
  return {
    accountName: `Verified Account ${accountNumber.slice(-4)}`,
    accountNumber,
    bankCode,
    bankName,
    provider: "mock" as const
  };
}

export function listSupportedBanks() {
  return nigerianBanks;
}

export async function verifyRecipientBankAccount(input: {
  accountNumber: string;
  bankCode: string;
}) {
  const accountNumber = sanitizeAccountNumber(input.accountNumber);

  if (!/^\d{10}$/.test(accountNumber)) {
    throw new AppError(
      "Enter a valid 10-digit Nigerian account number.",
      422,
      "INVALID_ACCOUNT_NUMBER"
    );
  }

  const bank = findNigerianBankByCode(input.bankCode);

  if (!bank) {
    throw new AppError("Select a supported Nigerian bank.", 422, "UNSUPPORTED_BANK");
  }

  if (!env.PAYSTACK_SECRET_KEY || env.NODE_ENV === "test") {
    return buildMockVerification(accountNumber, bank.code, bank.name);
  }

  const url = new URL("https://api.paystack.co/bank/resolve");
  url.searchParams.set("account_number", accountNumber);
  url.searchParams.set("bank_code", bank.code);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`
      }
    });

    const payload = (await response.json()) as PaystackResolveResponse;

    if (!response.ok || !payload.status || !payload.data?.account_name) {
      if (env.NODE_ENV !== "production") {
        return buildMockVerification(accountNumber, bank.code, bank.name);
      }

      throw new AppError(
        payload.message ??
          "We could not verify that bank account. Please confirm the bank and account number.",
        422,
        "ACCOUNT_VERIFICATION_FAILED"
      );
    }

    return {
      accountName: payload.data.account_name,
      accountNumber,
      bankCode: bank.code,
      bankName: bank.name,
      provider: "paystack" as const
    };
  } catch (error) {
    if (env.NODE_ENV !== "production") {
      return buildMockVerification(accountNumber, bank.code, bank.name);
    }

    throw error;
  }
}
