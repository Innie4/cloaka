import assert from "node:assert/strict";
import request from "supertest";
import { evaluateRulePayload } from "./services/rule-engine.service";

async function main() {
  process.env.NODE_ENV = "test";
  process.env.PORT = "4000";
  process.env.FRONTEND_URL = "http://localhost:3000";
  process.env.DATABASE_URL = "postgresql://cloaka:cloaka@localhost:5432/cloaka";
  process.env.JWT_ACCESS_SECRET =
    "test-access-secret-that-is-definitely-long-enough-123456789";
  process.env.JWT_REFRESH_SECRET =
    "test-refresh-secret-that-is-definitely-long-enough-123456789";

  const { createApp } = await import("./app");
  const app = createApp();

  const healthResponse = await request(app).get("/api/health");
  assert.equal(healthResponse.status, 200);
  assert.equal(healthResponse.body.success, true);
  assert.equal(healthResponse.body.data.status, "ok");

  const overviewResponse = await request(app).get("/api/overview");
  assert.equal(overviewResponse.status, 200);
  assert.equal(Array.isArray(overviewResponse.body.data.metrics), true);
  assert.equal(Array.isArray(overviewResponse.body.data.payments), true);

  const landingResponse = await request(app).get("/api/landing");
  assert.equal(landingResponse.status, 200);
  assert.equal(typeof landingResponse.body.data.headline, "string");
  assert.equal(Array.isArray(landingResponse.body.data.pricingPlans), true);

  const openApiResponse = await request(app).get("/api/openapi.json");
  assert.equal(openApiResponse.status, 200);
  assert.equal(openApiResponse.body.openapi, "3.0.3");
  assert.ok(openApiResponse.body.paths["/api/payments/live"]);
  assert.ok(openApiResponse.body.paths["/api/schedules/live"]);
  assert.ok(openApiResponse.body.paths["/api/team/live"]);
  assert.ok(openApiResponse.body.paths["/api/audit/live"]);
  assert.ok(openApiResponse.body.paths["/api/reports/live"]);

  const malformedJsonResponse = await request(app)
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send('{"email":');
  assert.equal(malformedJsonResponse.status, 400);
  assert.equal(malformedJsonResponse.body.error.code, "INVALID_JSON");

  const andRuleMatched = evaluateRulePayload(
    {
      logic: "AND",
      conditions: [
        { field: "amount", operator: "gte", value: 300000 },
        { field: "recipientType", operator: "eq", value: "VENDOR" }
      ]
    },
    {
      amount: 450000,
      recipientType: "VENDOR",
      department: "Finance",
      dayOfWeek: 1
    }
  );
  assert.equal(andRuleMatched, true);

  const orRuleMatched = evaluateRulePayload(
    {
      logic: "OR",
      conditions: [
        { field: "department", operator: "contains", value: "Oper" },
        { field: "dayOfWeek", operator: "eq", value: 5 }
      ]
    },
    {
      amount: 150000,
      recipientType: "EMPLOYEE",
      department: "Operations",
      dayOfWeek: 2
    }
  );
  assert.equal(orRuleMatched, true);

  console.log("API regression checks passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
