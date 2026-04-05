import { findNigerianBankByCode } from "@cloaka/shared";
import { Router } from "express";
import { prisma } from "../../config/database";
import { ok } from "../../lib/api-response";
import { AppError } from "../../lib/app-error";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { listSupportedBanks, verifyRecipientBankAccount } from "../../services/bank.service";
import { assertPlanFeature, getBusinessPlanContext } from "../../services/plan-access.service";
import {
  bulkDeactivateRecipientsSchema,
  createRecipientSchema,
  importRecipientsSchema,
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

function splitCsv(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (const character of line) {
    if (character === '"') {
      quoted = !quoted;
      continue;
    }

    if (character === "," && !quoted) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
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
  const { policy } = await getBusinessPlanContext(businessId);

  const recipientCount = await prisma.recipient.count({
    where: {
      businessId
    }
  });

  if (recipientCount >= policy.maxRecipients) {
    throw new AppError(
      `Your current plan supports up to ${policy.maxRecipients} recipients. Upgrade to add more.`,
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
  "/import",
  requireAuth,
  asyncHandler(async (req, res) => {
    await assertPlanFeature(req.auth!.businessId, "csv_import");
    const input = importRecipientsSchema.parse(req.body);
    const lines = input.csvContent.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (lines.length <= 1) {
      throw new AppError("The CSV file is empty.", 422, "EMPTY_CSV");
    }

    const headers = splitCsv(lines[0]);
    const preview = lines.slice(1).map((line, index) => {
      const record = Object.fromEntries(
        headers.map((header, cellIndex) => [header, splitCsv(line)[cellIndex] ?? ""])
      );

      const parsed = createRecipientSchema.safeParse({
        fullName: record.fullName,
        type: record.type,
        bankCode: record.bankCode,
        accountNumber: record.accountNumber,
        email: record.email || undefined,
        phone: record.phone || undefined,
        department: record.department || undefined,
        notes: record.notes || undefined,
        tags: (record.tags ?? "")
          .split(/[|,]/)
          .map((tag: string) => tag.trim())
          .filter(Boolean)
      });

      return {
        rowNumber: index + 2,
        valid: parsed.success,
        input: record,
        errors: parsed.success ? [] : parsed.error.issues.map((issue) => issue.message),
        parsed: parsed.success ? parsed.data : null
      };
    });

    if (!input.commit) {
      res.json(
        ok({
          totalRows: preview.length,
          validRows: preview.filter((row) => row.valid).length,
          invalidRows: preview.filter((row) => !row.valid).length,
          rows: preview
        })
      );
      return;
    }

    const validRows = preview.filter(
      (row): row is typeof row & { parsed: NonNullable<typeof row.parsed> } => row.valid && row.parsed !== null
    );

    const created: string[] = [];
    const failures: Array<{ rowNumber: number; message: string }> = [];

    for (const row of validRows) {
      try {
        await assertRecipientCapacity(req.auth!.businessId);
        const bank = findNigerianBankByCode(row.parsed.bankCode);

        if (!bank) {
          throw new AppError("Select a supported Nigerian bank.", 422, "UNSUPPORTED_BANK");
        }

        const verification = await verifyRecipientBankAccount({
          bankCode: row.parsed.bankCode,
          accountNumber: row.parsed.accountNumber
        });

        const recipient = await prisma.recipient.create({
          data: {
            businessId: req.auth!.businessId,
            type: row.parsed.type,
            fullName: row.parsed.fullName,
            bankName: bank.name,
            bankCode: bank.code,
            accountNumber: verification.accountNumber,
            accountName: verification.accountName,
            email: row.parsed.email,
            phone: row.parsed.phone,
            department: row.parsed.department,
            notes: row.parsed.notes,
            tags: row.parsed.tags
          }
        });

        created.push(recipient.id);
      } catch (error) {
        failures.push({
          rowNumber: row.rowNumber,
          message: error instanceof Error ? error.message : "Import failed."
        });
      }
    }

    res.json(
      ok({
        totalRows: preview.length,
        importedCount: created.length,
        failedCount: failures.length,
        failures
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
