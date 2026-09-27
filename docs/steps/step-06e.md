# Step 06e: Detect & Flag Unrecognized Medium Chrome Variants During Ingest

## Summary
Executed Step 06e of `medium-reader`:
1. **Self-Detecting Chrome Leaks Architecture**:
   - Built detection capability to ensure any future Medium UI chrome changes or variants that slip past render-time cleanups surface visibly as soft warnings during ingestion rather than as silent rendering bugs.
2. **Residual Chrome Marker Detection (`detectResidualChromeMarkers`)**:
   - Implemented `detectResidualChromeMarkers(cleanedMarkdown: string): string[]` in [`src/lib/cleanArticleMarkdown.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/cleanArticleMarkdown.ts).
   - Scans cleaned markdown for 5 known noise patterns that may have slipped past `cleanArticleMarkdown`'s regexes:
     - `caption-prompt`: Detects image zoom/caption prompt variants (e.g. `Click to view image in full size`, `view image in full size`).
     - `profile-link`: Detects unstripped Medium author profile URLs (`medium.com/@handle` or `<handle>.medium.com` without a story slug).
     - `reading-time`: Detects isolated reading-time line variants (`*N mins read*`, `N minute read`, etc.).
     - `date-line`: Detects standalone absolute or relative date line variants (`*Sep 16, 2026*`, `16 Sep 2026`, `5 days ago`).
     - `divider-line`: Detects standalone `--`, `\--`, `––`, `——`, `-\-` lines.
   - Pure detection function returning array of found marker names (`[]` when clean). Does not modify markdown.
3. **Ingest Pipeline Soft Warning Integration**:
   - In [`src/ingest/fetchDigests.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/ingest/fetchDigests.ts), after extracting article content:
     - Evaluates `detectResidualChromeMarkers` on cleaned content for `fetchedVia === "direct"` articles only (`freedium-mirror` articles are confirmed unaffected).
     - If any markers are detected, pushes a soft warning to that run's `errorSummary`:
       `{ context: article.url, message: "Possible unrecognized Medium chrome: <markers>" }`.
     - Visibility only: does not fail the article, does not downgrade its `fetchStatus` (still upserted as `ok`), and run status remains `"success"`.
4. **Prototyping & Verification**:
   - Prototypes tested against all 193 stored SQLite database articles via a standalone throwaway script (`scratch-detect.ts`) confirming 0 false positives across all 8 direct-fetched articles.
   - Added unit test in [`src/lib/cleanArticleMarkdown.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/cleanArticleMarkdown.test.ts) verifying that caption variants (e.g. `Click to view image in full size`) that slip past `cleanArticleMarkdown` are reliably caught by `detectResidualChromeMarkers`.
   - Added unit test in [`src/ingest/fetchDigests.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/ingest/fetchDigests.test.ts) confirming soft warnings in `errorSummary` without failing the ingest run.
5. **Conventions Updated**:
   - Documented the chrome alert convention in [`AGENTS.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/AGENTS.md).
   - Documented the regex prototyping convention (testing gnarly patterns in standalone scratch files first) in [`AGENTS.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/AGENTS.md).

---

## Changes Made

### 1. Sanitizer & Marker Detection
- **[`src/lib/cleanArticleMarkdown.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/cleanArticleMarkdown.ts)**:
  - Added and exported `detectResidualChromeMarkers(cleanedMarkdown: string): string[]`.
- **[`src/lib/cleanArticleMarkdown.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/cleanArticleMarkdown.test.ts)**:
  - Added unit tests for `detectResidualChromeMarkers` covering slipped caption variants, clean prose, cleaned real article (#99), and other residual noise patterns.

### 2. Ingest Pipeline
- **[`src/ingest/fetchDigests.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/ingest/fetchDigests.ts)**:
  - Imported `cleanArticleMarkdown` and `detectResidualChromeMarkers`.
  - Added residual marker check for `fetchedVia === "direct"` articles, logging soft warnings to `errorSummary`.
- **[`src/ingest/fetchDigests.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/ingest/fetchDigests.test.ts)**:
  - Added test `f. Direct article with residual chrome markers records soft warning in errorSummary without failing`.

### 3. Agent Documentation
- **[`AGENTS.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/AGENTS.md)**:
  - Added conventions regarding Medium chrome soft warnings and regex scratch-script prototyping.

---

## Verification & QA Matrix

### Test Suite (`pnpm check`)
- Ran `pnpm check` (ESLint, TypeScript `tsc --noEmit`, Vitest):
  - **ESLint**: passed cleanly with 0 errors and 0 warnings.
  - **TypeScript**: passed cleanly with 0 type errors.
  - **Vitest**: all 17 test files passed (84/84 tests passed, including all 16 tests in `cleanArticleMarkdown.test.ts` and all 6 tests in `fetchDigests.test.ts`).

### Empirical Database Check
- Tested against all 8 direct-fetched articles in `medium-reader.db`:
  - 0 residual markers flagged on existing cleaned articles (0 false positives).
- Tested against synthetic variants:
  - Successfully detected `caption-prompt`, `reading-time`, `date-line`, `divider-line`, and `profile-link`.
