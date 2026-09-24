# 0004. Idempotent Ingestion CLI with Fallback Fetcher Chain

## Status

Accepted

## Context

Medium article fetching is vulnerable to paywalls, rate limits, network partitions, and DOM changes. Ingestion failures should not crash the pipeline or corrupt existing data.

## Decision

Implement ingestion as an idempotent CLI command executed on a cron schedule, using a fallback fetcher chain (direct -> Freedium primary -> mirror -> email-snippet-only) and Mozilla Readability for markdown extraction.

## Consequences

- Fetcher strategies are swappable, composable, and testable with fixtures.
- Pipeline runs safely and idempotently across repeated runs without creating duplicate entries.
- Ingestion failures on individual articles are recorded in the database and never fatal to the overall pipeline.
