# 0010. Production Runtime Model

## Status

Accepted

## Context

The application runs as a persistent service on a private network. Ingestion runs out-of-band via cron, while users read articles and mark state through Next.js.

## Decision

1. Run the built production app (`pnpm build && pnpm start`), not `pnpm dev`.
2. Force dynamic rendering on reader routes (`force-dynamic`) so background ingestion updates appear immediately without rebuilds.
3. Split environment config so the web process requires no mail credentials.
4. Cache a single SQLite connection on `globalThis` in the web process, relying on WAL mode for multi-process concurrency.

## Consequences

- Ingested articles appear immediately in the UI on request.
- The web server holds no mail credentials, eliminating secret exposure.
- Database connections are reused cleanly rather than leaked per request.
