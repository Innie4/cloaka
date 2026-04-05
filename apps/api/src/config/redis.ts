import Redis from "ioredis";
import { env } from "./env";

const globalForRedis = globalThis as typeof globalThis & {
  cloakaRedis?: Redis | null;
};

export function getRedisClient() {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!globalForRedis.cloakaRedis) {
    globalForRedis.cloakaRedis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      lazyConnect: true
    });
  }

  return globalForRedis.cloakaRedis;
}

export async function ensureRedisConnection() {
  const client = getRedisClient();

  if (!client) {
    return null;
  }

  if (client.status === "wait") {
    await client.connect();
  }

  return client;
}
