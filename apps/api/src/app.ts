import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { requestLogger } from "./lib/request-logger";
import { errorHandler } from "./middleware/error-handler";
import { apiRouter } from "./routes";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.FRONTEND_URL
    })
  );
  app.use(
    express.json({
      verify: (req, _res, buffer) => {
        (req as typeof req & { rawBody?: string }).rawBody = buffer.toString("utf8");
      }
    })
  );
  app.use(requestLogger);

  app.get("/", (_req, res) => {
    res.json({
      name: "Cloaka API",
      description: "Mock API foundation for the Cloaka web shell.",
      docs: {
        health: "/api/health",
        overview: "/api/overview"
      }
    });
  });

  app.use("/api", apiRouter);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        message: "Route not found."
      }
    });
  });

  app.use(errorHandler);

  return app;
}
