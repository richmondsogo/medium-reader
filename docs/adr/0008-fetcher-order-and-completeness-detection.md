# 0008: Fetcher Order and Completeness Detection

**Date:** 2026-09-26
**Status:** Accepted

## Context

During the ingestion of Medium articles, we must fetch the article content. Medium paywalls member-only articles, returning truncated HTML (HTTP 200 OK) instead of the full text. We need a way to detect this truncation and fallback to bypass proxies (Freedium mirrors).

Based on offline testing documented in `docs/notes/fetch-behavior.md`, Freedium mirrors (like `freedium-mirror.cfd`) can successfully retrieve the full text, whereas `freedium.cfd` is currently failing. However, bypass proxies can be fragile, so we should always attempt to fetch from Medium directly first, since it may be a free article.

## Decision

1. **Fetcher Order (Direct-First Chain):** 
   We will attempt to fetch articles in the following order:
   - Direct fetch to Medium.
   - Fallback 1: First configured Freedium mirror (default: `freedium-mirror.cfd`).
   - Fallback 2: Next configured Freedium mirror (default: `freedium.cfd`).
   
   Configuration is defined by the `FREEDIUM_BASE_URLS` environment variable. The chain short-circuits successfully as soon as a "complete" article is fetched.

2. **Completeness Detection Signals:**
   We use two specific heuristic signals in the raw HTML to detect a paywall (truncation):
   - **JSON State Flag:** The string `"isLockedPreviewOnly":true` appearing in the `__MIDDLEWARE_STATE__` / Apollo state JSON block.
   - **Text Marker:** A `<p>` tag containing the exact text `Member-only story` (e.g. `<p class="pw-member-badge">Member-only story</p>`).

   If either signal is present, the attempt is marked "locked" and we move to the next fetcher in the chain.

## Known Fragility

This detection mechanism is a known fragility. Medium could change their internal JSON state property name (`isLockedPreviewOnly`), alter the "Member-only story" text, or change the paywall behavior entirely. This would silently break our detection, causing the system to accept truncated articles as "complete". 

If extraction quality drops (e.g., articles start consistently extracting only ~200 word snippets), this ADR and the detection logic in `src/ingest/completeness.ts` must be revisited.
