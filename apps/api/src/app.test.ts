import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";

let createApp: typeof import("./app").createApp;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.PORT = "4000";
  process.env.FRONTEND_URL = "http://localhost:3000";
  process.env.DATABASE_URL = "postgresql://cloaka:cloaka@localhost:5432/cloaka";
  process.env.JWT_ACCESS_SECRET =
    "test-access-secret-that-is-definitely-long-enough-123456789";
  process.env.JWT_REFRESH_SECRET =
    "test-refresh-secret-that-is-definitely-long-enough-123456789";

  ({ createApp } = await import("./app"));
}, 30000);

describe("createApp", () => {
  it("returns health information", async () => {
    const app = createApp();
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("ok");
  });

  it("returns the mock overview payload", async () => {
    const app = createApp();
    const response = await request(app).get("/api/overview");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.metrics)).toBe(true);
    expect(Array.isArray(response.body.data.payments)).toBe(true);
  });

  it("returns marketing data for the landing page", async () => {
    const app = createApp();
    const response = await request(app).get("/api/landing");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.headline).toContain("control surface");
    expect(Array.isArray(response.body.data.pricingPlans)).toBe(true);
  });

  it("serves the OpenAPI document", async () => {
    const app = createApp();
    const response = await request(app).get("/api/openapi.json");

    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.paths["/api/recipients/import"]).toBeDefined();
  });

  it("returns a 400 for malformed JSON bodies", async () => {
    const app = createApp();
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_JSON");
  });
});
