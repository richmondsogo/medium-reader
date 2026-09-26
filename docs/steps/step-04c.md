# Step 04c: fetchDigests Orchestrator

This step implemented the main offline ingestion orchestrator for the `medium-reader` app.

## Changes Made
- Added `ARTICLE_FETCH_DELAY_MS` and `INGEST_LOOKBACK_DAYS` to `src/lib/env.ts` for ingestion tuning.
- Created `src/ingest/fetchDigests.ts`, a testable orchestrator function that:
  - Fetches digest emails using the IMAP client interface.
  - Skips already processed emails using the `processedEmails` table.
  - Parses each email, fetches its articles using `fetchAndExtractArticle`, and upserts them.
  - Handles per-article failures gracefully so one failed article doesn't block the entire digest.
  - Implements delays between article fetches to be polite to Medium's servers.
  - Records run status (`success`, `partial`, `failed`) and detailed error summaries in `ingestRuns`.
- Wrote extensive tests in `src/ingest/fetchDigests.test.ts` using in-memory SQLite, a fake IMAP client, and fake fetch functions to verify normal operations, skipped emails, partial failures, and delay mechanisms without real IO.
- Authored ADR 0009 on Ingest Idempotency and Partial Failure.
