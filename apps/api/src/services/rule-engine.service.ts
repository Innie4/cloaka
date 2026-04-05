import { prisma } from "../config/database";

type RuleCondition = {
  field: "amount" | "recipientType" | "department" | "dayOfWeek";
  operator: "gt" | "gte" | "lt" | "eq" | "contains";
  value: string | number;
};

type RulePayload = {
  logic?: "AND" | "OR";
  result?: "WITHHOLD" | "REQUIRE_APPROVAL";
  conditions?: RuleCondition[];
};

type RuleContext = {
  amount: number;
  recipientType: string;
  department: string | null;
  dayOfWeek: number;
};

function compareCondition(condition: RuleCondition, context: RuleContext) {
  const currentValue = context[condition.field];

  switch (condition.operator) {
    case "gt":
      return Number(currentValue) > Number(condition.value);
    case "gte":
      return Number(currentValue) >= Number(condition.value);
    case "lt":
      return Number(currentValue) < Number(condition.value);
    case "contains":
      return String(currentValue ?? "")
        .toLowerCase()
        .includes(String(condition.value).toLowerCase());
    case "eq":
    default:
      return String(currentValue ?? "") === String(condition.value);
  }
}

export function evaluateRulePayload(payload: RulePayload, context: RuleContext) {
  const conditions = payload.conditions ?? [];

  if (conditions.length === 0) {
    return false;
  }

  const logic = payload.logic ?? "AND";
  const results = conditions.map((condition) => compareCondition(condition, context));

  return logic === "OR" ? results.some(Boolean) : results.every(Boolean);
}

export async function evaluateApplicableRules(input: {
  businessId: string;
  scheduleId?: string | null;
  recipientId?: string | null;
  amount: number;
  recipientType: string;
  department: string | null;
}) {
  const rules = await prisma.rule.findMany({
    where: {
      businessId: input.businessId,
      status: "ACTIVE",
      OR: [
        {
          scheduleId: null
        },
        {
          scheduleId: input.scheduleId ?? undefined
        }
      ]
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const context: RuleContext = {
    amount: input.amount,
    recipientType: input.recipientType,
    department: input.department,
    dayOfWeek: new Date().getDay()
  };

  for (const rule of rules) {
    const payload = (rule.conditionsJson ?? {}) as RulePayload;

    if (evaluateRulePayload(payload, context)) {
      return {
        matched: true,
        rule,
        action: payload.result ?? "WITHHOLD"
      };
    }
  }

  return {
    matched: false,
    rule: null,
    action: null
  };
}
