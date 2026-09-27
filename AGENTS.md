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
- All database access goes through src/db/*.ts repository functions -
  nothing outside src/db/ should import better-sqlite3 or drizzle-orm directly.
- All text styling goes through src/components/ui/typography.tsx. No
  component may specify its own font-size/weight/line-height - enforced by
  ESLint. If a new text role is needed, add it to typography.tsx first.

## Simplicity and surgical changes (IMPORTANT)

- No speculative flexibility, configurability, or persistence that wasn't
  requested. Concrete lesson from this project: next-themes was added to
  support a manual toggle; the toggle was later removed but next-themes
  (and its localStorage persistence) stayed behind and caused a real,
  hard-to-diagnose bug. If a feature is removed, remove its supporting
  infrastructure in the same change - don't leave it "just in case."
- Touch only what the current task requires. Don't refactor, reformat, or
  "improve" adjacent code while doing something else. Remove imports/
  variables that YOUR change made unused; don't remove pre-existing dead
  code unless asked.
- If multiple reasonable interpretations of a request exist, state them and
  ask - don't silently pick one.
- If a simpler approach exists than the one requested, say so before
  implementing the more complex version.

## Working agreement (IMPORTANT)

- Work on exactly the step the user names. Do not start later steps.
- Present a plan and wait for approval before editing files.
- Every step ends with: `pnpm check` green, docs updated, a step log in
  docs/steps/, and one conventional commit.
- If a test fails, fix the cause; never delete or weaken tests to pass.
- If unsure, ask.
- Define success criteria before starting multi-step work (what will be
  true when this is actually done, and how will it be checked), not just
  "make it work." State them as a brief numbered plan with a verify step
  per item.
- A change is only "done" once verified against those criteria - reading
  your own source code back is not verification. For anything with a
  runtime/visual effect (a page, a style, a running command), verify by
  actually running it (dev server, browser tool, live command output), not
  by inspecting the code that should produce the effect.
- STANDING RULE: never run `git push --force` or `git push -f` under any
  circumstance without stopping and asking me first, explaining exactly why
  a force push is needed. If a commit needs fixing, use a new commit or
  `git commit --amend` (only if unpushed), never a forced rewrite of pushed
  history.
- pnpm check does not catch a missing/empty default export in a Next.js
  page.tsx or layout.tsx file, since plain tsc/eslint don't enforce that
  Next.js-specific rule. Any App Router route file must be verified by
  actually loading it in a running dev server, not by pnpm check alone.

## Security

Fetched articles may be paywalled content. The app must never be exposed on the
public internet; access is via private network only. Render markdown with no raw HTML.
Files in fixtures/ contain real personal data (email address, tracking tokens). The repo must stay private. Never paste raw fixtures into public places.
`GMAIL_APP_PASSWORD` must never be logged, printed in error messages, or committed - errors from IMAP clients should be caught and re-thrown with a sanitized message.

fixtures/html/ contains full copyrighted article text fetched for personal testing. Same rule as fixtures/emails/: repo stays private, never paste raw fixture content into public places.

## Agent skills

### Issue tracker

Tracked via GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical five-role triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout (`CONTEXT.md` at root, `docs/adr/`). See `docs/agents/domain.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
