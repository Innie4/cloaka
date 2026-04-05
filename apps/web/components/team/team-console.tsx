"use client";

import { useEffect, useState } from "react";
import { authedGet, authedPatch, authedPost } from "@/lib/auth-client";

type TeamPayload = {
  summary: {
    total: number;
    owners: number;
    admins: number;
    viewers: number;
  };
  members: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    twoFactorEnabled: boolean;
    createdAt: string;
  }>;
};

export function TeamConsole() {
  const [data, setData] = useState<TeamPayload | null>(null);
  const [fullName, setFullName] = useState("Finance Admin");
  const [email, setEmail] = useState("finance-admin@cloaka.dev");
  const [phone, setPhone] = useState("08030000000");
  const [role, setRole] = useState("ADMIN");
  const [password, setPassword] = useState("TempPass123!");
  const [message, setMessage] = useState("Add admins and viewers without leaving the workspace.");

  async function load() {
    try {
      const teamData = await authedGet<TeamPayload>("/api/team/live");
      setData(teamData);
      setMessage("Live team members loaded.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load the team.");
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function addMember() {
    await authedPost("/api/team/live", {
      fullName,
      email,
      phone,
      role,
      password
    });
    await load();
    setMessage("Team member added.");
  }

  async function updateRole(id: string, nextRole: string) {
    await authedPatch(`/api/team/live/${id}/role`, {
      role: nextRole
    });
    await load();
    setMessage("Role updated.");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="surface rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">Access</div>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">Clear roles for real operators</h3>
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">{message}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {data
              ? [
                  ["Total", String(data.summary.total)],
                  ["Owners", String(data.summary.owners)],
                  ["Admins", String(data.summary.admins)],
                  ["Viewers", String(data.summary.viewers)]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[24px] border border-[var(--color-line)] bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">{label}</div>
                    <div className="mt-2 text-3xl font-semibold">{value}</div>
                  </div>
                ))
              : null}
          </div>
        </div>

        <div className="surface rounded-[28px] p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-[var(--color-blue)]">Add member</div>
          <h3 className="mt-2 font-[family-name:var(--font-heading)] text-2xl">Invite with a working login</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="sm:col-span-2 rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Full name" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Email" />
            <input value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Phone" />
            <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]">
              <option value="ADMIN">Admin</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <input value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-2xl border border-[var(--color-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-blue)]" placeholder="Temporary password" />
          </div>
          <button type="button" onClick={() => addMember().catch(() => undefined)} className="mt-5 rounded-full bg-[var(--color-sidebar)] px-5 py-3 text-sm font-semibold text-white">
            Add team member
          </button>
        </div>
      </section>

      <section className="surface overflow-hidden rounded-[30px]">
        <div className="border-b border-[var(--color-line)] px-5 py-4 sm:px-6">
          <h3 className="font-[family-name:var(--font-heading)] text-2xl">Workspace members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
              <tr>
                <th className="px-5 py-4 sm:px-6">Member</th>
                <th className="px-5 py-4">Role</th>
                <th className="px-5 py-4">2FA</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.members.map((member) => (
                <tr key={member.id}>
                  <td className="border-t border-[var(--color-line)] px-5 py-4 sm:px-6">
                    <div className="font-semibold">{member.fullName}</div>
                    <div className="text-xs text-[var(--color-ink-soft)]">{member.email}</div>
                  </td>
                  <td className="border-t border-[var(--color-line)] px-5 py-4">{member.role}</td>
                  <td className="border-t border-[var(--color-line)] px-5 py-4">
                    {member.twoFactorEnabled ? "Enabled" : "Disabled"}
                  </td>
                  <td className="border-t border-[var(--color-line)] px-5 py-4">
                    <select value={member.role} onChange={(event) => updateRole(member.id, event.target.value).catch(() => undefined)} className="rounded-2xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-blue)]">
                      <option value="OWNER">Owner</option>
                      <option value="ADMIN">Admin</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
