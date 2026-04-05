import { Queue, Worker } from "bullmq";
import { getRedisClient } from "../config/redis";
import { executeLivePayment, reconcileRecentPayments } from "../services/payment-orchestration.service";
import { persistNotification } from "../services/notifications.service";
import { isScheduleDueNow, runScheduleNow } from "../services/schedule.service";
import { prisma } from "../config/database";

const globalForWorkers = globalThis as typeof globalThis & {
  cloakaWorkersStarted?: boolean;
  cloakaNotificationQueue?: Queue | null;
};

function getQueue(name: string) {
  const connection = getRedisClient();

  if (!connection) {
    return null;
  }

  return new Queue(name, {
    connection
  });
}

export async function startBackgroundWorkers() {
  if (globalForWorkers.cloakaWorkersStarted) {
    return;
  }

  const connection = getRedisClient();

  if (!connection) {
    return;
  }

  new Worker(
    "cloaka-notifications",
    async (job) => {
      await persistNotification(job.data as never);
    },
    { connection }
  );

  new Worker(
    "cloaka-scheduler",
    async () => {
      const dueSchedules = await prisma.schedule.findMany({
        where: {
          pausedAt: null
        },
        take: 5
      });

      const now = new Date();

      for (const schedule of dueSchedules) {
        if (!isScheduleDueNow({ ...schedule, now })) {
          continue;
        }

        const runner = await prisma.user.findFirst({
          where: {
            businessId: schedule.businessId
          },
          orderBy: {
            createdAt: "asc"
          }
        });

        if (!runner) {
          continue;
        }

        await runScheduleNow({
          scheduleId: schedule.id,
          businessId: schedule.businessId,
          referenceDate: now,
          userId: runner.id
        });
      }

      return {
        dueSchedules: dueSchedules.length
      };
    },
    { connection }
  );

  new Worker(
    "cloaka-disbursements",
    async (job) => {
      if (job.data?.paymentId) {
        return executeLivePayment(job.data.paymentId);
      }

      return { handled: false };
    },
    { connection }
  );

  new Worker(
    "cloaka-reconciliation",
    async () => {
      const businesses = await prisma.business.findMany({
        select: {
          id: true
        }
      });

      const reports = [];

      for (const business of businesses) {
        reports.push(await reconcileRecentPayments(business.id));
      }

      return {
        reconciledBusinesses: reports.length
      };
    },
    { connection }
  );

  const schedulerQueue = getQueue("cloaka-scheduler");
  const reconciliationQueue = getQueue("cloaka-reconciliation");

  if (schedulerQueue) {
    await schedulerQueue.upsertJobScheduler("every-minute", {
      pattern: "* * * * *"
    });
  }

  if (reconciliationQueue) {
    await reconciliationQueue.upsertJobScheduler("daily-2am", {
      pattern: "0 1 * * *"
    });
  }

  globalForWorkers.cloakaWorkersStarted = true;
}
