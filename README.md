# seedance-cost

Seedance2.0 account credit consumption dashboard. The MVP stores credit snapshots, calculates daily usage/reset events, and exposes authenticated dashboard pages. Video URL tracking is intentionally out of scope.

## Tech stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Prisma v6 + PostgreSQL
- Auth.js / next-auth credentials login
- Recharts

## Local development

```bash
pnpm install
cp .env.example .env
pnpm db:generate
pnpm dev
```

Create an admin password hash with bcrypt and set `ADMIN_PASSWORD_HASH` in `.env`. Do not commit `.env`.

## Required environment variables

| Name                  | Purpose                         |
| --------------------- | ------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string    |
| `NEXTAUTH_URL`        | Public app URL                  |
| `NEXTAUTH_SECRET`     | Auth.js signing secret          |
| `ADMIN_EMAIL`         | Admin login email               |
| `ADMIN_PASSWORD_HASH` | bcrypt hash for admin password  |
| `SEEDANCE_API_URL`    | Credit API endpoint             |
| `RESET_AMOUNT`        | Reset threshold reference value |

## Prisma flow

```bash
pnpm db:generate
pnpm db:migrate
pnpm db:deploy
```

For production deployments, run `pnpm db:deploy` after the image is deployed and before serving traffic.

## Validation

Current validation commands:

```bash
pnpm run lint
pnpm exec tsc --noEmit
pnpm run format:check
pnpm exec prisma generate
pnpm run build
```

There is no test script yet in `package.json`.

## Docker

Build image:

```bash
docker build -t seedance-cost:latest .
```

Run container:

```bash
docker run --rm -p 3000:3000 --env-file .env seedance-cost:latest
```
