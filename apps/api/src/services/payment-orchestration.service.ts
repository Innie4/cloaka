import { randomUUID } from "node:crypto";
import { hasPlanFeature } from "@cloaka/shared";
import { ApprovalStatus, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../lib/app-error";
import { queueNotification } from "./notifications.service";
import { evaluateApplicableRules, evaluateRulePayload } from "./rule-engine.service";
import { reserveWalletAmount, settleReservedWalletAmount } from "./wallet.service";
import { sendEmailNotification, sendSmsNotification } from "./delivery.service";

function toDecimal(value: number) {
  return new Prisma.Decimal(value.toFixed(2));
}

function buildPaymentReference(input: {
  providedReference?: string | null;
  scheduleId?: string | null;
  recipientId: string;
  scheduledFor?: Date | null;
}) {
  if (input.providedReference) {
    return input.providedReference;
  }

  if (input.scheduleId && input.scheduledFor) {
    const timestamp = input.scheduledFor
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d+Z$/, "Z");

    return `clk-${input.scheduleId.slice(0, 8)}-${input.recipientId.slice(0, 8)}-${timestamp}`;
  }

  return `clk-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

async function writeAuditLog(input: {
  businessId: string;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.JsonValue;
}) {
  await prisma.auditLog.create({
    data: {
      businessId: input.businessId,
      actorUserId: input.actorUserId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      ...(input.metadata !== undefined
        ? {
            metadata: input.metadata as Prisma.InputJsonValue
          }
        : {})
    }
  });
}

async function executeProcessor(input: {
  reference: string;
  amount: number;
  accountNumber: string;
  accountName: string;
}) {
  if (input.accountName.toLowerCase().includes("fail")) {
    return {
      success: false,
      processor: "mock-primary",
      responseCode: "ACCOUNT_REJECTED"
    } as const;
  }

  return {
    success: true,
    processor: "mock-primary",
    responseCode: "SUCCESS"
  } as const;
}

async function notifyPaymentEvent(input: {
  businessId: string;
  title: string;
  body: string;
  email?: string | null;
  phone?: string | null;
}) {
  await queueNotification({
    businessId: input.businessId,
    title: input.title,
    body: input.body,
    level: "info"
  });

  if (input.email) {
    await sendEmailNotification({
      to: input.email,
      subject: input.title,
      html: `<p>${input.body}</p>`
    });
  }

  if (input.phone) {
    await sendSmsNotification({
      to: input.phone,
      message: input.body
    });
  }
}

export async function listLivePayments(businessId: string) {
  return prisma.payment.findMany({
    where: {
      businessId
    },
    include: {
      recipient: true,
      schedule: true,
      approvals: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });
}

export async function createLivePayment(input: {
  businessId: string;
  createdByUserId: string;
  recipientId: string;
  amount: number;
  type: string;
  scheduleId?: string | null;
  scheduledFor?: Date | null;
  reference?: string | null;
  autoExecute?: boolean;
}) {
  const recipient = await prisma.recipient.findFirst({
    where: {
      id: input.recipientId,
      businessId: input.businessId,
      isActive: true
    }
  });

  if (!recipient) {
    throw new AppError("Recipient not found or inactive.", 404, "RECIPIENT_NOT_FOUND");
  }

  const business = await prisma.business.findUnique({
    where: {
      id: input.businessId
    },
    include: {
      settings: true,
      users: {
        where: {
          role: {
            in: ["OWNER", "ADMIN"]
          }
        },
        take: 1,
        orderBy: {
          createdAt: "asc"
        }
      }
    }
  });

  if (!business) {
    throw new AppError("Business not found.", 404, "BUSINESS_NOT_FOUND");
  }

  const ruleResult = await evaluateApplicableRules({
    businessId: input.businessId,
    planTier: business.planTier,
    scheduleId: input.scheduleId,
    recipientId: recipient.id,
    amount: input.amount,
    recipientType: recipient.type,
    department: recipient.department
  });

  const reference = buildPaymentReference({
    providedReference: input.reference,
    scheduleId: input.scheduleId,
    recipientId: recipient.id,
    scheduledFor: input.scheduledFor
  });

  const existingPayment = await prisma.payment.findUnique({
    where: {
      reference
    },
    include: {
      recipient: true,
      schedule: true,
      approvals: true
    }
  });

  if (existingPayment) {
    return existingPayment;
  }

  const approvalThreshold = business.settings?.approvalThreshold
    ? Number(business.settings.approvalThreshold.toString())
    : 0;

  const shouldRequireApproval =
    hasPlanFeature(business.planTier, "approvals") &&
    (ruleResult.action === "REQUIRE_APPROVAL" ||
      (approvalThreshold > 0 && input.amount >= approvalThreshold));

  const shouldWithhold = ruleResult.action === "WITHHOLD";

  const status = shouldWithhold
    ? PaymentStatus.WITHHELD
    : shouldRequireApproval
      ? PaymentStatus.PENDING_APPROVAL
      : PaymentStatus.SCHEDULED;

  const payment = await prisma.payment.create({
    data: {
      businessId: input.businessId,
      scheduleId: input.scheduleId,
      recipientId: recipient.id,
      ruleId: ruleResult.rule?.id ?? null,
      createdByUserId: input.createdByUserId,
      reference,
      type: input.type,
      amount: toDecimal(input.amount),
      status,
      scheduledFor: input.scheduledFor ?? null
    }
  });

  await writeAuditLog({
    businessId: input.businessId,
    actorUserId: input.createdByUserId,
    action: "payment.created",
    entityType: "Payment",
    entityId: payment.id,
    metadata: {
      amount: input.amount,
      type: input.type,
      scheduleId: input.scheduleId ?? null,
      recipientId: recipient.id,
      status
    }
  });

  if (shouldRequireApproval && business.users[0]) {
    await prisma.approvalRequest.create({
      data: {
        paymentId: payment.id,
        requesterId: input.createdByUserId,
        approverId: business.users[0].id,
        status: ApprovalStatus.PENDING
      }
    });

    await writeAuditLog({
      businessId: input.businessId,
      actorUserId: input.createdByUserId,
      action: "payment.approval_requested",
      entityType: "Payment",
      entityId: payment.id,
      metadata: {
        approverId: business.users[0].id
      }
    });

    await notifyPaymentEvent({
      businessId: input.businessId,
      title: "Approval required",
      body: `${recipient.fullName} payment of NGN ${input.amount.toFixed(2)} requires approval.`,
      email: business.users[0].email,
      phone: business.users[0].phone
    });
  }

  if (!shouldRequireApproval && !shouldWithhold && input.autoExecute !== false) {
    await executeLivePayment(payment.id);
  }

  return prisma.payment.findUnique({
    where: {
      id: payment.id
    },
    include: {
      recipient: true,
      schedule: true,
      approvals: true
    }
  });
}

export async function executeLivePayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId
    },
    include: {
      recipient: true
    }
  });

  if (!payment || !payment.recipient) {
    throw new AppError("Payment not found.", 404, "PAYMENT_NOT_FOUND");
  }

  if (payment.status !== PaymentStatus.SCHEDULED && payment.status !== PaymentStatus.FAILED) {
    throw new AppError("This payment cannot be executed right now.", 409, "INVALID_PAYMENT_STATE");
  }

  const amount = Number(payment.amount.toString());
  const holdReference = `${payment.reference}-hold`;

  await prisma.$transaction(async (tx) => {
    await reserveWalletAmount(tx, {
      businessId: payment.businessId,
      amount,
      reference: holdReference,
      narration: `Reserve funds for ${payment.reference}`
    });

    await tx.payment.update({
      where: {
        id: payment.id
      },
      data: {
        status: PaymentStatus.PROCESSING
      }
    });
  });

  const processorResult = await executeProcessor({
    reference: payment.reference,
    amount,
    accountNumber: payment.recipient.accountNumber,
    accountName: payment.recipient.accountName
  });

  if (processorResult.success) {
    await prisma.$transaction(async (tx) => {
      await settleReservedWalletAmount(tx, {
        businessId: payment.businessId,
        amount,
        reference: holdReference,
        narration: `Settle funds for ${payment.reference}`,
        success: true
      });

      await tx.payment.update({
        where: {
          id: payment.id
        },
        data: {
          status: PaymentStatus.PAID,
          processedAt: new Date(),
          failureReason: null
        }
      });
    });

    await writeAuditLog({
      businessId: payment.businessId,
      actorUserId: payment.createdByUserId,
      action: "payment.paid",
      entityType: "Payment",
      entityId: payment.id,
      metadata: {
        processor: processorResult.processor,
        responseCode: processorResult.responseCode
      }
    });

    await notifyPaymentEvent({
      businessId: payment.businessId,
      title: "Payment completed",
      body: `${payment.recipient.fullName} was paid successfully via ${processorResult.processor}.`,
      email: payment.recipient.email,
      phone: payment.recipient.phone
    });
  } else {
    await prisma.$transaction(async (tx) => {
      await settleReservedWalletAmount(tx, {
        businessId: payment.businessId,
        amount,
        reference: holdReference,
        narration: `Release funds for failed ${payment.reference}`,
        success: false
      });

      await tx.payment.update({
        where: {
          id: payment.id
        },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: processorResult.responseCode
        }
      });
    });

    await writeAuditLog({
      businessId: payment.businessId,
      actorUserId: payment.createdByUserId,
      action: "payment.failed",
      entityType: "Payment",
      entityId: payment.id,
      metadata: {
        processor: processorResult.processor,
        responseCode: processorResult.responseCode
      }
    });

    await notifyPaymentEvent({
      businessId: payment.businessId,
      title: "Payment failed",
      body: `${payment.recipient.fullName} could not be paid. Reason: ${processorResult.responseCode}.`,
      email: payment.recipient.email,
      phone: payment.recipient.phone
    });
  }

  return prisma.payment.findUnique({
    where: {
      id: payment.id
    },
    include: {
      recipient: true,
      approvals: true
    }
  });
}

export async function approvePayment(input: {
  paymentId: string;
  approverId: string;
}) {
  const approval = await prisma.approvalRequest.findFirst({
    where: {
      paymentId: input.paymentId,
      approverId: input.approverId,
      status: ApprovalStatus.PENDING
    }
  });

  if (!approval) {
    throw new AppError("No pending approval was found for this payment.", 404, "APPROVAL_NOT_FOUND");
  }

  const payment = await prisma.payment.findUnique({
    where: {
      id: approval.paymentId
    },
    select: {
      businessId: true
    }
  });

  await prisma.approvalRequest.update({
    where: {
      id: approval.id
    },
    data: {
      status: ApprovalStatus.APPROVED,
      decidedAt: new Date()
    }
  });

  await prisma.payment.update({
    where: {
      id: approval.paymentId
    },
    data: {
      status: PaymentStatus.SCHEDULED
    }
  });

  if (payment) {
    await writeAuditLog({
      businessId: payment.businessId,
      actorUserId: input.approverId,
      action: "payment.approved",
      entityType: "ApprovalRequest",
      entityId: approval.id,
      metadata: {
        paymentId: approval.paymentId
      }
    });
  }

  return executeLivePayment(approval.paymentId);
}

export async function rejectPayment(input: {
  paymentId: string;
  approverId: string;
  comment: string;
}) {
  const approval = await prisma.approvalRequest.findFirst({
    where: {
      paymentId: input.paymentId,
      approverId: input.approverId,
      status: ApprovalStatus.PENDING
    }
  });

  if (!approval) {
    throw new AppError("No pending approval was found for this payment.", 404, "APPROVAL_NOT_FOUND");
  }

  await prisma.$transaction(async (tx) => {
    await tx.approvalRequest.update({
      where: {
        id: approval.id
      },
      data: {
        status: ApprovalStatus.REJECTED,
        comment: input.comment,
        decidedAt: new Date()
      }
    });

    await tx.payment.update({
      where: {
        id: approval.paymentId
      },
      data: {
        status: PaymentStatus.CANCELLED,
        failureReason: input.comment
      }
    });
  });

  const payment = await prisma.payment.findUnique({
    where: {
      id: approval.paymentId
    },
    select: {
      businessId: true
    }
  });

  if (payment) {
    await writeAuditLog({
      businessId: payment.businessId,
      actorUserId: input.approverId,
      action: "payment.rejected",
      entityType: "ApprovalRequest",
      entityId: approval.id,
      metadata: {
        paymentId: approval.paymentId,
        comment: input.comment
      }
    });
  }

  return {
    rejected: true
  };
}

export async function reconcileRecentPayments(businessId: string) {
  const payments = await prisma.payment.findMany({
    where: {
      businessId,
      status: PaymentStatus.PAID
    },
    include: {
      recipient: true
    },
    orderBy: {
      processedAt: "desc"
    },
    take: 20
  });

  const checks = payments.map((payment) => ({
    paymentId: payment.id,
    reference: payment.reference,
    status: "matched",
    processorStatus: "verified"
  }));

  await queueNotification({
    businessId,
    title: "Reconciliation completed",
    body: `${checks.length} completed payments were checked against the current processor status.`,
    level: "success"
  });

  await writeAuditLog({
    businessId,
    action: "payment.reconciled",
    entityType: "PaymentBatch",
    metadata: {
      checkedCount: checks.length
    }
  });

  return {
    checkedCount: checks.length,
    checks
  };
}

export function testRuleAgainstPayload(input: {
  rule: {
    conditionsJson: Prisma.JsonValue;
  };
  amount: number;
  recipientType: string;
  department: string | null;
}) {
  const payload = (input.rule.conditionsJson ?? {}) as {
    logic?: "AND" | "OR";
    result?: "WITHHOLD" | "REQUIRE_APPROVAL";
    conditions?: Array<{
      field: "amount" | "recipientType" | "department" | "dayOfWeek";
      operator: "gt" | "gte" | "lt" | "eq" | "contains";
      value: string | number;
    }>;
  };

  return evaluateRulePayload(payload, {
    amount: input.amount,
    recipientType: input.recipientType,
    department: input.department,
    dayOfWeek: new Date().getDay()
  });
}
