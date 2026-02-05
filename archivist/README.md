This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Project Notes

- The main page layout lives in `app/page.tsx`.
- Styling tokens live in `app/globals.css`.
- Fonts are loaded in `app/layout.tsx` using `next/font`.

## Testing (Cypress)

This project uses Cypress for both e2e and component testing.

Prerequisites:
- `DATABASE_URL` must be set (Cypress uses the Prisma seed script for test data).

Run locally:
- `pnpm cypress:open` (e2e runner)
- `pnpm cypress:open:ct` (component runner)

Run headless:
- `pnpm cypress:run` (e2e)
- `pnpm cypress:run:ct` (component)
- `pnpm cypress:run:ci` (CI-friendly, headless, explicit browser)

Test data:
- e2e specs call `cy.task("db:seed")`, which runs `node prisma/seed.cjs`.

## Testing (Playwright)

This project uses Playwright for both e2e and component testing.

Prerequisites:
- `DATABASE_URL` must be set (Playwright seeds via `node prisma/seed.cjs`).
- Install browsers once with `pnpm playwright:install`.

Run e2e:
- `pnpm playwright:test`
- `pnpm playwright:ui`
- `pnpm playwright:report`

Run component tests:
- `pnpm playwright:ct`
- `pnpm playwright:ct:ui`

Auth:
- Playwright logs in with the seeded admin user by default.
- Override credentials with `PLAYWRIGHT_EMAIL` and `PLAYWRIGHT_PASSWORD`.

Git hooks:
- A `pre-push` hook runs `pnpm playwright:test` to block pushes on failures.
- Set `HUSKY=0` to skip the hook for a single push.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
