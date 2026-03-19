# Toki API

![Status: WIP](https://img.shields.io/badge/status-WIP-f59e0b?style=flat-square)

Core backend service for **Toki**, built with Bun + Hono.

This service handles the core _HTTP APIs_:

- authentication and session handling
- users
- rooms and room membership

It intentionally does **not** handle chat messages, realtime delivery, notifications, or search. Those responsibilities are planned as separate services.

## Stack

| Layer         | Tools       |
| ------------- | ----------- |
| Runtime       | Bun         |
| Framework     | Hono        |
| ORM           | Drizzle ORM |
| Database      | PostgreSQL  |
| Session Store | Redis       |
| Validation    | Zod         |

## Run

```bash
bun install
bun run dev
```

API base URL: `http://localhost:8080/api`
