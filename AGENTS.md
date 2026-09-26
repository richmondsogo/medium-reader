# medium-reader

Private single-user app: ingests Medium Daily Digest emails via IMAP, fetches
articles, converts to markdown, stores in SQLite, and serves a clean reader UI.

## Architecture

Gmail(IMAP) -> ingest CLI (cron) -> SQLite (WAL) <- Next.js (Server Components + Server Actions)
One TypeScript package. No separate API layer. See docs/architecture.md and docs/adr/.

## Stack

Next.js App Router, strict TypeScript, Tailwind, shadcn/ui (added in the UI
step), SQLite via better-sqlite3 + Drizzle (added in the DB step), Vitest, zod.

## Commands

pnpm dev | build | lint | typecheck | test | check (lint+typecheck+test)

## Conventions

- src/app = routes only. Business logic lives in src/server and src/ingest.
- src/ingest is a pipeline of small pure functions with typed inputs/outputs.
  Network and IMAP access sit behind interfaces so they can be faked in tests.
- Validate all external input (env, email content, fetched HTML) with zod.
- Never log secrets. Never commit .env. Config comes only from src/lib/env.ts.
- Tests are colocated as *.test.ts. Parsers are tested against files in fixtures/.
- No new dependency without asking the user first and justifying it.

## Working agreement (IMPORTANT)

- Work on exactly the step the user names. Do not start later steps.
- Present a plan and wait for approval before editing files.
- Every step ends with: `pnpm check` green, docs updated, a step log in
  docs/steps/, and one conventional commit.
- If a test fails, fix the cause; never delete or weaken tests to pass.
- If unsure, ask.

## Security

Fetched articles may be paywalled content. The app must never be exposed on the
public internet; access is via private network only. Render markdown with no raw HTML.
Files in fixtures/ contain real personal data (email address, tracking tokens). The repo must stay private. Never paste raw fixtures into public places.
`GMAIL_APP_PASSWORD` must never be logged, printed in error messages, or committed - errors from IMAP clients should be caught and re-thrown with a sanitized message.


fixtures/html/ contains full copyrighted article text fetched for personal testing. Same rule as fixtures/emails/: repo stays private, never paste raw fixture content into public places.
