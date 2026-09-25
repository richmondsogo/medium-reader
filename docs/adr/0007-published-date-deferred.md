# 0007. Published Date Deferred to Fetch Step

## Status

Accepted

## Context

Medium Daily Digest emails do not include publication timestamps for individual articles in either the plain text or HTML MIME parts. The only reliable date provided in the email is the delivery timestamp in the `Date:` header (e.g. `dispatchDate`).

Downstream reader interfaces require sorting articles chronologically, but accurate individual story publication dates are only discoverable when fetching and parsing the full article web pages.

## Decision

At email ingestion time, use the digest's `dispatchDate` as a temporary placeholder for each article's `published_date`. When individual articles are subsequently fetched in the content fetching pipeline, overwrite this placeholder with the actual publication date extracted from the article's web page metadata if available.

## Consequences

- Ingestion remains fast, synchronous, and independent of external HTTP fetching.
- Articles immediately have a valid chronological date for sorting and indexing upon ingestion.
- The fetching pipeline is responsible for enriching and refining the published date without mutating the original email ingest record.
