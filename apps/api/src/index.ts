import "dotenv/config";
import { createServer } from "node:http";
import { env } from "./config/env";
import { createApp } from "./app";

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`Cloaka API listening on http://localhost:${env.PORT}`);
});
