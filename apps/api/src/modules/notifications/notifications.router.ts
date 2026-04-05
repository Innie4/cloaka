import { Router } from "express";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { listNotifications } from "../../services/notifications.service";

export const notificationsRouter = Router();

notificationsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const notifications = await listNotifications(req.auth!.businessId);
    res.json(ok(notifications));
  })
);
