# Cloaka PRD Overview

This file is a build-oriented summary of the supplied PRD from `C:\Users\Itoro\Downloads\Cloaka_PRD_v1.0.docx`.

The `.docx` remains the fuller source document. This overview exists so product, design, and engineering can move quickly inside the repo without reopening the original file every time.

## Product Definition

Cloaka is a business payment operating system for Nigerian SMEs. It is not a payroll-only product. The core promise is that a business can manage every outgoing payment from one place:

- Salaries
- Vendor invoices
- Contractor fees
- Supplier payments
- Logistics costs
- Commissions

The product differentiator is the `Payment Rules Engine`, which allows conditional disbursement logic for different payment types.

## Core Users

- Overwhelmed SME owners who currently spend hours on manual transfers
- HR or finance managers who need approvals and auditability
- Scaling founders with mixed employee and contractor payment flows

## Version 1 Scope

The PRD places these capabilities in scope for `v1.0`:

- Guided onboarding and account setup
- KYB for paid tiers
- Recipient management, including CSV import
- Wallet funding through dedicated virtual accounts
- Balance display and ledger
- One-time and recurring payment schedules
- Event-triggered payments via the rules engine
- Approval workflows for higher tiers
- Multi-admin access with role-based permissions
- Bulk disbursement execution and retry handling
- PDF receipts
- Immutable audit logs
- Email, SMS, and in-app notifications
- Reporting and analytics
- Public trust page
- Mobile-responsive web application

## Out of Scope

The PRD explicitly excludes these items from `v1.0`:

- Native mobile apps
- Tax remittance
- Full HR suite features
- Invoicing and inbound payments
- Multi-currency support
- Crypto payments
- Direct CBN licensing in v1

## Business Model

The pricing model in the PRD is:

- `Starter`: free, up to 5 recipients
- `Growth`: `NGN 15,000/month`, up to 50 recipients
- `Scale`: `NGN 35,000/month`, up to 200 recipients
- `Enterprise`: custom pricing

Important commercial rules:

- Starter is permanently free
- No extra NGN domestic per-transaction fee in v1
- Upgrades are instant and self-serve
- Paid plans carry a 3-month money-back guarantee when Cloaka causes a failure

## Product-Critical UX Flows

These flows are central to the product story and should shape the first build:

1. Registration, verification, and onboarding in five saved-progress steps
2. Adding and verifying recipients with NUBAN lookup
3. Funding the business account through a partner-bank virtual account
4. Creating and pausing payment schedules
5. Reviewing, approving, and executing disbursements
6. Building plain-language rules for conditional payments
7. Reviewing payment history, receipts, and audit logs

## Non-Negotiable Product Principles

- The product must be usable by a non-technical Nigerian SME owner without training.
- All key actions should be completable in under five minutes.
- All amounts should be shown in NGN with Nigerian formatting.
- All scheduling and logging should run in `WAT (UTC+1)`.
- The interface must remain fully usable at `375px` width and above.

## Trust and Compliance Requirements

The PRD treats trust as a first-class product requirement.

We need:

- A public trust page before launch
- Clear partner-bank and payment-partner disclosure
- Published security-audit summary before launch
- NDPR-aware data handling
- KYB for Growth and above
- Audit logs for every critical action
- Explicit language that Cloaka is not a fund custodian

## Engineering-Relevant Constraints

- Payment execution must be asynchronous and idempotent
- Financial writes must be transactional
- Every financial record needs an immutable reference
- Duplicate payments must be prevented under concurrency
- Failed payments must never disappear silently
- Reconciliation must be automated
- Dashboard downtime must not stop payment processing

## Design Consequences

The product needs a UI that balances two things:

- Trust and seriousness for money movement
- Low intimidation for operators who are not finance specialists

That leads directly to the design direction documented in [design-reference-board.md](/C:/Users/Itoro/Documents/Cloaka/docs/design-reference-board.md).

## Suggested Build Order

If we start implementation from this repo, the most sensible order is:

1. Design system and layout shell
2. Authentication and onboarding
3. Recipient management
4. Wallet and ledger
5. Payment schedules
6. Approval flows
7. Rules engine
8. Reports, audit, trust, and polish
