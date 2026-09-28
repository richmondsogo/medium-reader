# Step 07a: Production-Mode Correctness

## Summary
Executed Step 07a of `medium-reader`: verified and hardened production-mode correctness (`pnpm build && pnpm start`), resolving static caching staleness, unpooled database connections, and mail secrets leakage into web runtime code. All verification was conducted on an isolated database copy at `data/prodtest.db` with zero mutation to `data/medium-reader.db`.

---

## Part 0: Problem Confirmation Findings

### P1: Stale Pages
- **Build Output Route Summary (Before)**:
  ```text
  Route (app)
  ┌ ○ /
  ├ ○ /_not-found
  ├ ƒ /a/[id]
  └ ○ /style-guide

  ○  (Static)   prerendered as static content
  ƒ  (Dynamic)  server-rendered on demand
  ```
- **Finding**: `/` and the sidebar layout were statically prerendered at build time (`○`).
- **Live Evidence**: Started production server (`pnpm start -p 3001`), loaded `/` (top article ID 28). Inserted marker article `"ZZZ freshness marker"` (ID 194) via `upsertArticle` into `data/prodtest.db`. Reloading `/` without rebuilding/restarting failed to show the marker (`MARKER NOT FOUND (STALE)`). The hypothesis was confirmed: the sidebar was completely frozen at build time.

### P2: Connections
- **Call Sites Found**:
  - `src/app/(reader)/layout.tsx:8`: `const db = createDb(env.DATABASE_PATH);`
  - `src/app/(reader)/a/[id]/page.tsx:38`: `const db = createDb(env.DATABASE_PATH);`
  - `src/server/actions.ts:13`: `const db = createDb(env.DATABASE_PATH);`
- **Finding**: A new SQLite database connection was opened per render and per server action. None of these call sites ever called `close()`, leaking SQLite handles and file descriptors across requests.

### P3: Secrets
- **Modules Importing `src/lib/env.ts`**:
  - Web modules: `src/app/(reader)/layout.tsx`, `src/app/(reader)/a/[id]/page.tsx`, `src/server/actions.ts`.
  - Ingest / CLIs / Scripts: `src/ingest/imapflowClient.ts`, `src/cli/fetch-digests.ts`, `src/cli/purge-old-articles.ts`, `src/cli/inspect-db.ts`, `src/cli/backfill-subtitles.ts`, `scripts/inspect-article-images.ts`, `scripts/inspect-chrome-leakage.ts`.
- **Finding**: The web process only reads `DATABASE_PATH` and `LOG_LEVEL`. It has no need for `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `FREEDIUM_BASE_URLS`, `ARTICLE_FETCH_DELAY_MS`, or `INGEST_LOOKBACK_DAYS`. Previously, `env.ts` required mail credentials on startup, exposing the web app to startup failure without email credentials.

---

## Part 1: Fixes & Changes Made

### 1. CP1 — Split the Environment Module
- **`src/lib/env.ts`**:
  - Removed `dotenv` loading (Next.js automatically loads `.env` files).
  - Reduced schema strictly to web and shared needs: `DATABASE_PATH` and `LOG_LEVEL`.
- **`src/lib/ingest-env.ts`**:
  - Loads `dotenv`.
  - Extends `envSchema` with `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `FREEDIUM_BASE_URLS`, `ARTICLE_FETCH_DELAY_MS`, and `INGEST_LOOKBACK_DAYS`.
- **CLI & Ingest Imports**:
  - Migrated `src/ingest/imapflowClient.ts`, `src/cli/*`, and `scripts/*` to import `{ env }` from `ingest-env`.
- **ESLint Boundary Rule**:
  - Added `no-restricted-imports` rule in `eslint.config.mjs` forbidding imports of `ingest-env` inside `src/app/**` and `src/components/**`.
- **Tests & Docs**:
  - Updated `src/lib/env.test.ts` proving the web schema parses with only `DATABASE_PATH` set.
  - Added `src/lib/ingest-env.test.ts` testing ingest credential requirements and defaults.
  - Updated `.env.example` comments distinguishing web/shared variables from ingest-only variables.
- **Commit**: `4137c11` - `refactor: split web env from ingest env, web holds no mail credentials`

### 2. CP2 — Single Connection in Web Process
- **`src/db/instance.ts`**:
  - Created `getDb(): DbClient` returning a single cached `better-sqlite3` + Drizzle instance stored on `globalThis.__mediumReaderDb`.
- **`src/db/instance.test.ts`**:
  - Added test asserting that repeated calls to `getDb()` return the exact same instance reference.
- **Web Callers**:
  - Replaced `createDb(env.DATABASE_PATH)` with `getDb()` in `src/app/(reader)/layout.tsx`, `src/app/(reader)/a/[id]/page.tsx`, and `src/server/actions.ts`.
  - Removed direct `env` and `createDb` imports from web routes and server actions.
  - Updated `src/server/actions.test.ts` to mock `@/db/instance`.
- **Commit**: `72139a5` - `refactor: reuse one database connection in the web process`

### 3. CP3 — Dynamic Rendering
- **Route Segment Configuration**:
  - Added `export const dynamic = "force-dynamic"` to `src/app/(reader)/layout.tsx`, `src/app/(reader)/page.tsx`, and `src/app/(reader)/a/[id]/page.tsx`.
- **Build Output Route Summary (After)**:
  ```text
  Route (app)
  ┌ ƒ /
  ├ ○ /_not-found
  ├ ƒ /a/[id]
  └ ○ /style-guide

  ○  (Static)   prerendered as static content
  ƒ  (Dynamic)  server-rendered on demand
  ```
- **Freshness & Read State Verification**:
  - Re-ran `pnpm build && pnpm start -p 3001` with `$env:DATABASE_PATH = "./data/prodtest.db"`.
  - Loaded `/` and noted top article.
  - Inserted marker `"ZZZ freshness marker"` (ID 195).
  - Reloaded `/` without restart: marker immediately appeared at the top of the sidebar.
  - Opened `/a/195`: returned HTTP 200 with full markdown content rendered.
  - Marked article 195 as read: reloaded `/` and verified its title styled with `text-muted-foreground` (read state).
  - Removed marker via `--remove`: reloaded `/` and verified marker completely disappeared.
- **Commit**: `ee5994c` - `fix: render reader routes per request so new articles appear without a rebuild`

### 4. CP4 — Documentation & ADR 0010
- **`docs/adr/0010-production-runtime-model.md`**:
  - Added ADR 0010 (under 25 lines) defining the production runtime model: run built app, dynamic reader rendering, zero mail credentials in web process, one cached DB connection.
- **`docs/architecture.md`**:
  - Added "Running in Production" section detailing `pnpm build`, `pnpm start`, and WAL multi-process concurrency with ingest cron.
- **`AGENTS.md`**:
  - Added convention: `"src/app and src/components never import ingest-env; the web side reads only DATABASE_PATH and LOG_LEVEL."`
- **Commit**: `50f2d51` - `docs: ADR 0010 production runtime model`

---

## Cleanups & Verification Matrix

- Deleted temporary `data/prodtest.db*` files.
- Deleted throwaway `scripts/scratch-freshness-marker.ts`.
- Verified `pnpm check` passed cleanly before and after each commit:
  - ESLint: zero errors, zero warnings.
  - TypeScript: `tsc --noEmit` passed cleanly.
  - Vitest: 23/23 test files passed (141 tests).
