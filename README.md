# Cloaka Workspace

This repository now contains a working Cloaka monorepo foundation anchored to the supplied PRD and design research.

## What Exists

- `apps/web`: Next.js App Router shell for the Cloaka product experience
- `apps/api`: Express API with typed mock product endpoints
- `packages/shared`: buildable shared package for navigation, sample data, and API-facing product types
- `docs`: normalized research and PRD summaries

## Web Routes Included

- `/`
- `/login`
- `/register`
- `/verify-email`
- `/trust`
- `/payments`
- `/wallet`
- `/schedules`
- `/rules`
- `/approvals`
- `/recipients`
- `/team`
- `/audit`
- `/reports`
- `/settings`

## Commands

- `npm install`
- `npm run dev`
- `npm run dev:web`
- `npm run dev:api`
- `npm run db:up`
- `npm run db:down`
- `npm run typecheck`
- `npm run build`

## Source Docs

- [Design Reference Board](/C:/Users/Itoro/Documents/Cloaka/docs/design-reference-board.md)
- [PRD Overview](/C:/Users/Itoro/Documents/Cloaka/docs/prd-overview.md)
- [Credentials Checklist](/C:/Users/Itoro/Documents/Cloaka/docs/credentials-checklist.md)

## Original Inputs

- `C:\Users\Itoro\Downloads\Cloaka_PRD_v1.0.docx`
- `C:\Users\Itoro\Downloads\Cloaka_Codex_Prompt.md`
- `C:\Users\Itoro\Downloads\cloaka_design_research.html`

## Notes

- The design research HTML currently contains 28 external references plus the synthesis section, even though some of the handoff copy describes a smaller count.
- The full workspace now passes `npm run typecheck` and `npm run build`.
- The API was also runtime-checked at `GET /api/health` and `GET /api/overview`.
- The biggest remaining step is replacing mock data with a real database, auth, and payment orchestration layer.

## Backend Progress

- Prisma schema now exists at [schema.prisma](/C:/Users/Itoro/Documents/Cloaka/apps/api/prisma/schema.prisma)
- Initial SQL migration now exists at [migration.sql](/C:/Users/Itoro/Documents/Cloaka/apps/api/prisma/migrations/20260404_init/migration.sql)
- Express auth and business context routes now exist under [apps/api/src/modules](/C:/Users/Itoro/Documents/Cloaka/apps/api/src/modules)
- Local Postgres is scaffolded in [docker-compose.yml](/C:/Users/Itoro/Documents/Cloaka/docker-compose.yml)
