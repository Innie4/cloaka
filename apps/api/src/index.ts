import "dotenv/config";
import { createServer } from "node:http";
import { env } from "./config/env";
import { ensureRedisConnection } from "./config/redis";
import { createApp } from "./app";
import { startBackgroundWorkers } from "./workers";

async function bootstrap() {
  try {
    await ensureRedisConnection();
    await startBackgroundWorkers();
  } catch (error) {
    console.error("Background services failed to start cleanly.", error);
  }

  const app = createApp();
  const server = createServer(app);

  server.listen(env.PORT, () => {
    console.log(`Cloaka API listening on http://localhost:${env.PORT}`);
  });
}

void bootstrap();
