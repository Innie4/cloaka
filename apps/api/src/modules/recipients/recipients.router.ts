import { PlanTier } from "@prisma/client";
import { findNigerianBankByCode } from "@cloaka/shared";
import { Router } from "express";
import { prisma } from "../../config/database";
import { ok } from "../../lib/api-response";
import { AppError } from "../../lib/app-error";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { listSupportedBanks, verifyRecipientBankAccount } from "../../services/bank.service";
import {
  bulkDeactivateRecipientsSchema,
  createRecipientSchema,
  verifyRecipientAccountSchema
} from "./recipients.schemas";

export const recipientsRouter = Router();

type RecipientSummaryRecord = {
  id: string;
  type: string;
  fullName: string;
  bankName: string;
  bankCode: string | null;
  accountNumber: string;
  accountName: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  notes: string | null;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  payments: { createdAt: Date }[];
  _count: {
    payments: number;
  };
};

function maskAccountNumber(accountNumber: string) {
  return `******${accountNumber.slice(-4)}`;
}

function serializeRecipientSummary(recipient: RecipientSummaryRecord) {
  return {
    id: recipient.id,
    type: recipient.type,
    fullName: recipient.fullName,
    bankName: recipient.bankName,
    bankCode: recipient.bankCode,
    maskedAccountNumber: maskAccountNumber(recipient.accountNumber),
    accountName: recipient.accountName,
    email: recipient.email,
    phone: recipient.phone,
    department: recipient.department,
    notes: recipient.notes,
    tags: recipient.tags,
    isActive: recipient.isActive,
    createdAt: recipient.createdAt.toISOString(),
    paymentCount: recipient._count.payments,
    lastPaymentAt: recipient.payments[0]?.createdAt.toISOString() ?? null
  };
}

async function assertRecipientCapacity(businessId: string) {
  const business = await prisma.business.findUnique({
    where: {
      id: businessId
    },
    select: {
      planTier: true
    }
  });

  if (!business) {
    throw new AppError("Business account not found.", 404, "BUSINESS_NOT_FOUND");
  }

  if (business.planTier !== PlanTier.STARTER) {
    return;
  }

  const recipientCount = await prisma.recipient.count({
    where: {
      businessId
    }
  });

  if (recipientCount >= 5) {
    throw new AppError(
      "Starter plans can store up to 5 recipients. Upgrade your plan to add more.",
      403,
      "RECIPIENT_LIMIT_REACHED"
    );
  }
}

recipientsRouter.get("/banks", (_req, res) => {
  res.json(ok(listSupportedBanks()));
});

recipientsRouter.post(
  "/verify-account",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = verifyRecipientAccountSchema.parse(req.body);
    const verification = await verifyRecipientBankAccount(input);

    res.json(ok(verification));
  })
);

recipientsRouter.get(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const recipients = await prisma.recipient.findMany({
      where: {
        businessId: req.auth!.businessId
      },
      include: {
        payments: {
          take: 1,
          orderBy: {
            createdAt: "desc"
          },
          select: {
            createdAt: true
          }
        },
        _count: {
          select: {
            payments: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(ok(recipients.map(serializeRecipientSummary)));
  })
);

recipientsRouter.post(
  "/live/bulk-deactivate",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = bulkDeactivateRecipientsSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      const recipients = await tx.recipient.findMany({
        where: {
          businessId: req.auth!.businessId,
          id: {
            in: input.ids
          }
        },
        select: {
          id: true,
          fullName: true
        }
      });

      if (recipients.length === 0) {
        throw new AppError("No matching recipients were found.", 404, "RECIPIENTS_NOT_FOUND");
      }

      await tx.recipient.updateMany({
        where: {
          businessId: req.auth!.businessId,
          id: {
            in: recipients.map((recipient) => recipient.id)
          }
        },
        data: {
          isActive: false
        }
      });

      await tx.auditLog.create({
        data: {
          businessId: req.auth!.businessId,
          actorUserId: req.auth!.userId,
          action: "recipient.bulk_deactivated",
          entityType: "Recipient",
          metadata: {
            ids: recipients.map((recipient) => recipient.id),
            names: recipients.map((recipient) => recipient.fullName)
          }
        }
      });

      return recipients.length;
    });

    res.json(
      ok({
        deactivatedCount: result
      })
    );
  })
);

recipientsRouter.get(
  "/live/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const recipientId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const recipient = await prisma.recipient.findFirst({
      where: {
        id: recipientId,
        businessId: req.auth!.businessId
      },
      include: {
        payments: {
          take: 10,
          orderBy: {
            createdAt: "desc"
          },
          select: {
            id: true,
            reference: true,
            amount: true,
            status: true,
            type: true,
            createdAt: true,
            processedAt: true,
            failureReason: true
          }
        },
        _count: {
          select: {
            payments: true
          }
        }
      }
    });

    if (!recipient) {
      throw new AppError("Recipient not found.", 404, "RECIPIENT_NOT_FOUND");
    }

    const summaryRecord: RecipientSummaryRecord = {
      id: recipient.id,
      type: recipient.type,
      fullName: recipient.fullName,
      bankName: recipient.bankName,
      bankCode: recipient.bankCode,
      accountNumber: recipient.accountNumber,
      accountName: recipient.accountName,
      email: recipient.email,
      phone: recipient.phone,
      department: recipient.department,
      notes: recipient.notes,
      tags: recipient.tags,
      isActive: recipient.isActive,
      createdAt: recipient.createdAt,
      payments: recipient.payments.map((payment) => ({
        createdAt: payment.createdAt
      })),
      _count: recipient._count
    };

    res.json(
      ok({
        ...serializeRecipientSummary(summaryRecord),
        paymentHistory: recipient.payments.map((payment) => ({
          id: payment.id,
          reference: payment.reference,
          amount: payment.amount.toString(),
          status: payment.status,
          type: payment.type,
          createdAt: payment.createdAt.toISOString(),
          processedAt: payment.processedAt?.toISOString() ?? null,
          failureReason: payment.failureReason
        }))
      })
    );
  })
);

recipientsRouter.post(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createRecipientSchema.parse(req.body);

    await assertRecipientCapacity(req.auth!.businessId);

    const bank = findNigerianBankByCode(input.bankCode);

    if (!bank) {
      throw new AppError("Select a supported Nigerian bank.", 422, "UNSUPPORTED_BANK");
    }

    const verification = await verifyRecipientBankAccount({
      bankCode: input.bankCode,
      accountNumber: input.accountNumber
    });

    const recipient = await prisma.$transaction(async (tx) => {
      const createdRecipient = await tx.recipient.create({
        data: {
          businessId: req.auth!.businessId,
          type: input.type,
          fullName: input.fullName.trim(),
          bankName: bank.name,
          bankCode: bank.code,
          accountNumber: verification.accountNumber,
          accountName: verification.accountName,
          email: input.email,
          phone: input.phone,
          department: input.department,
          notes: input.notes,
          tags: input.tags
        }
      });

      await tx.auditLog.create({
        data: {
          businessId: req.auth!.businessId,
          actorUserId: req.auth!.userId,
          action: "recipient.created",
          entityType: "Recipient",
          entityId: createdRecipient.id,
          metadata: {
            fullName: createdRecipient.fullName,
            type: createdRecipient.type,
            bankCode: createdRecipient.bankCode
          }
        }
      });

      return createdRecipient;
    });

    res.status(201).json(
      ok(
        serializeRecipientSummary({
          ...recipient,
          payments: [],
          _count: {
            payments: 0
          }
        }),
        {
          verificationProvider: verification.provider
        }
      )
    );
  })
);
