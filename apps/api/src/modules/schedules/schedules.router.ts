import { ScheduleType } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { listLiveSchedules, runScheduleNow } from "../../services/schedule.service";

const createScheduleSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(400).optional(),
  type: z.nativeEnum(ScheduleType),
  dayOfMonth: z.coerce.number().int().min(1).max(31).optional(),
  weekday: z.coerce.number().int().min(0).max(6).optional(),
  runAt: z.string().max(20).optional(),
  approvalThreshold: z.coerce.number().positive().optional(),
  recipients: z.array(
    z.object({
      recipientId: z.string().min(1),
      amount: z.coerce.number().positive()
    })
  )
});

export const schedulesRouter = Router();

schedulesRouter.get(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const schedules = await listLiveSchedules(req.auth!.businessId);
    res.json(ok(schedules));
  })
);

schedulesRouter.post(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createScheduleSchema.parse(req.body);
    const schedule = await prisma.schedule.create({
      data: {
        businessId: req.auth!.businessId,
        name: input.name,
        description: input.description,
        type: input.type,
        dayOfMonth: input.dayOfMonth,
        weekday: input.weekday,
        runAt: input.runAt,
        approvalThreshold: input.approvalThreshold,
        recipients: {
          create: input.recipients.map((recipient) => ({
            recipientId: recipient.recipientId,
            fixedAmount: recipient.amount
          }))
        }
      },
      include: {
        recipients: true
      }
    });

    res.status(201).json(ok(schedule));
  })
);

schedulesRouter.post(
  "/:id/run",
  requireAuth,
  asyncHandler(async (req, res) => {
    const scheduleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await runScheduleNow({
      scheduleId,
      businessId: req.auth!.businessId,
      userId: req.auth!.userId
    });

    res.json(ok(result));
  })
);
