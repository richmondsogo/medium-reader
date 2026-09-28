# Step 06j: Store Real Article Subtitles (Data Layer, Extraction, and Dry-Run Backfill)

## Summary

Completed **Step 06j** for `medium-reader`: implemented schema migration for `articles.subtitle`, built pure metadata extraction with multi-tiered anti-duplication guards, wired subtitle extraction into ingest, implemented a safe dry-run-by-default backfill CLI, and executed the initial 10-article dry run verifying 100% cross-check alignment against the Step 06h discovery baseline.

---

## 1. Checkpoint 1: Database Schema & Repo Functions

### Schema & Migration
- Added nullable `subtitle: text("subtitle")` to the `articles` table in [`src/db/schema.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/db/schema.ts):
  - `NULL`: Unchecked / uninspected.
  - `""` (empty string): Checked, confirmed no distinct author subtitle.
  - Non-empty string: Real, untruncated subtitle extracted from metadata.
- Configured [`drizzle.config.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/drizzle.config.ts) and added `"db:generate": "drizzle-kit generate"` to [`package.json`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/package.json).
- Generated Drizzle migration `drizzle/migrations/0001_colorful_havok.sql`:
  ```sql
  ALTER TABLE `articles` ADD `subtitle` text;
  ```

### Repo Functions
In [`src/db/articles.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/db/articles.ts):
- `setArticleSubtitle(db, id, subtitle)`: Sets `subtitle` and updates `updatedAt = new Date().toISOString()`.
- `listArticlesMissingSubtitle(db)`: Queries articles `WHERE subtitle IS NULL`, selecting `{ id, url, title, snippet, fetchedVia }` ordered by `articles.id ASC`.

### Tests
- Added unit tests in [`src/db/articles.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/db/articles.test.ts) on an in-memory SQLite database (`:memory:`):
  - Verified `listArticlesMissingSubtitle` returns only rows with `subtitle IS NULL` (ignoring `""` and populated strings) and excludes `contentMarkdown`.
  - Verified `setArticleSubtitle` updates the row and sets `updatedAt`.
- **Commit**: `feat: add articles.subtitle column and repo functions` (`3f98788`).

---

## 2. Checkpoint 2: Subtitle Extraction Logic

### Pure Function Implementation
Implemented `extractSubtitle({ html, via, title, bodyMarkdown })` in [`src/ingest/extractSubtitle.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/ingest/extractSubtitle.ts):
- **Candidate Selection**:
  - `via === "direct"`: Reads `meta[property="og:description"]` ONLY (never falls back to `meta[name="description"]`, which contains SEO copy or title+body concatenations).
  - `via === "freedium-mirror" | "freedium"`: Reads `meta[name="description"]`, falling back to `og:description`.
- **Whitespace Normalization**: Trims and collapses irregular internal whitespace (`\s+` -> `" "`).
- **Ordered Guards**:
  1. `missing`: Empty or missing candidate -> returns `{ subtitle: "", reason: "missing" }`.
  2. `duplicate-of-title`: Alphanumerics-only lowercase candidate equals title -> returns `{ subtitle: "", reason: "duplicate-of-title" }`.
  3. `too-long`: Candidate exceeds 200 characters -> returns `{ subtitle: "", reason: "too-long" }`.
  4. `duplicate-of-body`: Candidate (with leading title copy and trailing ellipsis stripped) is contained in the first 800 characters of `bodyMarkdown` (in alphanumerics-only lowercase) -> returns `{ subtitle: "", reason: "duplicate-of-body" }`. Prevents repeating opening paragraphs when authors wrote no subtitle.
  - If all guards pass -> returns `{ subtitle: normalized, reason: "ok" }`.

### Tests & Empirical Verification
In [`src/ingest/extractSubtitle.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/ingest/extractSubtitle.test.ts):
- Added inline tests covering all guard branches (missing, direct og vs junk meta description, freedium fallback, title duplicate, too-long, duplicate-of-body).
- Added fixture tests for `free-direct.html`, `member-direct.html`, and `member-freedium-mirror.html`, printing actual discovered candidate metadata:
  - `free-direct.html` (direct): `og:description` = `"How I built aidot-express, a Spring-style framework for clear API code, quick testing, request tracing, and Vue 3 screens."`
  - `member-direct.html` (direct): `og:description` = `"It’s not confidence, charm, or charisma"`
  - `member-freedium-mirror.html` (freedium-mirror): `og:description` is undefined; `meta[name="description"]` = `"It’s not confidence, charm, or charisma"`
- **Commit**: `feat: extract article subtitle from page metadata` (`51fb7c1`).

---

## 3. Checkpoint 3: Ingest Pipeline Wiring

- Added `subtitle?: string | null` to `ExtractedArticle` in [`src/ingest/types.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/ingest/types.ts).
- In [`src/ingest/fetchAndExtractArticle.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/ingest/fetchAndExtractArticle.ts):
  - On successful/partial HTML fetch: extracts subtitle from HTML in hand, passing `via: result.via`, `title: fallback.title || extracted.title`, and `bodyMarkdown: cleanArticleMarkdown(extracted.contentMarkdown, fallback.title || extracted.title)`.
  - On failed fetch (`!result`): leaves `subtitle: null`.
  - On locked/partial preview: `<head>` remains intact, so subtitle is computed normally.
- In [`src/db/articles.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/db/articles.ts) (`upsertArticle`):
  - Never overwrites an existing non-null subtitle with `null`.
- In [`src/ingest/fetchDigests.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/ingest/fetchDigests.ts):
  - Passes `subtitle: extracted.subtitle` in `insertData`.
- Added unit tests in `fetchAndExtractArticle.test.ts` and `articles.test.ts`. Verified existing `fetchDigests.test.ts` passes unchanged.
- **Commit**: `feat: capture subtitle during ingest` (`1e593d3`).

---

## 4. Checkpoint 4: Dry-Run-by-Default Subtitle Backfill CLI

- Created [`src/cli/backfill-subtitles.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/cli/backfill-subtitles.ts) and added `"backfill-subtitles": "tsx src/cli/backfill-subtitles.ts"` to `package.json`.
- Implemented pure argument parsing with strict safety defaults:
  - Default: `{ apply: false, limit: 10 }` (dry-run, writes nothing).
  - `--apply` alone: `{ apply: true, limit: 10 }` (caps writes at 10).
  - `--limit N`: `{ apply: false, limit: N }`.
  - `--all`: `{ apply: false, limit: null }`.
  - `--apply --all`: `{ apply: true, limit: null }`.
- Fetching & extraction workflow:
  - Queries articles where `subtitle IS NULL`.
  - For each article, attempts direct fetch first. If it fails or lacks `og:description`, falls back to the Freedium mirror chain.
  - Per-article error isolation: network or parsing failures on one article never abort the run.
  - Re-runnable and resumable: writes only via `setArticleSubtitle` on rows where subtitle is `NULL`.
- Cross-check metrics:
  - (i) Verifies if accepted subtitle starts with old snippet prefix (alphanumerics-only).
  - (ii) Reports duplicate-of-body ratio.
  - (iii) Tracks longest accepted subtitle and shortest too-long rejection.
- Tested argument parsing and execution safety in [`src/cli/backfill-subtitles.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/cli/backfill-subtitles.test.ts).
- **Commit**: `feat: add dry-run-by-default subtitle backfill CLI` (`b494e81`).

---

## 5. Dry-Run Execution Output (10 Articles)

Executed `pnpm backfill-subtitles` with no flags:

```text
$ tsx src/cli/backfill-subtitles.ts
◇ injected env (5) from .env
=== Subtitle Backfill ===
Mode: DRY RUN (read-only, no writes)
Limit: 10
Delay between articles: 1500ms
Found 193 article(s) with subtitle IS NULL.
Processing 10 article(s)...

[#1] snippet="Checklists are boring AF, and that’s exactly why they…" -> subtitle="Checklists are boring AF, and that’s exactly why they work" (ok)
[#2] snippet="India was always the country I wanted to visit the…" -> subtitle="India was always the country I wanted to visit the most" (ok)
[#3] snippet="Copy my strategy, dude." -> subtitle="Copy my strategy, dude." (ok)
[#4] snippet="In school mathematics, the unknown usually appears in…" -> subtitle="" (duplicate-of-body)
[#5] snippet="First, I will go over the general collective. Next…" -> subtitle="First, I will go over the general collective. Next, scroll down to find your personal horoscope for your zodiac sign." (ok)
[#6] snippet="Earn money as a health writer" -> subtitle="Earn money as a health writer" (ok)
[#7] snippet="We are living in a generational opportunity for wealth…" -> subtitle="We are living in a generational opportunity for wealth building (but only if you do this)" (ok)
[#8] snippet="Like how your head starts to leak and going on ‘fart…" -> subtitle="Like how your head starts to leak and going on ‘fart walks’" (ok)
[#9] snippet="It’s so much worse than we thought…" -> subtitle="" (duplicate-of-body)
[#10] snippet="The exact Facebook search method behind five validated…" -> subtitle="The exact Facebook search method behind five validated software, plus a checklist to test your own." (ok)

=== Summary Counts by Reason ===
  ok: 8
  missing: 0
  duplicate-of-title: 0
  duplicate-of-body: 2
  too-long: 0
  fetch-failed: 0

=== Cross-Checks ===
(i) Old snippet prefix match for accepted subtitles:
    Matches: 8 / 8
    Mismatches: 0
(ii) Duplicate-of-body ratio: 2/10 (20.0%) (discovery report baseline: ~21.8%)
(iii) Boundaries:
    Longest accepted subtitle: [#5] (117 chars): "First, I will go over the general collective. Next, scroll down to find your personal horoscope for your zodiac sign."
    Shortest too-long rejection: none
```

---

## 6. Verification Status

- `pnpm check`: Passed cleanly with 0 errors and 0 warnings (20 test files, 126 tests passed).
- Dry-run completed with zero writes to SQLite.
- Awaiting human go-ahead before running `--apply`.
