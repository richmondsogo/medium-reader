# ADR 0009: Ingest Idempotency and Partial Failure

**Date:** 2026-09-26

## Decision

We designed the `fetchDigests` orchestrator to be resilient against partial failures and idempotent.

1. **Idempotency via `messageId`**: Instead of relying purely on date bounds, each email's `messageId` is tracked in the `processedEmails` table. If an email is fully processed, it is skipped entirely in subsequent runs, even if returned by the IMAP search.
2. **Per-Article Isolation**: A digest contains multiple articles. If one article fails to fetch or parse (e.g., due to rate limits or unhandled DOM structure), it does not fail the entire email. The orchestrator isolates the error, increments the failure count, logs it, and continues to the next article.
3. **Run Statuses**: Ingestion runs record a state of:
   - `success`: Everything (emails and articles) succeeded.
   - `partial`: At least one article or email failed, but some data was processed or attempted.
   - `failed`: Every attempted email failed entirely (e.g., IMAP errors, parsing faults).

## Consequences

This ensures that network blips on a single article do not create an infinite retry loop for the rest of the digest. It provides clear visibility into partial degradation while keeping the core pipeline reliable.
