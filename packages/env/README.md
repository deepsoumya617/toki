# @xd/env

Shared runtime env validation for all services in this monorepo.

## Principles

- Keep validation in this package.
- Load `.env` files in each app/service runtime, not here.
- Use one env file per service (`apps/<service>/.env.local`).

## Schemas

- `@xd/env/web` -> `webEnv`
- `@xd/env/db` -> `dbEnv`
- `@xd/env/http` -> `httpEnv`
- `@xd/env/ws` -> `wsEnv`

## Usage

```ts
import { httpEnv } from '@xd/env/http';

const port = httpEnv.PORT;
```

For Next.js, import `webEnv` in `next.config.ts` so validation runs at startup.
