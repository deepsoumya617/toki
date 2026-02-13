# @xd/db

Database package using Drizzle ORM + PostgreSQL.

## Environment

- Create `packages/db/.env.local`
- Required variable: `DATABASE_URL`

## Scripts

- `bun run --filter @xd/db db:generate` - Generate SQL migrations from schema changes
- `bun run --filter @xd/db db:migrate` - Run generated migrations
- `bun run --filter @xd/db db:push` - Push schema directly to database
- `bun run --filter @xd/db db:studio` - Open Drizzle Studio

From repo root:

- `bun run db:generate`
- `bun run db:migrate`
- `bun run db:push`
- `bun run db:studio`

Recommended flow for local development:

1. Update schema files in `src/schema`
2. Run `bun run db:generate`
3. Run `bun run db:migrate`
4. Optionally run `bun run db:studio` to inspect data
