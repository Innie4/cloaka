import { Router } from "express";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { prisma } from "../../config/database";

export const auditRouter = Router();

auditRouter.get(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const events = await prisma.auditLog.findMany({
      where: {
        businessId: req.auth!.businessId
      },
      include: {
        actorUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 60
    });

    res.json(
      ok(
        events.map((event) => ({
          id: event.id,
          action: event.action,
          entityType: event.entityType,
          entityId: event.entityId,
          metadata: event.metadata,
          ipAddress: event.ipAddress,
          createdAt: event.createdAt.toISOString(),
          actorUser: event.actorUser
        }))
      )
    );
  })
);
