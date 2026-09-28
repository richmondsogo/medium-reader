# Step 06k: Subtitle Guard Fixes, Database Repair, and Reader UI Integration

## Summary

Completed **Step 06k** for `medium-reader`:
1. Factored extraction guards into an exported pure function `validateSubtitle` in [`src/ingest/extractSubtitle.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/ingest/extractSubtitle.ts).
2. Added `boilerplate` and `truncated` guards and resolved the duplicate-of-body containment failure on markdown links.
3. Created a throwaway repair script [`scripts/revalidate-subtitles.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/scripts/revalidate-subtitles.ts), executed dry run (identifying exactly rows #93 and #191), applied clearing of those two invalid rows, confirmed 0 changed rows, and cleaned up the script.
4. Executed the precondition report verifying clean database state: 0 NULL, 56 `""`, 137 non-empty, 0 boilerplate/ellipsis, 0 mojibake markers.
5. Created pure helper `getDisplaySubtitle(article)` with unit tests and wired it into [`src/app/(reader)/a/[id]/page.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/%28reader%29/a/%5Bid%5D/page.tsx), rendering `ArticleSubtitle` only when a trimmed subtitle exists and never falling back to snippet.
6. Verified live rendering in the browser across `/a/1`, `/a/99`, `/a/4`, `/a/93`, and `/a/191`, capturing screenshots for #1 and #93.
7. Updated `AGENTS.md` Conventions with the PowerShell output piping encoding gotcha.

---

## 1. Investigation: Article #191 and #93

### Findings
- **Article #93**:
  - Title: `"Building a Complete Personal Harness: LLM Wiki + Developer’s Second Brain in Obsidian"`
  - Stored Candidate: `"“” is published by Roan Brasil Monteiro."`
  - Cause: Medium default story description pattern (`"“<Title>” is published by <Author>."`) emitted when authors do not author a custom subtitle.
- **Article #191**:
  - Title: `"Why we switched to the GCP Secret Manager API in Spring Boot and What we learned?"`
  - Stored Candidate: `"In my previous article, I explained how to integrate GCP Secret Manager with a Spring Boot application using the…"`
  - First 400 chars of cleaned body markdown:
    ```markdown
    > In my [previous article](https://medium.com/stackademic/how-to-add-gcp-secrets-in-a-spring-boot-application-using-the-gcp-secret-manager-dependency-6e4b43bd4afb), I explained how to integrate GCP Secret Manager with a Spring Boot application using the `spring-cloud-gcp-starter-secretmanager` dependency. It provided a clean, declarative approach to injecting secrets directly into `@Value` annotat
    ```
  - Root Cause:
    The previous duplicate-of-body check ran `toAlphanumericLower` on the raw markdown slice `(bodyMarkdown ?? "").slice(0, 800)`. Because the markdown body starts with a link `[previous article](https://medium.com/...)`, the entire URL string was included in the alphanumerics-only body stream directly between `inmypreviousarticle` and `iexplainedhowtointegrate`. The candidate text contained no URL, so `bodyAlpha.includes(bodyCheckAlpha)` evaluated to `false`.

### Solution
- Factored guards into pure function `validateSubtitle`.
- Stripped markdown syntax (images removed, links unwrapped to link text, formatting tokens `#`, `*`, `_`, `~`, `>`, `` ` `` removed) prior to the alphanumerics containment check.
- Added a `truncated` guard rejecting candidates ending in `"…"` (U+2026) or `"..."` after trim.
- Added a `boilerplate` guard rejecting candidates matching `/\bis published by\b.+\.$/i`.
- Preserved legitimate subtitles containing `"published"` and `"by"`.

---

## 2. Checkpoint 1: Guard Fixes and Tests

- Implemented `validateSubtitle(params: ValidateSubtitleParams): ExtractSubtitleResult` with strict ordered guards:
  1. `missing`: Empty / whitespace-only string -> `{ subtitle: "", reason: "missing" }`.
  2. `duplicate-of-title`: Alphanumeric match with title -> `{ subtitle: "", reason: "duplicate-of-title" }`.
  3. `boilerplate`: Matches `/\bis published by\b.+\.$/i` -> `{ subtitle: "", reason: "boilerplate" }`.
  4. `truncated`: Ends in `"…"` (U+2026) or `"..."` after trim -> `{ subtitle: "", reason: "truncated" }`.
  5. `too-long`: Length exceeds 200 characters -> `{ subtitle: "", reason: "too-long" }`.
  6. `duplicate-of-body`: Markdown stripped from `bodyMarkdown`, then alphanumerics containment check in first 800 chars -> `{ subtitle: "", reason: "duplicate-of-body" }`.
- In [`src/ingest/extractSubtitle.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/ingest/extractSubtitle.test.ts):
  - Added tests for `boilerplate` matching #93.
  - Added tests for legitimate subtitles with words "published" and "by" (accepted as `"ok"`).
  - Added tests for `truncated` ending in Unicode ellipsis or ASCII dots.
  - Added test using #191's verbatim body excerpt with markdown links and code formatting confirming `duplicate-of-body` detection.
- **Commit 1**: `fix: reject boilerplate and truncated subtitle candidates` (`f7a402d`).

---

## 3. Checkpoint 2: Repair Script Execution

Created throwaway script `scripts/revalidate-subtitles.ts` to revalidate all stored non-empty subtitles against `validateSubtitle`:
- **Dry Run Output**:
  ```text
  === Revalidating Stored Subtitles ===
  Mode: DRY RUN (read-only)
  [#93] reason: boilerplate
    old: "“” is published by Roan Brasil Monteiro."
  [#191] reason: truncated
    old: "In my previous article, I explained how to integrate GCP Secret Manager with a Spring Boot application using the…"

  Total rows that would change: 2
  ```
- **Apply Mode**:
  Ran with `--apply`. Cleared subtitle for rows #93 and #191 (`setArticleSubtitle(db, id, "")`).
- **Post-Apply Verification**:
  Re-ran dry run confirming `Total rows that would change: 0`.
- Deleted `scripts/revalidate-subtitles.ts`.

---

## 4. Part 1: Precondition Report

Executed throwaway precondition script on `data/medium-reader.db`:
```text
=== Precondition Report ===
Total articles: 193
subtitle NULL: 0
subtitle '': 56
subtitle non-empty: 137
non-empty containing 'is published by': 0
non-empty ending with ellipsis: 0
non-empty with mojibake markers: 0
```
All preconditions met (0 NULL, 0 boilerplate/ellipsis, 0 mojibake).

---

## 5. Part 1: Reader UI Integration & Browser Verification

### Pure Helper & Page Update
- Created [`src/lib/getDisplaySubtitle.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/getDisplaySubtitle.ts) and unit tests in [`src/lib/getDisplaySubtitle.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/getDisplaySubtitle.test.ts):
  - Returns trimmed string when valid.
  - Returns `null` for `null`, `undefined`, `""`, or whitespace-only.
  - Never falls back to snippet.
- In [`src/app/(reader)/a/[id]/page.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/%28reader%29/a/%5Bid%5D/page.tsx):
  - Replaced snippet-based subtitle rendering with `getDisplaySubtitle(article)`.
  - Rendered `<ArticleSubtitle>` only when non-null.

### Browser Verification
Inspected running Next.js application on `http://localhost:3000`:
- `/a/1`: Rendered full subtitle `"Checklists are boring AF, and that’s exactly why they work"`. Screenshot captured.
- `/a/99`: Rendered full subtitle `"AI may need more than better models. It may need a living human memory built from observation, expertise, disagreement, and context."`.
- `/a/4`: No subtitle rendered (`allPs: []`), title-to-byline spacing clean.
- `/a/93`: No subtitle rendered (`allPs: []`), boilerplate gone, title-to-byline spacing clean. Screenshot captured.
- `/a/191`: No subtitle rendered (`allPs: []`), truncated body excerpt gone, title-to-byline spacing clean.
- **Commit 2**: `feat: show full article subtitle in reader` (`98805c0`).

---

## 6. Conventions Update

Added the following convention to [`AGENTS.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/AGENTS.md):
```markdown
- PowerShell re-decodes piped output with the console code page (437), so
  piping Node output through Tee-Object or similar displays UTF-8 as mojibake
  (’ as ΓÇÖ). Stored data is unaffected. Set [Console]::OutputEncoding =
  [System.Text.Encoding]::UTF8 before piping, or verify with escaped output.
```
- **Commit 3**: `docs: note PowerShell piping encoding gotcha, step 06k`.
