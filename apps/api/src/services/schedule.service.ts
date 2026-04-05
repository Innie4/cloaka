import { ScheduleType } from "@prisma/client";
import { prisma } from "../config/database";
import { AppError } from "../lib/app-error";
import { createLivePayment } from "./payment-orchestration.service";

function parseRunAt(runAt: string | null) {
  if (!runAt) {
    return { hour: 9, minute: 0 };
  }

  const [hourText, minuteText] = runAt.split(":");
  return {
    hour: Number(hourText ?? "9"),
    minute: Number(minuteText ?? "0")
  };
}

function buildRunSlotKey(date: Date) {
  return date.toISOString().slice(0, 16);
}

function getRunSlotDate(date: Date) {
  return new Date(`${buildRunSlotKey(date)}:00.000Z`);
}

export function isScheduleDueNow(input: {
  type: ScheduleType;
  dayOfMonth: number | null;
  weekday: number | null;
  runAt: string | null;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const { hour, minute } = parseRunAt(input.runAt);

  if (now.getUTCHours() !== hour || now.getUTCMinutes() !== minute) {
    return false;
  }

  switch (input.type) {
    case ScheduleType.ONE_TIME:
      return true;
    case ScheduleType.WEEKLY:
      return now.getUTCDay() === (input.weekday ?? now.getUTCDay());
    case ScheduleType.FORTNIGHTLY:
      return now.getUTCDate() <= 14
        ? now.getUTCDay() === (input.weekday ?? now.getUTCDay())
        : now.getUTCDay() === (input.weekday ?? now.getUTCDay());
    case ScheduleType.MONTHLY:
      return now.getUTCDate() === (input.dayOfMonth ?? now.getUTCDate());
    case ScheduleType.EVENT_TRIGGERED:
      return false;
    default:
      return false;
  }
}

export async function listLiveSchedules(businessId: string) {
  return prisma.schedule.findMany({
    where: {
      businessId
    },
    include: {
      recipients: {
        include: {
          recipient: true
        }
      },
      payments: {
        orderBy: {
          createdAt: "desc"
        },
        take: 5
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function runScheduleNow(input: {
  scheduleId: string;
  businessId: string;
  userId: string;
  referenceDate?: Date;
  force?: boolean;
}) {
  const schedule = await prisma.schedule.findFirst({
    where: {
      id: input.scheduleId,
      businessId: input.businessId
    },
    include: {
      recipients: {
        include: {
          recipient: true
        }
      }
    }
  });

  if (!schedule) {
    throw new AppError("Schedule not found.", 404, "SCHEDULE_NOT_FOUND");
  }

  const referenceDate = input.referenceDate ?? new Date();
  const scheduledFor = getRunSlotDate(referenceDate);

  if (!input.force && !isScheduleDueNow({ ...schedule, now: referenceDate })) {
    return {
      createdPayments: 0,
      skippedPayments: schedule.recipients.length,
      payments: []
    };
  }

  const results = [];
  let skippedPayments = 0;

  for (const recipientLink of schedule.recipients) {
    if (!recipientLink.fixedAmount) {
      skippedPayments += 1;
      continue;
    }

    if (schedule.type === ScheduleType.ONE_TIME) {
      const priorOneTimePayment = await prisma.payment.findFirst({
        where: {
          scheduleId: schedule.id,
          recipientId: recipientLink.recipientId
        },
        select: {
          id: true
        }
      });

      if (priorOneTimePayment) {
        skippedPayments += 1;
        continue;
      }
    }

    const reference = `clk-${schedule.id.slice(0, 8)}-${recipientLink.recipientId.slice(0, 8)}-${buildRunSlotKey(scheduledFor).replace(/[:T-]/g, "")}`;
    const existingPayment = await prisma.payment.findUnique({
      where: {
        reference
      }
    });

    if (existingPayment) {
      skippedPayments += 1;
      continue;
    }

    results.push(
      await createLivePayment({
        businessId: input.businessId,
        createdByUserId: input.userId,
        recipientId: recipientLink.recipientId,
        amount: Number(recipientLink.fixedAmount.toString()),
        type: schedule.name,
        scheduleId: schedule.id,
        scheduledFor,
        reference
      })
    );
  }

  await prisma.auditLog.create({
    data: {
      businessId: input.businessId,
      actorUserId: input.userId,
      action: "schedule.executed",
      entityType: "Schedule",
      entityId: schedule.id,
      metadata: {
        scheduledFor: scheduledFor.toISOString(),
        createdPayments: results.length,
        skippedPayments
      }
    }
  });

  return {
    createdPayments: results.length,
    skippedPayments,
    payments: results
  };
}
