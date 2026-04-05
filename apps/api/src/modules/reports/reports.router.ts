import { PaymentStatus } from "@prisma/client";
import { Router } from "express";
import { prisma } from "../../config/database";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";

function sumAmounts(payments: Array<{ amount: { toString(): string } }>) {
  return payments.reduce((total, payment) => total + Number(payment.amount.toString()), 0);
}

export const reportsRouter = Router();

reportsRouter.get(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payments = await prisma.payment.findMany({
      where: {
        businessId: req.auth!.businessId
      },
      include: {
        recipient: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const byStatus = Object.values(PaymentStatus).map((status) => {
      const matchingPayments = payments.filter((payment) => payment.status === status);
      return {
        status,
        count: matchingPayments.length,
        totalAmount: sumAmounts(matchingPayments)
      };
    });

    const typeMap = new Map<string, { type: string; count: number; totalAmount: number }>();
    for (const payment of payments) {
      const current = typeMap.get(payment.type) ?? {
        type: payment.type,
        count: 0,
        totalAmount: 0
      };

      current.count += 1;
      current.totalAmount += Number(payment.amount.toString());
      typeMap.set(payment.type, current);
    }

    const monthlyTrendMap = new Map<string, { month: string; count: number; totalAmount: number }>();
    for (const payment of payments) {
      const month = payment.createdAt.toISOString().slice(0, 7);
      const current = monthlyTrendMap.get(month) ?? {
        month,
        count: 0,
        totalAmount: 0
      };

      current.count += 1;
      current.totalAmount += Number(payment.amount.toString());
      monthlyTrendMap.set(month, current);
    }

    res.json(
      ok({
        summary: {
          totalDisbursed: sumAmounts(
            payments.filter((payment) => payment.status === PaymentStatus.PAID)
          ),
          paidCount: payments.filter((payment) => payment.status === PaymentStatus.PAID).length,
          failedCount: payments.filter((payment) => payment.status === PaymentStatus.FAILED).length,
          pendingApprovalCount: payments.filter(
            (payment) => payment.status === PaymentStatus.PENDING_APPROVAL
          ).length,
          withheldCount: payments.filter((payment) => payment.status === PaymentStatus.WITHHELD)
            .length
        },
        byStatus,
        byType: Array.from(typeMap.values()).sort((left, right) => right.count - left.count),
        monthlyTrend: Array.from(monthlyTrendMap.values()).sort((left, right) =>
          left.month.localeCompare(right.month)
        ),
        failedPayments: payments
          .filter((payment) => payment.status === PaymentStatus.FAILED)
          .slice(0, 10)
          .map((payment) => ({
            id: payment.id,
            reference: payment.reference,
            amount: Number(payment.amount.toString()),
            recipient: payment.recipient?.fullName ?? "No recipient",
            failureReason: payment.failureReason,
            createdAt: payment.createdAt.toISOString()
          }))
      })
    );
  })
);
