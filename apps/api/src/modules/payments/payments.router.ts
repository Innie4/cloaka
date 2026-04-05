import { Router } from "express";
import { z } from "zod";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import {
  createLivePayment,
  executeLivePayment,
  listLivePayments,
  reconcileRecentPayments
} from "../../services/payment-orchestration.service";

const createPaymentSchema = z.object({
  recipientId: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: z.string().min(2).max(40),
  scheduleId: z.string().min(1).optional()
});

export const paymentsRouter = Router();

paymentsRouter.get(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const payments = await listLivePayments(req.auth!.businessId);
    res.json(ok(payments));
  })
);

paymentsRouter.post(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createPaymentSchema.parse(req.body);
    const payment = await createLivePayment({
      businessId: req.auth!.businessId,
      createdByUserId: req.auth!.userId,
      recipientId: input.recipientId,
      amount: input.amount,
      type: input.type,
      scheduleId: input.scheduleId
    });
    res.status(201).json(ok(payment));
  })
);

paymentsRouter.post(
  "/:id/execute",
  requireAuth,
  asyncHandler(async (req, res) => {
    const paymentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payment = await executeLivePayment(paymentId);
    res.json(ok(payment));
  })
);

paymentsRouter.post(
  "/:id/retry",
  requireAuth,
  asyncHandler(async (req, res) => {
    const paymentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const payment = await executeLivePayment(paymentId);
    res.json(ok(payment));
  })
);

paymentsRouter.post(
  "/reconcile",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await reconcileRecentPayments(req.auth!.businessId);
    res.json(ok(result));
  })
);
