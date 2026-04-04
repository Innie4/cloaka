export type NavItem = {
  href: string;
  label: string;
  description: string;
  badge?: string;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export type Metric = {
  label: string;
  value: string;
  change: string;
  tone: "neutral" | "positive" | "warning";
};

export type PaymentRow = {
  recipient: string;
  type: string;
  amount: string;
  status: "Paid" | "Scheduled" | "Withheld" | "Needs approval";
  date: string;
};

export type HighlightCard = {
  title: string;
  eyebrow: string;
  body: string;
  meta: string;
};

export const navGroups: NavGroup[] = [
  {
    label: "Core",
    items: [
      {
        href: "/",
        label: "Overview",
        description: "Balance, schedules, and payment health"
      },
      {
        href: "/wallet",
        label: "Wallet",
        description: "Available funds, held balance, and ledger"
      },
      {
        href: "/payments",
        label: "Payments",
        description: "All outgoing transfers and receipts"
      },
      {
        href: "/schedules",
        label: "Schedules",
        description: "Recurring payroll and vendor runs"
      }
    ]
  },
  {
    label: "Automation",
    items: [
      {
        href: "/rules",
        label: "Rules",
        description: "Plain-language payment conditions",
        badge: "Core moat"
      },
      {
        href: "/approvals",
        label: "Approvals",
        description: "Secondary review for high-value runs"
      },
      {
        href: "/recipients",
        label: "Recipients",
        description: "Employees, vendors, contractors, and tags"
      }
    ]
  },
  {
    label: "Operations",
    items: [
      {
        href: "/team",
        label: "Team",
        description: "Owners, admins, and viewers"
      },
      {
        href: "/audit",
        label: "Audit",
        description: "Immutable activity log"
      },
      {
        href: "/reports",
        label: "Reports",
        description: "Spend summaries and exports"
      },
      {
        href: "/settings",
        label: "Settings",
        description: "Trust, alerts, and configuration"
      }
    ]
  }
];

export const dashboardMetrics: Metric[] = [
  {
    label: "Available balance",
    value: "NGN 12.48m",
    change: "+18% vs last month",
    tone: "positive"
  },
  {
    label: "Scheduled this week",
    value: "NGN 4.22m",
    change: "3 payroll and vendor runs queued",
    tone: "neutral"
  },
  {
    label: "Awaiting approval",
    value: "NGN 980k",
    change: "2 disbursements need a second sign-off",
    tone: "warning"
  },
  {
    label: "Success rate",
    value: "99.2%",
    change: "Last 90 days across all payment types",
    tone: "positive"
  }
];

export const paymentRows: PaymentRow[] = [
  {
    recipient: "May payroll batch",
    type: "Salary",
    amount: "NGN 2.10m",
    status: "Scheduled",
    date: "25 Apr, 09:00 WAT"
  },
  {
    recipient: "Luma Logistics",
    type: "Vendor",
    amount: "NGN 420k",
    status: "Needs approval",
    date: "08 Apr, 13:10 WAT"
  },
  {
    recipient: "Rider contractor pool",
    type: "Contractor",
    amount: "NGN 680k",
    status: "Withheld",
    date: "07 Apr, 18:00 WAT"
  },
  {
    recipient: "Adaobi Nwosu",
    type: "Salary",
    amount: "NGN 165k",
    status: "Paid",
    date: "31 Mar, 16:42 WAT"
  },
  {
    recipient: "Kayode Office Supplies",
    type: "Supplier",
    amount: "NGN 96k",
    status: "Paid",
    date: "30 Mar, 11:12 WAT"
  }
];

export const scheduleCards: HighlightCard[] = [
  {
    eyebrow: "Monthly payroll",
    title: "Staff salary run",
    body: "24 employees, fixed salary amounts, auto-check balance 24 hours before release.",
    meta: "Next run: 25 Apr at 09:00 WAT"
  },
  {
    eyebrow: "Weekly contractors",
    title: "Rider payout cycle",
    body: "Variable amount schedule with rule-based trip completion checks from Resconate.",
    meta: "Every Friday at 18:00 WAT"
  },
  {
    eyebrow: "Vendor routine",
    title: "Logistics vendor settlement",
    body: "Approval required above NGN 300k with a second approver from Finance.",
    meta: "Every Tuesday at 13:00 WAT"
  }
];

export const approvalCards: HighlightCard[] = [
  {
    eyebrow: "Needs review",
    title: "Luma Logistics invoice",
    body: "Invoice matched to April route schedule. Wallet is funded and recipient details are verified.",
    meta: "Amount: NGN 420k"
  },
  {
    eyebrow: "Escalated",
    title: "Contractor bonus release",
    body: "Triggered by rule override after a withheld payment. Reason must be recorded before release.",
    meta: "Amount: NGN 560k"
  }
];

export const ruleCards: HighlightCard[] = [
  {
    eyebrow: "Attendance rule",
    title: "Only pay warehouse staff with 20+ days present",
    body: "If attendance days are at least 20 this month, release full salary. Otherwise send to review.",
    meta: "Status: Active"
  },
  {
    eyebrow: "Approval rule",
    title: "Only settle vendors after invoice approval",
    body: "If invoice state is Approved and invoice date is within the active pay window, release transfer.",
    meta: "Status: Active"
  },
  {
    eyebrow: "Threshold rule",
    title: "Escalate payouts above NGN 300k",
    body: "If scheduled amount exceeds threshold, route to Finance approver before any disbursement starts.",
    meta: "Status: Draft"
  }
];

export const recipientCards: HighlightCard[] = [
  {
    eyebrow: "Employees",
    title: "24 active salary recipients",
    body: "Grouped by department with verified account names and saved notes for payroll context.",
    meta: "Last import: 02 Apr"
  },
  {
    eyebrow: "Vendors",
    title: "12 tagged vendor recipients",
    body: "Filter by category, location, and payment routine. Reverification required on account change.",
    meta: "2 need updated bank details"
  },
  {
    eyebrow: "Contractors",
    title: "36 variable payout recipients",
    body: "Optimized for weekly disbursement runs and linked to task-completion rules.",
    meta: "8 linked to Resconate"
  }
];

export const reportCards: HighlightCard[] = [
  {
    eyebrow: "Spend overview",
    title: "Disbursement mix is trending toward salaries",
    body: "Salaries remain the largest slice, followed by contractor payouts and supplier invoices.",
    meta: "Updated live"
  },
  {
    eyebrow: "Export ready",
    title: "Audit-friendly monthly pack",
    body: "CSV and PDF export surfaces should be one tap away for accountants and finance leads.",
    meta: "April pack closes in 26 days"
  }
];
