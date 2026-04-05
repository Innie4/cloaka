import { Queue, Worker } from "bullmq";
import { prisma } from "../config/database";
import { getRedisClient } from "../config/redis";
import { persistNotification } from "../services/notifications.service";

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
      const dueSchedules = await prisma.schedule.count({
        where: {
          pausedAt: null
        }
      });

      return {
        dueSchedules
      };
    },
    { connection }
  );

  new Worker(
    "cloaka-disbursements",
    async (job) => {
      return {
        handled: true,
        paymentId: job.data?.paymentId ?? null
      };
    },
    { connection }
  );

  new Worker(
    "cloaka-reconciliation",
    async () => {
      const payments = await prisma.payment.count();
      return {
        reconciledPayments: payments
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
