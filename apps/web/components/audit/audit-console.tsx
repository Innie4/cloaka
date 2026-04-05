"use client";

import { useEffect, useMemo, useState } from "react";
import { authedGet } from "@/lib/auth-client";

type AuditEvent = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: string;
  actorUser: {
    fullName: string;
    email: string;
    role: string;
  } | null;
};

export function AuditConsole() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("Follow every sensitive change from one screen.");

  useEffect(() => {
    authedGet<AuditEvent[]>("/api/audit/live")
      .then((result) => {
        setEvents(result);
        setMessage("Live audit events loaded.");
      })
      .catch((error) => {
        setMessage(error instanceof Error ? error.message : "Unable to load audit events.");
      });
  }, []);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
          return true;
        }

        return (
          event.action.toLowerCase().includes(normalizedQuery) ||
          event.entityType.toLowerCase().includes(normalizedQuery) ||
          (event.actorUser?.fullName.toLowerCase().includes(normalizedQuery) ?? false)
        );
      }),
    [events, query]
  );

  return (
    <div className="space-y-6">
      <section className="surface rounded-[28px] p-5">
        <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">Audit trail</div>
        <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">
          Immutable action history without admin clutter
        </h3>
        <p className="mt-3 text-sm text-[var(--color-ink-soft)]">{message}</p>
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="mt-5 w-full rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Filter by action, entity, or actor" />
      </section>

      <section className="surface rounded-[30px] p-5">
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <article key={event.id} className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-[var(--color-blue)]">
                    {event.entityType}
                  </div>
                  <div className="mt-2 font-semibold">{event.action}</div>
                </div>
                <div className="text-sm text-[var(--color-ink-soft)]">
                  {new Date(event.createdAt).toLocaleString("en-GB", { timeZone: "Africa/Lagos" })}
                </div>
              </div>
              <div className="mt-3 text-sm text-[var(--color-ink-soft)]">
                Actor: {event.actorUser ? `${event.actorUser.fullName} (${event.actorUser.role})` : "System"}
              </div>
              <pre className="mt-3 overflow-x-auto rounded-[18px] bg-[var(--color-cream)] p-4 text-xs text-[var(--color-ink-soft)]">{JSON.stringify(event.metadata, null, 2)}</pre>
            </article>
          ))}
          {!filteredEvents.length ? (
            <div className="rounded-[24px] border border-dashed border-[var(--color-line)] bg-white p-5 text-sm text-[var(--color-ink-soft)]">
              No audit events matched this filter.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
