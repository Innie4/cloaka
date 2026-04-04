import { Router } from "express";
import { prisma } from "../../config/database";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { createRecipientSchema } from "./recipients.schemas";

export const recipientsRouter = Router();

recipientsRouter.get(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const recipients = await prisma.recipient.findMany({
      where: {
        businessId: req.auth!.businessId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(ok(recipients));
  })
);

recipientsRouter.post(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createRecipientSchema.parse(req.body);

    const recipient = await prisma.recipient.create({
      data: {
        businessId: req.auth!.businessId,
        ...input
      }
    });

    res.status(201).json(ok(recipient));
  })
);
