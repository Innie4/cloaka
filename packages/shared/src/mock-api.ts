import {
  approvalCards,
  dashboardMetrics,
  navGroups,
  paymentRows,
  recipientCards,
  reportCards,
  ruleCards,
  scheduleCards
} from "./app-data";

export type BalanceSnapshot = {
  available: string;
  held: string;
  lowBalanceThreshold: string;
};

export type TrustHighlight = {
  title: string;
  body: string;
};

export type TeamRoleCard = {
  title: string;
  body: string;
  meta: string;
};

export type AuditEvent = {
  timestamp: string;
  actor: string;
  action: string;
  object: string;
  ipAddress: string;
};

export type SettingsCard = {
  title: string;
  body: string;
  meta: string;
};

export type DashboardOverview = {
  metrics: typeof dashboardMetrics;
  balance: BalanceSnapshot;
  schedules: typeof scheduleCards;
  approvals: typeof approvalCards;
  rules: typeof ruleCards;
  payments: typeof paymentRows;
  nav: typeof navGroups;
};

export const trustHighlights: TrustHighlight[] = [
  {
    title: "Partner bank model",
    body: "Cloaka is framed as the routing and automation layer while licensed partners hold and move funds."
  },
  {
    title: "Security posture",
    body: "Encryption, audit logging, verification, and third-party security review are treated as first-order launch requirements."
  },
  {
    title: "Operational transparency",
    body: "Businesses and recipients should always have references, receipts, and visible failure states when something goes wrong."
  },
  {
    title: "Compliance direction",
    body: "KYB, NDPR-aware handling, and partner-led rails are part of the baseline operating model."
  }
];

export const teamRoleCards: TeamRoleCard[] = [
  {
    title: "Owner",
    body: "Full control over payments, billing, approvals, alerts, and access management.",
    meta: "1 active owner"
  },
  {
    title: "Admin",
    body: "Can operate payment workflows without billing authority.",
    meta: "3 invited admins"
  },
  {
    title: "Viewer",
    body: "Read-only access for finance, audit, and reporting collaborators.",
    meta: "2 viewers configured"
  }
];

export const auditEvents: AuditEvent[] = [
  {
    timestamp: "2026-04-04T09:12:00+01:00",
    actor: "ngozi@lumalogistics.co",
    action: "Approved disbursement",
    object: "Vendor payout: Luma Logistics",
    ipAddress: "102.89.34.11"
  },
  {
    timestamp: "2026-04-04T08:58:00+01:00",
    actor: "adaeze@lumalogistics.co",
    action: "Updated payment rule",
    object: "Escalate payouts above NGN 300k",
    ipAddress: "197.210.44.8"
  },
  {
    timestamp: "2026-04-03T17:40:00+01:00",
    actor: "finance@lumalogistics.co",
    action: "Imported recipients CSV",
    object: "Contractor batch import",
    ipAddress: "41.190.2.145"
  }
];

export const settingsCards: SettingsCard[] = [
  {
    title: "Balance alerts",
    body: "The wallet should warn before a scheduled run leaves the business short on salary day.",
    meta: "Default threshold: NGN 50k or next payroll + 20%"
  },
  {
    title: "Trust copy",
    body: "Settings should surface editable operational messaging around guarantees, partner rails, and recipient communication.",
    meta: "Synced with trust page direction"
  },
  {
    title: "Business profile",
    body: "Business identity, KYB state, and notification preferences should live in one calm configuration surface.",
    meta: "KYB pending in the mock workspace"
  }
];

export function getDashboardOverview(): DashboardOverview {
  return {
    metrics: dashboardMetrics,
    balance: {
      available: "NGN 12,480,000",
      held: "NGN 1,080,000",
      lowBalanceThreshold: "NGN 2,500,000"
    },
    schedules: scheduleCards,
    approvals: approvalCards,
    rules: ruleCards,
    payments: paymentRows,
    nav: navGroups
  };
}

export function getPayments() {
  return paymentRows;
}

export function getSchedules() {
  return scheduleCards;
}

export function getRules() {
  return ruleCards;
}

export function getApprovals() {
  return approvalCards;
}

export function getRecipients() {
  return recipientCards;
}

export function getReports() {
  return reportCards;
}

export function getTeamRoles() {
  return teamRoleCards;
}

export function getAuditEvents() {
  return auditEvents;
}

export function getSettingsCards() {
  return settingsCards;
}

export function getTrustHighlights() {
  return trustHighlights;
}
