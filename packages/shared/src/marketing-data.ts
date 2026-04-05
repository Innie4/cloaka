export type MarketingStat = {
  label: string;
  value: string;
  detail: string;
};

export type PaymentLane = {
  title: string;
  summary: string;
  cue: string;
};

export type ProductCapability = {
  eyebrow: string;
  title: string;
  body: string;
  outcome: string;
};

export type WorkflowStep = {
  step: string;
  title: string;
  body: string;
  meta: string;
};

export type RuleExample = {
  title: string;
  when: string;
  logic: string;
  release: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  cadence: string;
  audience: string;
  recipientLimit: string;
  highlight?: boolean;
  note: string;
  features: string[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type MarketingPageData = {
  badge: string;
  headline: string;
  subheadline: string;
  positioning: string;
  stats: MarketingStat[];
  paymentLanes: PaymentLane[];
  productCapabilities: ProductCapability[];
  workflow: WorkflowStep[];
  rulesExamples: RuleExample[];
  pricingPlans: PricingPlan[];
  trustSignals: {
    title: string;
    body: string;
  }[];
  faq: FaqItem[];
};

export const marketingPageData: MarketingPageData = {
  badge: "Business Payment Operating System for Nigerian SMEs",
  headline:
    "One calm control surface for salaries, vendors, contractors, suppliers, commissions, and logistics payouts.",
  subheadline:
    "Cloaka replaces spreadsheet-driven payment days with a wallet, recipient directory, approval flow, reporting layer, and rules engine that all work together.",
  positioning:
    "Serious enough for payroll, simple enough for a Lagos SME owner checking tomorrow's disbursements on a phone.",
  stats: [
    {
      label: "Completion target",
      value: "< 5 min",
      detail: "The PRD standard for core actions such as adding recipients, funding, and reviewing payouts."
    },
    {
      label: "Scale range",
      value: "5 to 500",
      detail: "The product vision is designed to grow from a tiny team into a multi-admin operating rhythm."
    },
    {
      label: "Core moat",
      value: "Rules engine",
      detail: "Conditional disbursement logic is the differentiator that moves Cloaka beyond payroll-only tools."
    }
  ],
  paymentLanes: [
    {
      title: "Salaries",
      summary: "Monthly staff runs with approval thresholds, wallet alerts, and recipient verification.",
      cue: "Payroll day becomes a controlled release instead of a scramble."
    },
    {
      title: "Vendor invoices",
      summary: "Queue supplier settlements with references, notes, receipts, and approval context.",
      cue: "Keep invoices moving without losing the audit trail."
    },
    {
      title: "Contractor fees",
      summary: "Support variable amounts, weekly cycles, and exception handling for field teams.",
      cue: "Built for mixed workforce businesses, not just salaried teams."
    },
    {
      title: "Supplier payments",
      summary: "Track repeat suppliers, payout history, and payment routines in one place.",
      cue: "No more hunting through bank statements to remember who was paid."
    },
    {
      title: "Logistics costs",
      summary: "Release dispatch, rider, and ops-related disbursements with cleaner timing and visibility.",
      cue: "Useful for route-heavy and operations-led SMEs."
    },
    {
      title: "Commissions",
      summary: "Prepare commission batches with conditions, approvals, and reporting baked in.",
      cue: "Performance-linked payouts stay explainable."
    }
  ],
  productCapabilities: [
    {
      eyebrow: "Onboarding",
      title: "Guided setup that saves progress",
      body: "Registration, verification, business setup, and the first payment workflow are designed as a guided sequence instead of a wall of settings.",
      outcome: "A founder should understand what to do next at every stage."
    },
    {
      eyebrow: "Recipients",
      title: "One directory for everyone you pay",
      body: "Employees, vendors, contractors, and tagged payment groups live in one verified recipient layer with room for CSV import and status checks.",
      outcome: "Businesses stop rebuilding recipient lists every month."
    },
    {
      eyebrow: "Wallet",
      title: "Funding clarity before payment day",
      body: "A visible balance, held amount, threshold warnings, and virtual account funding details keep liquidity obvious before runs begin.",
      outcome: "Payment failures are prevented upstream instead of discovered too late."
    },
    {
      eyebrow: "Schedules",
      title: "Recurring payouts that stay understandable",
      body: "Create one-time, weekly, fortnightly, monthly, and event-based schedules without making the operator think like an engineer.",
      outcome: "Routine disbursements move from memory into the system."
    },
    {
      eyebrow: "Approvals",
      title: "Clean multi-step review for higher-risk payouts",
      body: "High-value disbursements can be routed for approval with context, comments, and a clear decision trail.",
      outcome: "Risky transfers are visible without slowing every small payment."
    },
    {
      eyebrow: "Rules",
      title: "Conditional payment release logic",
      body: "The rules engine supports event-triggered and threshold-based payout logic such as attendance checks, invoice readiness, or task completion.",
      outcome: "Cloaka becomes an operating system, not just a transfer screen."
    },
    {
      eyebrow: "Reporting",
      title: "Receipts, exports, and trend visibility",
      body: "Operators can inspect recent payments, export packs, and keep a monthly trail for finance, audit, and reconciliation.",
      outcome: "The business can answer who was paid, when, and why."
    },
    {
      eyebrow: "Trust",
      title: "Compliance and partner clarity in plain language",
      body: "KYB, audit logs, data handling, incident readiness, and partner-rail disclosure are treated as part of the product, not a legal afterthought.",
      outcome: "Customers understand the safety model before they move funds."
    }
  ],
  workflow: [
    {
      step: "01",
      title: "Register and set up the business",
      body: "Capture owner identity, business context, and the first operating defaults with saved-progress onboarding.",
      meta: "Email verification and guided setup anchor the first run."
    },
    {
      step: "02",
      title: "Add and verify recipients",
      body: "Create recipient records for staff, vendors, and contractors, then group them into the payment rhythm the business actually uses.",
      meta: "Recipient management is a core v1 feature, including CSV import."
    },
    {
      step: "03",
      title: "Fund the wallet",
      body: "Top up via dedicated account rails, confirm available balance, and see whether upcoming schedules are fully covered.",
      meta: "Balance display and ledger visibility are part of the trust story."
    },
    {
      step: "04",
      title: "Create schedules, approvals, and rules",
      body: "Define payment timing, approval thresholds, and conditional release logic without forcing operators into spreadsheet gymnastics.",
      meta: "This is where Cloaka stops looking like a basic payroll tool."
    },
    {
      step: "05",
      title: "Run, review, and report",
      body: "Execute disbursements, inspect receipts, handle failures cleanly, and keep an immutable audit trail for the business.",
      meta: "Reporting, retry handling, and audit visibility complete the loop."
    }
  ],
  rulesExamples: [
    {
      title: "Warehouse attendance release",
      when: "When the salary batch is due",
      logic: "Only release full payment if attendance is at least 20 days this month.",
      release: "Otherwise send the payment into review instead of auto-disbursing."
    },
    {
      title: "Vendor approval gate",
      when: "When a supplier invoice enters the pay window",
      logic: "Only pay after the invoice is approved and the amount stays within the configured threshold.",
      release: "Large invoices route to an approver with the context attached."
    },
    {
      title: "Task Marketplace trigger",
      when: "When an external task event is completed",
      logic: "Release the linked contractor payout only after the completion signal lands and the wallet is funded.",
      release: "The rules engine turns external work completion into a controlled payment event."
    }
  ],
  pricingPlans: [
    {
      name: "Starter",
      price: "Free",
      cadence: "forever",
      audience: "For tiny teams proving the workflow",
      recipientLimit: "Up to 5 recipients",
      note: "The PRD treats Starter as permanently free.",
      features: [
        "One owner workspace",
        "Recipient directory for up to 5 people or businesses",
        "Wallet balance, ledger, receipts, and payment references",
        "One-time and recurring disbursement setup",
        "Public trust and operational guidance"
      ]
    },
    {
      name: "Growth",
      price: "NGN 15,000",
      cadence: "per month",
      audience: "For growing SMEs formalising payments",
      recipientLimit: "Up to 50 recipients",
      highlight: true,
      note: "Paid tiers move into KYB-enabled operating mode.",
      features: [
        "Everything in Starter",
        "KYB workflow for the business",
        "CSV recipient import",
        "Approval workflows for higher-value payouts",
        "Email, SMS, and in-app alerts",
        "Reporting exports and money-back guarantee language"
      ]
    },
    {
      name: "Scale",
      price: "NGN 35,000",
      cadence: "per month",
      audience: "For operations-heavy teams with multiple operators",
      recipientLimit: "Up to 200 recipients",
      note: "This is where Cloaka's moat becomes operationally valuable.",
      features: [
        "Everything in Growth",
        "Multi-admin team access",
        "Rules engine and event-triggered disbursements",
        "Expanded approval and audit workflows",
        "Role-based operational controls",
        "Task Marketplace-linked payout flows"
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      cadence: "pricing",
      audience: "For bespoke risk, reporting, and migration needs",
      recipientLimit: "Custom limits",
      note: "Commercial terms are custom rather than self-serve.",
      features: [
        "Tailored recipient and schedule volume",
        "Custom approval architecture",
        "Dedicated implementation support",
        "Bespoke reporting and governance needs",
        "Partner and compliance planning with the Cloaka team"
      ]
    }
  ],
  trustSignals: [
    {
      title: "Partner-led money movement",
      body: "Cloaka is positioned as the orchestration and automation layer while licensed partners hold and move funds."
    },
    {
      title: "Auditability by default",
      body: "Receipts, references, logs, and visible failure states are core operating features, not premium add-ons."
    },
    {
      title: "KYB and NDPR-aware operations",
      body: "Paid tiers are expected to move through business verification and privacy-aware handling before deeper features unlock."
    },
    {
      title: "Guarantee language with accountability",
      body: "The v1 business model includes a three-month money-back guarantee when Cloaka causes a failure."
    }
  ],
  faq: [
    {
      question: "Is Cloaka only for payroll?",
      answer:
        "No. The PRD positions Cloaka as a business payment operating system covering salaries, vendor invoices, contractor fees, logistics costs, supplier payments, and commissions."
    },
    {
      question: "What makes Cloaka different from existing SME payroll tools?",
      answer:
        "The Payment Rules Engine is the differentiator. It brings conditional release logic and event-driven disbursement control into an SME-friendly workflow."
    },
    {
      question: "Does Cloaka hold customer funds?",
      answer:
        "The trust model is partner-led. Cloaka is described as the orchestration layer while licensed partners handle custody and rails."
    },
    {
      question: "Can a small business operate this without finance specialists?",
      answer:
        "That is a non-negotiable product principle in the PRD. Core actions are expected to be understandable and completable by non-technical operators."
    }
  ]
};

export function getMarketingPageData() {
  return marketingPageData;
}
