import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";
import { Router } from "express";
import { prisma } from "../../config/database";
import { env } from "../../config/env";
import { ok } from "../../lib/api-response";
import { AppError } from "../../lib/app-error";
import { asyncHandler } from "../../lib/async-handler";
import { queueNotification } from "../../services/notifications.service";

type RawRequest = Request & {
  rawBody?: string;
};

function equalsSignature(received: string | undefined, expected: string) {
  if (!received) {
    return false;
  }

  const left = Buffer.from(received);
  const right = Buffer.from(expected);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function verifyHmac(req: RawRequest, headerName: string, secret: string | undefined) {
  if (!secret) {
    throw new AppError("Webhook secret not configured.", 503, "WEBHOOK_NOT_CONFIGURED");
  }

  const body = req.rawBody ?? JSON.stringify(req.body ?? {});
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  const received = req.header(headerName);

  if (!equalsSignature(received ?? undefined, expected)) {
    throw new AppError("Invalid webhook signature.", 401, "INVALID_WEBHOOK_SIGNATURE");
  }
}

async function recordWebhook(source: string, payload: unknown) {
  const business = await prisma.business.findFirst({
    orderBy: {
      createdAt: "asc"
    }
  });

  if (!business) {
    return;
  }

  await prisma.auditLog.create({
    data: {
      businessId: business.id,
      action: `${source}.webhook_received`,
      entityType: "Webhook",
      metadata: payload as never
    }
  });

  await queueNotification({
    businessId: business.id,
    title: `${source} webhook received`,
    body: `Cloaka received a signed webhook from ${source}.`,
    level: "info"
  });
}

export const webhooksRouter = Router();

webhooksRouter.post(
  "/paystack",
  asyncHandler(async (req, res) => {
    verifyHmac(req as RawRequest, "x-paystack-signature", env.PAYSTACK_SECRET_KEY);
    await recordWebhook("paystack", req.body);
    res.json(ok({ received: true }));
  })
);

webhooksRouter.post(
  "/flutterwave",
  asyncHandler(async (req, res) => {
    const received = req.header("verif-hash");
    const expected = env.FLUTTERWAVE_SECRET_KEY;

    if (!expected || !equalsSignature(received ?? undefined, expected)) {
      throw new AppError("Invalid webhook signature.", 401, "INVALID_WEBHOOK_SIGNATURE");
    }

    await recordWebhook("flutterwave", req.body);
    res.json(ok({ received: true }));
  })
);

webhooksRouter.post(
  "/task-marketplace",
  asyncHandler(async (req, res) => {
    verifyHmac(req as RawRequest, "x-task-signature", env.TASK_MARKETPLACE_WEBHOOK_SECRET);
    await recordWebhook("task-marketplace", req.body);
    res.json(ok({ received: true }));
  })
);

webhooksRouter.post(
  "/virtual-account",
  asyncHandler(async (req, res) => {
    verifyHmac(
      req as RawRequest,
      "x-va-signature",
      env.PROVIDUS_SECRET_KEY ?? env.WEMA_SECRET_KEY
    );
    await recordWebhook("virtual-account", req.body);
    res.json(ok({ received: true }));
  })
);
