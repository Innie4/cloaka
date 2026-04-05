import { Router } from "express";
import { z } from "zod";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { fundWallet, getWalletSummary, listWalletLedger } from "../../services/wallet.service";

const fundWalletSchema = z.object({
  amount: z.coerce.number().positive(),
  narration: z.string().min(2).max(200).default("Manual wallet funding")
});

export const walletRouter = Router();

walletRouter.get(
  "/summary",
  requireAuth,
  asyncHandler(async (req, res) => {
    const summary = await getWalletSummary(req.auth!.businessId);
    res.json(ok(summary));
  })
);

walletRouter.get(
  "/ledger",
  requireAuth,
  asyncHandler(async (req, res) => {
    const entries = await listWalletLedger(req.auth!.businessId);
    res.json(ok(entries));
  })
);

walletRouter.post(
  "/fund",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = fundWalletSchema.parse(req.body);
    const entry = await fundWallet({
      businessId: req.auth!.businessId,
      amount: input.amount,
      narration: input.narration
    });

    res.status(201).json(ok(entry));
  })
);
