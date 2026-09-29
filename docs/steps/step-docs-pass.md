# Step Docs Pass: Documentation and Architecture Refresh

## Summary

Completed the documentation pass for `medium-reader`:
1. **Root README**: Created [`README.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/README.md) as a complete guide for new users cloning the repository.
2. **Architecture Refresh**: Updated [`docs/architecture.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/architecture.md) to accurately document the current system architecture, environment split, database connection caching, dynamic route rendering, subtitle extraction guards, image resiliency layer, and ADR references.

---

## Writing Rules Compliance

- **Sentence Length**: Every sentence conveys one idea. No sentence exceeds approximately 25 words.
- **Active Voice**: Second person and active voice used for all instructions ("Run `pnpm dev`", "Clone the repository").
- **Term Definitions**: Every acronym and project-specific concept is defined on first use:
  - IMAP: Internet Message Access Protocol.
  - WAL: Write-Ahead Logging.
  - CLI: Command-Line Interface.
  - ADR: Architecture Decision Record.
  - Freedium: Open-source proxy service for paywalled Medium articles.
  - Digest email: Daily summary email sent by Medium highlighting curated articles.
- **Consistent Vocabulary**: Used "article" exclusively (never "story") and "digest email" exclusively (never "newsletter").
- **No Noun Pile-Ups**: Rephrased complex concepts into direct descriptive sentences.
- **Structure**: Numbered lists for ordered sequential steps; bullet points for unordered factual lists. Copy-pasteable fenced code blocks for every command.

---

## Verified System Realities

1. **Commands & CLI Defaults**:
   - `pnpm dev`, `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm check`, `pnpm format`, `pnpm fetch-digests`, `pnpm inspect-db`, `pnpm db:generate`.
   - `pnpm purge-old-articles`: Verified dry-run safety by default. Requires `--confirm` to delete articles older than 90 days.
   - `pnpm backfill-subtitles`: Verified dry-run safety by default with limit 10. Requires `--apply` to commit database updates, with `--limit <N>` and `--all` options.
2. **Environment Variables**:
   - Web & shared: `DATABASE_PATH` (default `./data/medium-reader.db`), `LOG_LEVEL` (default `info`).
   - Ingest & CLI only: `GMAIL_USER` (required), `GMAIL_APP_PASSWORD` (required), `FREEDIUM_BASE_URLS` (default `https://freedium-mirror.cfd,https://freedium.cfd`), `ARTICLE_FETCH_DELAY_MS` (default `1500`), `INGEST_LOOKBACK_DAYS` (default `14`).
3. **Application Identity and Routes**:
   - Brand name: `Daybreak` in `src/lib/brand.ts`.
   - Route paths: `/` (reader root), `/read/[id]` (article reader via `src/lib/routes.ts`), `/style-guide`.
4. **Architectural Realities**:
   - Single cached SQLite database connection on `globalThis.__mediumReaderDb` via `getDb()` (ADR 0010).
   - Dynamic rendering on reader routes via `export const dynamic = "force-dynamic"` (ADR 0010).
   - Subtitle extraction pipeline with 6 validation guards (missing, title duplicate, boilerplate, truncated, >200 chars, body duplicate) and display logic via `getDisplaySubtitle()`.
   - Resilient image pipeline: URL rewrite from broken mirror endpoints to Medium CDN (`miro.medium.com`), 2 retries (300ms, 800ms backoff), and fallback card UI.

---

## Stranger Test Verification

Simulated a user cloning the repository for the first time with only `README.md`:
- Prerequisites clearly listed (Node.js >= 20.9.0, pnpm >= 10, Gmail account).
- Step-by-step installation commands copy-pasteable.
- Gmail app password generation flow explicitly detailed.
- Initial ingest command (`pnpm fetch-digests`) and dev server command (`pnpm dev`) provided.
- Local address (`http://localhost:3000`) documented.
- Platform-specific callouts included for Norton/antivirus IMAP blocking and PowerShell `-LiteralPath` bracket handling.

---

## Out of Scope Items

- No code modifications were made.
- Existing historical documents (`AGENTS.md`, `DESIGN.md`, `docs/adr/*`, `docs/notes/*`, and prior `docs/steps/*`) were preserved unchanged.
- Active uncommitted changes to `src/components/ui/typography.tsx` were left untouched.

---

## Verification Matrix

- ESLint: zero errors, zero warnings.
- TypeScript: `tsc --noEmit` passed cleanly.
- Vitest: 26/26 test suites passed (149 tests).
- `pnpm check`: Passed cleanly.
