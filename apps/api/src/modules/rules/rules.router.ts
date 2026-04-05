import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { ok } from "../../lib/api-response";
import { AppError } from "../../lib/app-error";
import { asyncHandler } from "../../lib/async-handler";
import { requireAuth } from "../../middleware/require-auth";
import { assertPlanFeature } from "../../services/plan-access.service";
import { testRuleAgainstPayload } from "../../services/payment-orchestration.service";

const ruleConditionSchema = z.object({
  field: z.enum(["amount", "recipientType", "department", "dayOfWeek"]),
  operator: z.enum(["gt", "gte", "lt", "eq", "contains"]),
  value: z.union([z.string(), z.number()])
});

const createRuleSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(2).max(240),
  type: z.enum([
    "ATTENDANCE",
    "APPROVAL",
    "TASK_COMPLETION",
    "THRESHOLD",
    "DATE_WINDOW",
    "MULTI_CONDITION"
  ]),
  scheduleId: z.string().min(1).optional(),
  logic: z.enum(["AND", "OR"]).default("AND"),
  result: z.enum(["WITHHOLD", "REQUIRE_APPROVAL"]).default("WITHHOLD"),
  conditions: z.array(ruleConditionSchema).min(1)
});

const testRuleSchema = z.object({
  amount: z.coerce.number().positive(),
  recipientType: z.string().min(2),
  department: z.string().optional()
});

export const rulesRouter = Router();

rulesRouter.get(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    const rules = await prisma.rule.findMany({
      where: {
        businessId: req.auth!.businessId
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    res.json(ok(rules));
  })
);

rulesRouter.post(
  "/live",
  requireAuth,
  asyncHandler(async (req, res) => {
    await assertPlanFeature(req.auth!.businessId, "rules_engine");
    const input = createRuleSchema.parse(req.body);
    const rule = await prisma.rule.create({
      data: {
        businessId: req.auth!.businessId,
        scheduleId: input.scheduleId,
        name: input.name,
        description: input.description,
        type: input.type,
        conditionsJson: {
          logic: input.logic,
          result: input.result,
          conditions: input.conditions
        }
      }
    });

    res.status(201).json(ok(rule));
  })
);

rulesRouter.post(
  "/:id/test",
  requireAuth,
  asyncHandler(async (req, res) => {
    await assertPlanFeature(req.auth!.businessId, "rules_engine");
    const input = testRuleSchema.parse(req.body);
    const ruleId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const rule = await prisma.rule.findFirst({
      where: {
        id: ruleId,
        businessId: req.auth!.businessId
      }
    });

    if (!rule) {
      throw new AppError("Rule not found.", 404, "RULE_NOT_FOUND");
    }

    const matched = testRuleAgainstPayload({
      rule,
      amount: input.amount,
      recipientType: input.recipientType,
      department: input.department ?? null
    });

    res.json(ok({ matched }));
  })
);
