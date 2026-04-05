import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { ok } from "../../lib/api-response";
import { AppError } from "../../lib/app-error";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { approvePayment, rejectPayment } from "../../services/payment-orchestration.service";

const rejectSchema = z.object({
  comment: z.string().min(3).max(300)
});

export const approvalsRouter = Router();

approvalsRouter.get(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const approvals = await prisma.approvalRequest.findMany({
      where: {
        payment: {
          businessId: req.auth!.businessId
        }
      },
      include: {
        payment: {
          include: {
            recipient: true
          }
        },
        requester: true,
        approver: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(ok(approvals));
  })
);

approvalsRouter.post(
  "/:id/approve",
  requireAuth,
  asyncHandler(async (req, res) => {
    const approvalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const approval = await prisma.approvalRequest.findUnique({
      where: {
        id: approvalId
      }
    });

    if (!approval) {
      throw new AppError("Approval not found.", 404, "APPROVAL_NOT_FOUND");
    }

    const payment = await approvePayment({
      paymentId: approval.paymentId,
      approverId: req.auth!.userId
    });

    res.json(ok(payment));
  })
);

approvalsRouter.post(
  "/:id/reject",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = rejectSchema.parse(req.body);
    const approvalId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const approval = await prisma.approvalRequest.findUnique({
      where: {
        id: approvalId
      }
    });

    if (!approval) {
      throw new AppError("Approval not found.", 404, "APPROVAL_NOT_FOUND");
    }

    const result = await rejectPayment({
      paymentId: approval.paymentId,
      approverId: req.auth!.userId,
      comment: input.comment
    });

    res.json(ok(result));
  })
);
