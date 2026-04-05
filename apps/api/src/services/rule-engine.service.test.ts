import { describe, expect, it } from "vitest";
import { evaluateRulePayload } from "./rule-engine.service";

describe("evaluateRulePayload", () => {
  it("matches when all AND conditions pass", () => {
    const result = evaluateRulePayload(
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

    expect(result).toBe(true);
  });

  it("matches when one OR condition passes", () => {
    const result = evaluateRulePayload(
      {
        logic: "OR",
        conditions: [
          { field: "department", operator: "contains", value: "Ops" },
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

    expect(result).toBe(true);
  });
});
