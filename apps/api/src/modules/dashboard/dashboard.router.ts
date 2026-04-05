import { Router } from "express";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { prisma } from "../../config/database";
import { getWalletSummary } from "../../services/wallet.service";

export const dashboardRouter = Router();

dashboardRouter.get(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const [wallet, recipients, schedules, payments, approvals] = await Promise.all([
      getWalletSummary(req.auth!.businessId),
      prisma.recipient.count({
        where: {
          businessId: req.auth!.businessId,
          isActive: true
        }
      }),
      prisma.schedule.findMany({
        where: {
          businessId: req.auth!.businessId
        },
        include: {
          recipients: true
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 3
      }),
      prisma.payment.findMany({
        where: {
          businessId: req.auth!.businessId
        },
        include: {
          recipient: true
        },
        orderBy: {
          createdAt: "desc"
        },
        take: 8
      }),
      prisma.approvalRequest.count({
        where: {
          payment: {
            businessId: req.auth!.businessId
          },
          status: "PENDING"
        }
      })
    ]);

    res.json(
      ok({
        wallet,
        recipientCount: recipients,
        pendingApprovals: approvals,
        schedules: schedules.map((schedule) => ({
          id: schedule.id,
          name: schedule.name,
          type: schedule.type,
          recipientCount: schedule.recipients.length
        })),
        payments: payments.map((payment) => ({
          id: payment.id,
          reference: payment.reference,
          amount: Number(payment.amount.toString()),
          status: payment.status,
          recipient: payment.recipient?.fullName ?? "No recipient",
          createdAt: payment.createdAt.toISOString()
        }))
      })
    );
  })
);
