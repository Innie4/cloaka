import { Router } from "express";
import { ok } from "../../lib/api-response";
import { asyncHandler } from "../../lib/async-handler";
import { getIntegrationStatuses } from "../../services/integration-status.service";

export const integrationsRouter = Router();

integrationsRouter.get(
  "/status",
  asyncHandler(async (_req, res) => {
    const statuses = await getIntegrationStatuses();
    res.json(ok(statuses));
  })
);
