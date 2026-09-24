# 0006. Article Retention and Purge Policy

## Status

Accepted

## Context

Medium digests frequently resurface older articles that were published weeks or months ago. If retention and cleanup routines purged records based on `published_at`, recently received digest items would be immediately deleted and then continuously re-fetched on subsequent runs.

## Decision

Base retention cleanup on `ingested_at` rather than `published_at`, and provide an unconditional exemption for records where `is_saved` is true.

## Consequences

- Prevents premature purging of older articles recently delivered in digest emails.
- Stops churn and redundant re-ingestion cycles.
- Preserves all user-bookmarked (`is_saved = true`) articles indefinitely regardless of age.
