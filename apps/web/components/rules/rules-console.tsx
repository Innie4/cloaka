"use client";

import { useEffect, useState } from "react";
import { authedGet, authedPost } from "@/lib/auth-client";

type RuleCondition = {
  field: "amount" | "recipientType" | "department" | "dayOfWeek";
  operator: "gt" | "gte" | "lt" | "eq" | "contains";
  value: string;
};

type RuleRow = {
  id: string;
  name: string;
  description: string;
  type: string;
  status: string;
  conditionsJson: {
    logic?: "AND" | "OR";
    result?: "WITHHOLD" | "REQUIRE_APPROVAL";
    conditions?: RuleCondition[];
  };
};

type ScheduleOption = {
  id: string;
  name: string;
};

const initialCondition: RuleCondition = {
  field: "amount",
  operator: "gte",
  value: "300000"
};

export function RulesConsole() {
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [schedules, setSchedules] = useState<ScheduleOption[]>([]);
  const [name, setName] = useState("High-value payouts");
  const [description, setDescription] = useState("Route large disbursements through a second approver.");
  const [type, setType] = useState("THRESHOLD");
  const [scheduleId, setScheduleId] = useState("");
  const [logic, setLogic] = useState<"AND" | "OR">("AND");
  const [result, setResult] = useState<"WITHHOLD" | "REQUIRE_APPROVAL">("REQUIRE_APPROVAL");
  const [conditions, setConditions] = useState<RuleCondition[]>([initialCondition]);
  const [testAmount, setTestAmount] = useState("450000");
  const [testRecipientType, setTestRecipientType] = useState("VENDOR");
  const [testDepartment, setTestDepartment] = useState("Finance");
  const [message, setMessage] = useState("Build plain-language rules and test them instantly.");

  async function load() {
    try {
      const [ruleData, scheduleData] = await Promise.all([
        authedGet<RuleRow[]>("/api/rules/live"),
        authedGet<Array<{ id: string; name: string }>>("/api/schedules/live")
      ]);
      setRules(ruleData);
      setSchedules(scheduleData);
      setScheduleId((current) => current || scheduleData[0]?.id || "");
      setMessage("Live rules loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load rules.");
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  function updateCondition(index: number, patch: Partial<RuleCondition>) {
    setConditions((current) =>
      current.map((condition, conditionIndex) =>
        conditionIndex === index ? { ...condition, ...patch } : condition
      )
    );
  }

  async function saveRule() {
    await authedPost("/api/rules/live", {
      name,
      description,
      type,
      scheduleId: scheduleId || undefined,
      logic,
      result,
      conditions: conditions.map((condition) => ({
        ...condition,
        value:
          condition.field === "amount" || condition.field === "dayOfWeek"
            ? Number(condition.value)
            : condition.value
      }))
    });
    await load();
    setMessage("Rule saved.");
  }

  async function testRule(id: string) {
    const response = await authedPost<{ matched: boolean }>(`/api/rules/${id}/test`, {
      amount: Number(testAmount),
      recipientType: testRecipientType,
      department: testDepartment
    });
    setMessage(
      response.matched
        ? "This sample payload matches the selected rule."
        : "This sample payload does not match the selected rule."
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
            Rules builder
          </div>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
            Conditions that read like finance policy
          </h3>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">{message}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input value={name} onChange={(event) => setName(event.target.value)} className="sm:col-span-2 rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Rule name" />
            <input value={description} onChange={(event) => setDescription(event.target.value)} className="sm:col-span-2 rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Description" />
            <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]">
              <option value="THRESHOLD">Threshold</option>
              <option value="APPROVAL">Approval</option>
              <option value="MULTI_CONDITION">Multi-condition</option>
              <option value="DATE_WINDOW">Date window</option>
            </select>
            <select value={scheduleId} onChange={(event) => setScheduleId(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]">
              <option value="">All schedules</option>
              {schedules.map((schedule) => (
                <option key={schedule.id} value={schedule.id}>
                  {schedule.name}
                </option>
              ))}
            </select>
            <select value={logic} onChange={(event) => setLogic(event.target.value as "AND" | "OR")} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]">
              <option value="AND">AND</option>
              <option value="OR">OR</option>
            </select>
            <select value={result} onChange={(event) => setResult(event.target.value as "WITHHOLD" | "REQUIRE_APPROVAL")} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]">
              <option value="REQUIRE_APPROVAL">Require approval</option>
              <option value="WITHHOLD">Withhold</option>
            </select>
          </div>
          <div className="mt-5 space-y-3">
            {conditions.map((condition, index) => (
              <div key={`${index}-${condition.field}`} className="grid gap-3 md:grid-cols-[0.8fr_0.8fr_1fr_auto]">
                <select value={condition.field} onChange={(event) => updateCondition(index, { field: event.target.value as RuleCondition["field"] })} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]">
                  <option value="amount">Amount</option>
                  <option value="recipientType">Recipient type</option>
                  <option value="department">Department</option>
                  <option value="dayOfWeek">Day of week</option>
                </select>
                <select value={condition.operator} onChange={(event) => updateCondition(index, { operator: event.target.value as RuleCondition["operator"] })} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]">
                  <option value="gt">Greater than</option>
                  <option value="gte">Greater than or equal</option>
                  <option value="lt">Less than</option>
                  <option value="eq">Equals</option>
                  <option value="contains">Contains</option>
                </select>
                <input value={condition.value} onChange={(event) => updateCondition(index, { value: event.target.value })} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Value" />
                <button type="button" onClick={() => setConditions((current) => current.filter((_, conditionIndex) => conditionIndex !== index))} className="rounded-full border border-[var(--color-line)] px-4 py-3 text-sm font-semibold">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => setConditions((current) => [...current, initialCondition])} className="rounded-full border border-[var(--color-line)] px-4 py-3 text-sm font-semibold">
              Add condition
            </button>
            <button type="button" onClick={() => saveRule().catch(() => undefined)} className="rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white">
              Save rule
            </button>
          </div>
        </div>

        <div className="surface rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
            Rule tester
          </div>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
            Validate before payroll day
          </h3>
          <div className="mt-5 grid gap-3">
            <input value={testAmount} onChange={(event) => setTestAmount(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Amount" />
            <input value={testRecipientType} onChange={(event) => setTestRecipientType(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Recipient type" />
            <input value={testDepartment} onChange={(event) => setTestDepartment(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Department" />
          </div>
          <div className="mt-5 rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-4 text-sm leading-7 text-[var(--color-ink-soft)]">
            Select any saved rule below to test it against this sample payload.
          </div>
        </div>
      </section>

      <section className="surface rounded-[30px] p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">Saved rules</div>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {rules.map((rule) => (
            <article key={rule.id} className="rounded-[26px] border border-[var(--color-line)] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-[var(--color-blue)]">
                    {rule.type}
                  </div>
                  <h4 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
                    {rule.name}
                  </h4>
                </div>
                <button type="button" onClick={() => testRule(rule.id).catch(() => undefined)} className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold">
                  Test rule
                </button>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--color-ink-soft)]">{rule.description}</p>
              <div className="mt-4 rounded-[22px] bg-[var(--color-cream)] p-4 text-sm">
                {(rule.conditionsJson.conditions || []).map((condition, index) => (
                  <div key={`${rule.id}-${index}`}>
                    {condition.field} {condition.operator} {String(condition.value)}
                  </div>
                ))}
                <div className="mt-2 font-semibold">
                  {rule.conditionsJson.logic || "AND"} -&gt; {rule.conditionsJson.result || "WITHHOLD"}
                </div>
              </div>
            </article>
          ))}
          {!rules.length ? (
            <div className="rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-5 text-sm text-[var(--color-ink-soft)]">
              No rules yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
