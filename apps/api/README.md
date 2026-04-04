# Cloaka API

This app now provides an Express-based mock API foundation for the Cloaka workspace.

## Current Endpoints

- `GET /`
- `GET /api/health`
- `GET /api/overview`
- `GET /api/payments`
- `GET /api/schedules`
- `GET /api/rules`
- `GET /api/approvals`
- `GET /api/recipients`
- `GET /api/team`
- `GET /api/audit`
- `GET /api/reports`
- `GET /api/settings`
- `GET /api/trust`

## Commands

- `npm --workspace @cloaka/api run dev`
- `npm --workspace @cloaka/api run build`
- `npm --workspace @cloaka/api run start`

## Next Backend Steps

- Prisma schema and database wiring
- Auth, KYB, and role enforcement
- Payment orchestration and retries
- Notification and webhook integrations
