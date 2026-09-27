# Step 06d: Strip Leftover Medium UI Chrome & Duplicate Titles at Render Time

## Summary
Executed Step 06d of `medium-reader`:
1. **Empirical Chrome Leakage & Duplicate Title Scan**:
   - Built and ran [`scripts/inspect-chrome-leakage.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/scripts/inspect-chrome-leakage.ts) across all 193 stored articles.
   - Identified that **all 8 direct-fetched articles** (IDs: 99, 112, 122, 146, 159, 170, 171, 184) contained leftover Medium web UI chrome captured into `contentMarkdown` during initial extraction.
   - Verified that **0 of the 185 `freedium-mirror` articles** contain this leading chrome block.
   - Examined the first non-blank lines against stored `title` fields across all 8 direct articles:
     - Article #159 contained a duplicate title leak (`**Mileu of memories**`).
     - Articles #122, #170, and #184 contained author subtitles formatted with setext underlines (`---`).
     - Articles #99, #112, #146, and #171 opened with chrome noise (caption prompts or avatar links).
2. **Render-Time Sanitizer (`cleanArticleMarkdown`)**:
   - Implemented `cleanArticleMarkdown(markdown: string, title?: string | null): string` in [`src/lib/cleanArticleMarkdown.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/cleanArticleMarkdown.ts).
   - Operates purely at **render time** before passing content to `ReactMarkdown` in the reader pane; stored SQLite data remains untouched and the fix applies retroactively across all articles with zero database migration or re-ingestion.
   - Sanitizes:
     - **Caption instruction**: Removes literal `"Press enter or click to view image in full size"` prompts wherever they appear.
     - **Duplicate title**: Strips leading lines matching the article's own title (including markdown headers/bolding and setext underlines).
     - **Profile link unwrap**: Unwraps author profile links (`medium.com/@<handle>` or `<handle>.medium.com`), dropping the redundant link wrapper that duplicates our reader's byline while preserving the nested image/text inside.
     - **Duplicate reading time**: Strips isolated `"N min read"` lines within the leading section.
     - **Adjacent date line**: Strips standalone absolute (`Sep 16, 2026`) and relative (`5 days ago`) date lines within the leading section.
     - **Stray divider line**: Strips standalone `\--` or `--` lines within the leading section.
     - **Whitespace normalization**: Collapses runs of excessive blank lines left behind by removed chrome and trims leading whitespace.
   - Strictly conservative: does NOT touch real prose mentioning dates, hyphens, reading times, legitimate external links, or Medium story links (`medium.com/@<author>/<slug>`).
3. **Comprehensive Unit Test Suite**:
   - Created [`src/lib/cleanArticleMarkdown.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/cleanArticleMarkdown.test.ts) covering all 6 rules independently, verbatim raw blocks from Articles #99, #112, and #122, and negative regression guards (12/12 tests passing).
4. **Live Browser Verification & Screenshots**:
   - Reloaded articles #99, #112, #122, and #159 on `http://localhost:3000`.
   - Verified that all chrome noise, caption prompts, and duplicate titles are completely gone and articles open cleanly into author prose.
   - Captured before and after screenshots for #99 and #122.

---

## Changes Made

### 1. Diagnostic Script
- **[`scripts/inspect-chrome-leakage.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/scripts/inspect-chrome-leakage.ts)**:
  - Scans database for caption prompts, profile links, mid-content reading times, and leading divider lines, reporting breakdown by `fetchedVia` and raw sample snippets.

### 2. Sanitizer Module & Unit Tests
- **[`src/lib/cleanArticleMarkdown.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/cleanArticleMarkdown.ts)**:
  - Pure function `cleanArticleMarkdown(markdown, title)` applying the 6 conservative cleanup rules.
- **[`src/lib/cleanArticleMarkdown.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/cleanArticleMarkdown.test.ts)**:
  - 12 unit tests verifying each rule in isolation, end-to-end cleaning on real articles (#99, #112, #122), and negative regression tests for legitimate prose.

### 3. Reader Pane Integration
- **[`src/app/(reader)/a/[id]/page.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/a/[id]/page.tsx)**:
  - Imported `cleanArticleMarkdown` from `@/lib/cleanArticleMarkdown`.
  - Passed `cleanArticleMarkdown(article.contentMarkdown, article.title)` to `<ReactMarkdown>`.

---

## Verification & QA Matrix

### Test Suite (`pnpm check`)
- Ran `pnpm check` (ESLint, TypeScript `tsc --noEmit`, Vitest):
  - **ESLint**: passed cleanly with 0 errors and 0 warnings.
  - **TypeScript**: passed cleanly with 0 type errors.
  - **Vitest**: all 17 test files passed (79/79 tests passed, including all 12 tests in `cleanArticleMarkdown.test.ts`).

### Live Browser Verification
| Article ID | Title | Patterns Removed | Verified State |
|---|---|---|---|
| **#99** | *Maybe the Solution to AI Is More Human Than We Think* | Caption prompt, profile URL wrapping avatar, `15 min read`, `Sep 16, 2026`, `\--` | Opens cleanly with unwrapped author avatar and opening line: `_I thought I was building a library..._` |
| **#112** | *Why Your Best People Leave Quietly, Not Loudly* | Profile URL wrapping avatar, `4 min read`, `Sep 16, 2026`, `\--`, mid-article caption prompt | Opens cleanly with unwrapped author avatar and opening prose: `By the time someone hands in their resignation...` |
| **#122** | *Stop Setting Goals Without Direction* | Profile URL wrapping avatar, `4 min read`, `Sep 18, 2026`, `\--`, caption prompt | Preserves author subtitle `Why ambition fails without a life strategy`, unwraps avatar, begins cleanly with photo credit |
| **#159** | *Mileu of memories* | Duplicate bold title `**Mileu of memories**`, caption prompt | Opens cleanly with photo credit and poem text |

### Screenshots
- **Article #99**:
  - Before: [`docs/screenshots/step-06d-article-99-before.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06d-article-99-before.png)
  - After: [`docs/screenshots/step-06d-article-99-after.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06d-article-99-after.png)
- **Article #122**:
  - Before: [`docs/screenshots/step-06d-article-122-before.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06d-article-122-before.png)
  - After: [`docs/screenshots/step-06d-article-122-after.png`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/screenshots/step-06d-article-122-after.png)
