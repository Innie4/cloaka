import { randomUUID } from "node:crypto";
import { Queue } from "bullmq";
import { ensureRedisConnection, getRedisClient } from "../config/redis";

export type NotificationRecord = {
  id: string;
  businessId: string;
  title: string;
  body: string;
  level: "info" | "success" | "warning";
  read: boolean;
  createdAt: string;
};

type NotificationJob = Omit<NotificationRecord, "id" | "createdAt" | "read">;

const NOTIFICATION_QUEUE = "cloaka-notifications";
const NOTIFICATION_TTL_SECONDS = 60 * 60 * 24 * 7;
let notificationQueue: Queue<NotificationJob> | null = null;

function notificationKey(businessId: string) {
  return `cloaka:notifications:${businessId}`;
}

function getNotificationQueue() {
  const connection = getRedisClient();

  if (!connection) {
    return null;
  }

  if (!notificationQueue) {
    notificationQueue = new Queue<NotificationJob>(NOTIFICATION_QUEUE, {
      connection
    });
  }

  return notificationQueue;
}

export async function persistNotification(notification: NotificationJob) {
  const redis = await ensureRedisConnection();

  if (!redis) {
    return null;
  }

  const record: NotificationRecord = {
    id: randomUUID(),
    businessId: notification.businessId,
    title: notification.title,
    body: notification.body,
    level: notification.level,
    read: false,
    createdAt: new Date().toISOString()
  };

  const key = notificationKey(notification.businessId);
  await redis.lpush(key, JSON.stringify(record));
  await redis.ltrim(key, 0, 49);
  await redis.expire(key, NOTIFICATION_TTL_SECONDS);

  return record;
}

export async function queueNotification(notification: NotificationJob) {
  const queue = getNotificationQueue();

  if (!queue) {
    return persistNotification(notification);
  }

  await queue.add("deliver", notification, {
    removeOnComplete: true,
    attempts: 3
  });

  return null;
}

export async function listNotifications(businessId: string) {
  const redis = await ensureRedisConnection();

  if (!redis) {
    return [] as NotificationRecord[];
  }

  const entries = await redis.lrange(notificationKey(businessId), 0, 9);
  return entries
    .map((entry) => {
      try {
        return JSON.parse(entry) as NotificationRecord;
      } catch {
        return null;
      }
    })
    .filter((entry): entry is NotificationRecord => entry !== null);
}
