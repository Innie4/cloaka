import { Router } from "express";
import {
  getApprovals,
  getAuditEvents,
  getDashboardOverview,
  getMarketingPageData,
  getPayments,
  getRecipients,
  getReports,
  getRules,
  getSchedules,
  getSettingsCards,
  getTeamRoles,
  getTrustHighlights
} from "@cloaka/shared";
import { ok } from "../lib/api-response";
import { authRouter } from "../modules/auth/auth.router";
import { businessesRouter } from "../modules/businesses/businesses.router";
import { integrationsRouter } from "../modules/integrations/integrations.router";
import { recipientsRouter } from "../modules/recipients/recipients.router";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json(
    ok({
      name: "Cloaka API",
      status: "ok",
      timestamp: new Date().toISOString()
    })
  );
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/businesses", businessesRouter);
apiRouter.use("/integrations", integrationsRouter);
apiRouter.use("/recipients", recipientsRouter);

apiRouter.get("/overview", (_req, res) => {
  res.json(ok(getDashboardOverview()));
});

apiRouter.get("/landing", (_req, res) => {
  res.json(ok(getMarketingPageData()));
});

apiRouter.get("/payments", (_req, res) => {
  res.json(ok(getPayments()));
});

apiRouter.get("/schedules", (_req, res) => {
  res.json(ok(getSchedules()));
});

apiRouter.get("/rules", (_req, res) => {
  res.json(ok(getRules()));
});

apiRouter.get("/approvals", (_req, res) => {
  res.json(ok(getApprovals()));
});

apiRouter.get("/recipients", (_req, res) => {
  res.json(ok(getRecipients()));
});

apiRouter.get("/team", (_req, res) => {
  res.json(ok(getTeamRoles()));
});

apiRouter.get("/audit", (_req, res) => {
  res.json(ok(getAuditEvents()));
});

apiRouter.get("/reports", (_req, res) => {
  res.json(ok(getReports()));
});

apiRouter.get("/settings", (_req, res) => {
  res.json(ok(getSettingsCards()));
});

apiRouter.get("/trust", (_req, res) => {
  res.json(ok(getTrustHighlights()));
});
