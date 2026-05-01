# Local validation report

Date: 2026-05-01
Branch: `feature/credit-snapshots`

## Commands run

| Command                     | Result |
| --------------------------- | ------ |
| `pnpm run lint`             | PASS   |
| `pnpm exec tsc --noEmit`    | PASS   |
| `pnpm run format:check`     | PASS   |
| `pnpm exec prisma generate` | PASS   |
| `pnpm run build`            | PASS   |

## Test script

`package.json` does not currently define a `test` script, so no automated test suite was run.

## Prisma

- Prisma Client generation passes with Prisma v6.19.3.
- Initial migration SQL is available at `prisma/migration.sql`.
- Production deployment should run `pnpm db:deploy` against `DATABASE_URL`.

## Docker validation

`docker build -t seedance-cost:validation .` was attempted, but Docker Desktop/Linux engine was not running in the local environment:

```text
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

- Dockerfile added for Next.js production runtime.
- `.dockerignore` added.
- `.env.example` contains placeholders only; no real secrets are committed.
