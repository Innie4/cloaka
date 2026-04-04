# Cloaka Design Reference Board

This document turns the supplied design research into a workspace-ready source of truth we can design and build from.

Important note: the original handoff text mentions `22 references`, but the current research file contains `28 external references` across four source sections, plus one synthesis section. This doc preserves the actual set found in the HTML so we do not lose references during implementation.

## Design Verdict

Dark navy sidebar + light content area, Stripe-grade transaction tables, Mercury-style balance display, Gusto-warm onboarding, Ramp-clean approvals, and a Notion-calm rules builder.

The product should feel serious enough to trust with payroll and simple enough for a Lagos SME owner to understand on a phone.

## Section 01: Direct Competitors

These are the products Cloaka users already know or will compare us to.

- [Remita](https://www.tryremita.com)  
  Government-grade bulk payment platform. The interface is dated, but the trust signals and institutional language are strong.
- [Bento Africa](https://www.trybento.co)  
  The closest UI competitor. Clean and simple, but shallow on visible automation depth.
- [Workpay](https://www.getworkpay.com)  
  Feature-rich and compliance-aware, though visually dense and enterprise-heavy.
- [SeamlessHR](https://www.seamlesshr.com)  
  Strong Nigerian enterprise brand. Useful reference for navigation grouping and information hierarchy.
- [Gusto](https://gusto.com)  
  Warm and approachable. Best reference for onboarding that does not intimidate first-time operators.
- [Deel](https://www.deel.com)  
  High-confidence dark UI and strong contractor-payment flow. Excellent model for trust and compliance framing.

## Section 02: Adjacent Products To Steal From

These products solve UX problems Cloaka also needs to solve.

- [Stripe Dashboard](https://stripe.com/dashboard)  
  The best reference for transaction tables, status pills, timestamps, density, and scan speed.
- [Linear](https://linear.app)  
  The benchmark for readable dense dark UI, especially sidebars, compact lists, and keyboard-friendly structure.
- [Mercury Bank](https://mercury.com)  
  Best reference for balance display, whitespace, and making money feel calm rather than stressful.
- [Ramp](https://www.ramp.com)  
  Strong model for approval flows, spend controls, and sharp but uncluttered decision UI.
- [Brex](https://www.brex.com)  
  Useful for high-contrast action cards and urgent approval affordances.
- [Notion](https://www.notion.so)  
  The reference for calm complexity: empty states, no-chrome navigation, and approachable builder interactions.

## Section 03: Dribbble References

These shape the visual direction and dashboard composition.

- [Sequence - Financial Dashboard](https://dribbble.com/shots/23683691-Sequence-Financial-Dashboard)  
  Closest overall visual direction. Deep navy sidebar, modular grid, warm metric emphasis.
- [Fintech Dashboard - Orizon](https://dribbble.com/shots/24907678-Fintech-Dashboard)  
  Strong donut-chart treatment and spend breakdown composition for reporting surfaces.
- [Fintech Dashboard - Sourav Deb](https://dribbble.com/shots/24021797-Fintech-dashboard)  
  Good reference for a top-level stat strip that scans quickly.
- [Vaulta - SaaS Fintech Dashboard](https://dribbble.com/search/fintech-dashboard)  
  Helpful for layout only. Too purple and too crypto-adjacent for Cloaka's trust profile.
- [Business Payment SaaS - Keitoto](https://dribbble.com/search/payment-dashboard)  
  The strongest light-content plus dark-sidebar split in the set.
- [Paymont - Payroll Dashboard](https://dribbble.com/tags/payroll_management)  
  Useful for progress mechanics around scheduled disbursements.
- [Finance Analytics - Nixtio](https://dribbble.com/tags/financial_dashboard)  
  Strong chart drama, but too aggressive for daily payroll operations. Good negative reference.
- [Finance Management Web Dashboard - Conceptzilla](https://dribbble.com/search/financial-dashboard)  
  Useful light-mode reference for bold balances and clean card rhythm.

## Section 04: Behance References

These are especially useful for flows, empty states, and page-level composition.

- [SaaS Finance Invoice Dashboard](https://www.behance.net/gallery/179840101/SAAS-finance-Invoice-dashboard-UI-UX-design)  
  Good model for vendor-payment lists, audit tables, and status-chip rows.
- [PAYROT - Payment Landing Page](https://www.behance.net/search/projects/payment%20ui)  
  Strong trust-page and marketing-site inspiration, not dashboard inspiration.
- [Finvero - Smart Finance Dashboard](https://www.behance.net/search/projects/payment%20ui)  
  Useful for wallet card treatment and transaction history styling.
- [Widepay - Fintech SaaS Platform](https://www.behance.net/search/projects/saas%20dashboard)  
  Good reference for overview/detail balance, but its purple accents should not carry over.
- [HR Payroll Management Dashboard](https://www.behance.net/search/projects/payroll%20management)  
  Useful for lightweight payroll stats strips and airy dashboard rhythm.
- [Paie - Hassle Free Payroll SaaS](https://www.behance.net/search/projects/saas%20dashboard)  
  Very strong empty-state and dark-grid reference.
- [Velto - Digital Wallet & Visual Identity](https://www.behance.net/search/projects/payment%20app%20ui)  
  Good reminder that the brand system should feel unified across UI, motion, and identity.
- [NOVEXI - Global Payment Case Study](https://www.behance.net/search/projects/payment%20ui)  
  Best flow reference in the set: recipient management, transfer flow, and confirmation states.

## Section 05: Synthesis

| Surface | Direction | Primary References |
| --- | --- | --- |
| Colour and atmosphere | Use a dark navy base (`#0D1F38` family), warm cream surfaces for high-trust financial moments, and a restrained blue accent. Avoid purple and neon-green fintech cliches. | Sequence, Deel, Mercury, Stripe |
| Sidebar and navigation | Use a calm, low-noise sidebar with strong hierarchy. Support a collapsed icon-first mode on smaller screens. | Linear, SeamlessHR, Notion |
| Wallet and balance display | Put the wallet balance at the top and treat it as the most important number on the page. Pair the headline number with available vs held context. | Mercury, Ramp, Stripe |
| Payment and transaction table | Prioritize recipient, amount, status, and date in a scan-first layout. Detail should open progressively, not crowd the list view. Empty states must still look premium. | Stripe, NOVEXI, Paie |
| Approval workflow | Put the amount, context, and the primary decision above the fold. Approve and reject should be obvious and hard to misread. | Ramp, Brex |
| Onboarding and trust | Use a short warm wizard, visible progress, and explicit trust cues about partner banks, audits, and guarantees. | Gusto, Mercury, Justworks |
| Rules engine | Build it like plain-language filters, not code. Users should feel like they are configuring spreadsheet logic, not programming. | Notion filters, Zapier condition builder |
| Charts and reporting | Prefer simple bar and donut charts with clear labels. Avoid flashy glow-heavy visuals that compete with the financial data. | Orizon, Sequence, Nixtio as anti-reference |

## What Cloaka Should Feel Like

- Trust-first, not hype-first.
- Calm, not exciting.
- Data-clear, not dashboard-noisy.
- Fast to scan on desktop and mobile.
- Built for Nigerian business context, especially Lagos SME operators.

## Anti-Patterns To Avoid

- Purple-heavy fintech visuals that feel crypto-adjacent.
- Lime or neon neobank accents that reduce seriousness.
- Over-animated chart treatments.
- Enterprise-heavy screens that bury the primary action.
- Rules-builder UI that looks technical or developer-oriented.
