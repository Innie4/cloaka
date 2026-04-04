import { Router } from "express";
import { prisma } from "../../config/database";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";

export const businessesRouter = Router();

businessesRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const business = await prisma.business.findUnique({
      where: {
        id: req.auth!.businessId
      },
      include: {
        settings: true,
        _count: {
          select: {
            recipients: true,
            schedules: true,
            payments: true,
            users: true,
            rules: true
          }
        }
      }
    });

    res.json(ok(business));
  })
);
