# Archivist

Archivist is a Next.js App Router application that lives in the `archivist/` subfolder. This repo also contains Cypress tests, Prisma schema/seed, and scripts that support local development.

## Project Layout

- `archivist/app/`: Next.js routes, layouts, and server actions.
- `archivist/lib/`: shared helpers (including Prisma adapter and guards).
- `archivist/prisma/`: Prisma schema and seed script.
- `archivist/cypress/`: E2E and component tests.
- `archivist/scripts/`: one-off helper scripts.
- `todo/`: task checklists and planning docs.

## Getting Started

From the repo root:

```bash
cd archivist
pnpm install
pnpm dev
```

Open http://localhost:3000 to view the app.

## Requirements

- Node.js `>=20.19.0`
- `pnpm`
- `DATABASE_URL` set in `.env` or `.env.local` before running Prisma or Cypress commands

## Common Commands

Run these from `archivist/`:

- `pnpm dev`: start the dev server
- `pnpm build`: generate Prisma client, link the adapter, and build Next.js
- `pnpm start`: run the production server
- `pnpm lint`: run ESLint

## Prisma

Run these from `archivist/`:

- `pnpm prisma migrate dev`: create/apply migrations
- `pnpm prisma db seed`: seed the database

## Testing (Cypress)

Run these from `archivist/`:

- `pnpm cypress:run`: E2E tests (headless)
- `pnpm cypress:run:ct`: component tests (headless)
- `pnpm cypress:open`: E2E runner (interactive)
- `pnpm cypress:open:ct`: component runner (interactive)
