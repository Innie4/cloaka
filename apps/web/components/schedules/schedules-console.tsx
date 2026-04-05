"use client";

import { useEffect, useState } from "react";
import { authedGet, authedPost } from "@/lib/auth-client";

type RecipientOption = {
  id: string;
  fullName: string;
  type: string;
};

type ScheduleRow = {
  id: string;
  name: string;
  description: string | null;
  type: string;
  runAt: string | null;
  weekday: number | null;
  dayOfMonth: number | null;
  approvalThreshold: string | null;
  recipients: Array<{
    id: string;
    recipientId: string;
    fixedAmount: string | null;
    recipient: {
      fullName: string;
      type: string;
    };
  }>;
};

type RecipientLine = {
  recipientId: string;
  amount: string;
};

const initialRecipientLine: RecipientLine = {
  recipientId: "",
  amount: "150000"
};

export function SchedulesConsole() {
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [recipients, setRecipients] = useState<RecipientOption[]>([]);
  const [name, setName] = useState("Monthly payroll");
  const [description, setDescription] = useState("Core salary run for active staff.");
  const [type, setType] = useState("MONTHLY");
  const [runAt, setRunAt] = useState("09:00");
  const [weekday, setWeekday] = useState("1");
  const [dayOfMonth, setDayOfMonth] = useState("25");
  const [approvalThreshold, setApprovalThreshold] = useState("300000");
  const [recipientLines, setRecipientLines] = useState<RecipientLine[]>([initialRecipientLine]);
  const [message, setMessage] = useState("Build and trigger live schedules from here.");

  async function load() {
    try {
      const [scheduleData, recipientData] = await Promise.all([
        authedGet<ScheduleRow[]>("/api/schedules/live"),
        authedGet<RecipientOption[]>("/api/recipients/live")
      ]);
      setSchedules(scheduleData);
      setRecipients(recipientData);
      setRecipientLines((current) =>
        current.map((line, index) => ({
          ...line,
          recipientId: line.recipientId || recipientData[index]?.id || recipientData[0]?.id || ""
        }))
      );
      setMessage("Live schedules loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load schedules.");
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  function updateLine(index: number, patch: Partial<RecipientLine>) {
    setRecipientLines((current) =>
      current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line))
    );
  }

  async function createSchedule() {
    await authedPost("/api/schedules/live", {
      name,
      description,
      type,
      runAt,
      weekday: type === "WEEKLY" || type === "FORTNIGHTLY" ? Number(weekday) : undefined,
      dayOfMonth: type === "MONTHLY" ? Number(dayOfMonth) : undefined,
      approvalThreshold: approvalThreshold ? Number(approvalThreshold) : undefined,
      recipients: recipientLines
        .filter((line) => line.recipientId && Number(line.amount) > 0)
        .map((line) => ({
          recipientId: line.recipientId,
          amount: Number(line.amount)
        }))
    });
    await load();
    setMessage("Schedule created successfully.");
  }

  async function runNow(id: string) {
    await authedPost(`/api/schedules/${id}/run`, {});
    await load();
    setMessage("Schedule executed.");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="surface rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
            Create schedule
          </div>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
            Recurring runs with clear timing and recipients
          </h3>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">{message}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input value={name} onChange={(event) => setName(event.target.value)} className="sm:col-span-2 rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Schedule name" />
            <input value={description} onChange={(event) => setDescription(event.target.value)} className="sm:col-span-2 rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Description" />
            <select value={type} onChange={(event) => setType(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]">
              <option value="MONTHLY">Monthly</option>
              <option value="WEEKLY">Weekly</option>
              <option value="FORTNIGHTLY">Fortnightly</option>
              <option value="ONE_TIME">One time</option>
            </select>
            <input value={runAt} onChange={(event) => setRunAt(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="09:00" />
            {type === "MONTHLY" ? (
              <input value={dayOfMonth} onChange={(event) => setDayOfMonth(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="25" />
            ) : null}
            {(type === "WEEKLY" || type === "FORTNIGHTLY") ? (
              <select value={weekday} onChange={(event) => setWeekday(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]">
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
              </select>
            ) : null}
            <input value={approvalThreshold} onChange={(event) => setApprovalThreshold(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Approval threshold" />
          </div>
          <div className="mt-5 space-y-3">
            {recipientLines.map((line, index) => (
              <div key={`${index}-${line.recipientId}`} className="grid gap-3 md:grid-cols-[1fr_0.7fr_auto]">
                <select value={line.recipientId} onChange={(event) => updateLine(index, { recipientId: event.target.value })} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]">
                  {recipients.map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.fullName} ({recipient.type})
                    </option>
                  ))}
                </select>
                <input value={line.amount} onChange={(event) => updateLine(index, { amount: event.target.value })} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Amount" />
                <button type="button" onClick={() => setRecipientLines((current) => current.filter((_, lineIndex) => lineIndex !== index))} className="rounded-full border border-[var(--color-line)] px-4 py-3 text-sm font-semibold">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={() => setRecipientLines((current) => [...current, { recipientId: recipients[0]?.id || "", amount: "100000" }])} className="rounded-full border border-[var(--color-line)] px-4 py-3 text-sm font-semibold">
              Add recipient
            </button>
            <button type="button" onClick={() => createSchedule().catch(() => undefined)} className="rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white">
              Save schedule
            </button>
          </div>
        </div>

        <div className="surface rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">
            Why this matters
          </div>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
            Predictable operations, not mysterious automation
          </h3>
          <div className="mt-5 grid gap-3">
            {[
              ["Timing", "Run every schedule in WAT-friendly clock slots."],
              ["Approvals", "Escalate high-value runs before money leaves the wallet."],
              ["Idempotency", "A repeated run in the same slot skips duplicate disbursements."]
            ].map(([label, body]) => (
              <div key={label} className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
                <div className="font-semibold">{label}</div>
                <div className="mt-2 text-sm leading-7 text-[var(--color-ink-soft)]">{body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="surface overflow-hidden rounded-[30px]">
        <div className="border-b border-[var(--color-line)] px-5 py-4 sm:px-6">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl">Live schedules</h3>
        </div>
        <div className="space-y-4 px-5 py-5 sm:px-6">
          {schedules.map((schedule) => (
            <article key={schedule.id} className="rounded-[26px] border border-[var(--color-line)] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-[var(--color-blue)]">
                    {schedule.type}
                  </div>
                  <h4 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
                    {schedule.name}
                  </h4>
                  <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                    {schedule.description || "No description yet."}
                  </p>
                </div>
                <button type="button" onClick={() => runNow(schedule.id).catch(() => undefined)} className="rounded-full border border-[var(--color-line)] px-4 py-2 text-sm font-semibold">
                  Run now
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-[22px] bg-[var(--color-cream)] p-4 text-sm">
                  <div className="font-semibold">Run time</div>
                  <div className="mt-2 text-[var(--color-ink-soft)]">{schedule.runAt || "09:00"}</div>
                </div>
                <div className="rounded-[22px] bg-[var(--color-cream)] p-4 text-sm">
                  <div className="font-semibold">Recipients</div>
                  <div className="mt-2 text-[var(--color-ink-soft)]">{schedule.recipients.length}</div>
                </div>
                <div className="rounded-[22px] bg-[var(--color-cream)] p-4 text-sm">
                  <div className="font-semibold">Threshold</div>
                  <div className="mt-2 text-[var(--color-ink-soft)]">{schedule.approvalThreshold || "None"}</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-[var(--color-ink-soft)]">
                {schedule.recipients.map((recipient) => `${recipient.recipient.fullName} (${recipient.fixedAmount || "0.00"})`).join(", ")}
              </div>
            </article>
          ))}
          {!schedules.length ? (
            <div className="rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-5 text-sm text-[var(--color-ink-soft)]">
              No schedules yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
