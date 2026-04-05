import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { queueNotification } from "../../services/notifications.service";

export const businessesRouter = Router();

const updateSettingsSchema = z.object({
  lowBalanceThreshold: z.string().min(1).optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional()
});

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

businessesRouter.patch(
  "/me/settings",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = updateSettingsSchema.parse(req.body);

    const settings = await prisma.businessSettings.upsert({
      where: {
        businessId: req.auth!.businessId
      },
      update: {
        ...(input.lowBalanceThreshold
          ? {
              lowBalanceThreshold: input.lowBalanceThreshold
            }
          : {}),
        ...(input.emailNotifications !== undefined
          ? {
              emailNotifications: input.emailNotifications
            }
          : {}),
        ...(input.smsNotifications !== undefined
          ? {
              smsNotifications: input.smsNotifications
            }
          : {})
      },
      create: {
        businessId: req.auth!.businessId,
        lowBalanceThreshold: input.lowBalanceThreshold ?? "50000",
        emailNotifications: input.emailNotifications ?? true,
        smsNotifications: input.smsNotifications ?? true
      }
    });

    await prisma.auditLog.create({
      data: {
        businessId: req.auth!.businessId,
        actorUserId: req.auth!.userId,
        action: "business.settings_updated",
        entityType: "BusinessSettings",
        entityId: settings.id,
        metadata: input as never
      }
    });

    await queueNotification({
      businessId: req.auth!.businessId,
      title: "Settings updated",
      body: "Business notification and threshold settings were updated.",
      level: "success"
    });

    res.json(ok(settings));
  })
);
