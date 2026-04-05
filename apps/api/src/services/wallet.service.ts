import { LedgerEntryType, Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../lib/app-error";

function toNumber(value: Prisma.Decimal | number | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value.toString());
}

function toDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

async function calculateWalletBalances(
  client: Prisma.TransactionClient | typeof prisma,
  businessId: string
) {
  const entries = await client.walletLedgerEntry.findMany({
    where: {
      businessId
    },
    orderBy: {
      occurredAt: "asc"
    }
  });

  let totalBalance = 0;
  let heldBalance = 0;

  for (const entry of entries) {
    const amount = toNumber(entry.amount);

    if (entry.type === LedgerEntryType.CREDIT || entry.type === LedgerEntryType.REFUND) {
      totalBalance += amount;
    }

    if (entry.type === LedgerEntryType.DEBIT) {
      totalBalance -= amount;
    }

    if (entry.type === LedgerEntryType.HOLD) {
      heldBalance += amount;
    }

    if (entry.type === LedgerEntryType.RELEASE) {
      heldBalance -= amount;
    }
  }

  return {
    totalBalance,
    heldBalance: Math.max(heldBalance, 0),
    availableBalance: totalBalance - Math.max(heldBalance, 0)
  };
}

export async function listWalletLedger(businessId: string) {
  return prisma.walletLedgerEntry.findMany({
    where: {
      businessId
    },
    orderBy: {
      occurredAt: "desc"
    },
    take: 50
  });
}

export async function getWalletSummary(businessId: string) {
  const balances = await calculateWalletBalances(prisma, businessId);

  const business = await prisma.business.findUnique({
    where: {
      id: businessId
    },
    include: {
      settings: true
    }
  });

  return {
    totalBalance: balances.totalBalance,
    heldBalance: balances.heldBalance,
    availableBalance: balances.availableBalance,
    lowBalanceThreshold: business?.settings?.lowBalanceThreshold
      ? Number(business.settings.lowBalanceThreshold.toString())
      : 0,
    virtualAccountNumber: business?.slug
      ? `VA-${business.slug.slice(0, 4).toUpperCase()}-001`
      : null,
    virtualAccountBank: envVirtualBank(),
    accountName: business?.name ?? "Cloaka Business",
    needsAttention:
      balances.availableBalance <
      (business?.settings?.lowBalanceThreshold
        ? Number(business.settings.lowBalanceThreshold.toString())
        : 0)
  };
}

function envVirtualBank() {
  return "Providus Bank";
}

export async function fundWallet(input: {
  businessId: string;
  amount: number;
  narration: string;
}) {
  if (input.amount <= 0) {
    throw new AppError("Funding amount must be greater than zero.", 422, "INVALID_FUND_AMOUNT");
  }

  return prisma.walletLedgerEntry.create({
    data: {
      businessId: input.businessId,
      type: LedgerEntryType.CREDIT,
      amount: toDecimal(input.amount),
      reference: `fund-${Date.now()}`,
      narration: input.narration
    }
  });
}

export async function reserveWalletAmount(tx: Prisma.TransactionClient, input: {
  businessId: string;
  amount: number;
  reference: string;
  narration: string;
}) {
  const summary = await calculateWalletBalances(tx, input.businessId);

  if (summary.availableBalance < input.amount) {
    throw new AppError("Insufficient wallet balance for this payment.", 422, "INSUFFICIENT_FUNDS");
  }

  await tx.walletLedgerEntry.create({
    data: {
      businessId: input.businessId,
      type: LedgerEntryType.HOLD,
      amount: toDecimal(input.amount),
      reference: input.reference,
      narration: input.narration
    }
  });
}

export async function settleReservedWalletAmount(tx: Prisma.TransactionClient, input: {
  businessId: string;
  amount: number;
  reference: string;
  narration: string;
  success: boolean;
}) {
  if (input.success) {
    await tx.walletLedgerEntry.createMany({
      data: [
        {
          businessId: input.businessId,
          type: LedgerEntryType.DEBIT,
          amount: toDecimal(input.amount),
          reference: `${input.reference}-debit`,
          narration: input.narration
        },
        {
          businessId: input.businessId,
          type: LedgerEntryType.RELEASE,
          amount: toDecimal(input.amount),
          reference: `${input.reference}-release`,
          narration: input.narration
        }
      ]
    });
  } else {
    await tx.walletLedgerEntry.create({
      data: {
        businessId: input.businessId,
        type: LedgerEntryType.RELEASE,
        amount: toDecimal(input.amount),
        reference: `${input.reference}-release`,
        narration: input.narration
      }
    });
  }
}
