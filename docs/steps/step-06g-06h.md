# Step 06g-06h: Resilient Image Loading & Subtitle Source Discovery

## Summary

Completed **Step 06g** (resilient image loading) and **Step 06h** (subtitle source discovery) for `medium-reader`.

---

## Part A (Step 06g) — Resilient Image Loading

### 1. Diagnosis
- **Core issue identified**: Pre-hydration failure race condition. Next.js App Router renders the article on the server. If an image fails to load before client-side hydration completes, the native DOM `error` event fires on the element before React attaches its synthetic `onError` event handler. Consequently, React's `onError` never triggers, leaving failed images broken without a fallback.
- **Back-arrow check**: Confirmed that the mobile back link (`ArrowLeft` replacing `ArrowUpRight`) was already committed in `4059b301`; no pending or uncommitted back-arrow changes existed.

### 2. Implementation
- **`src/components/article-image.tsx`**:
  - Maintained retry schedule constants: `RETRY_DELAYS = [300, 800] as const`, `MAX_IMAGE_RETRIES = 2`.
  - Maintained key and delay functions: `getImageRetryKey(src, retryCount)` and `getNextRetryDelay(currentRetryCount, maxRetries)`.
  - Added `imgRef = React.useRef<HTMLImageElement | null>(null)` to inspect DOM state directly upon mounting.
  - In a mount/attempt `useEffect`, added:
    ```tsx
    if (img.complete && img.naturalWidth === 0) {
      handleError();
    }
    ```
    This catches pre-hydration or synchronous failures immediately and enters the retry schedule.
  - Guarded against duplicate trigger invocations within the same attempt using `handledAttemptRef`.
  - On retry, remounts the `<img />` with `key={getImageRetryKey(rewrittenSrc, retryCount)}` to trigger a clean network request.
  - On retry exhaustion, renders an unobtrusive `ImageFallback` box styled with `border border-border/60 bg-muted/20`, Lucide's `ImageOff` icon, and text wrapped in `<Meta as="span">` per `typography.tsx` rules.
- **`src/app/(reader)/a/[id]/page.tsx`**:
  - Wired `ArticleImage` into ReactMarkdown's `img` override.
  - Stripped react-markdown's non-serializable `node` prop.
  - Pre-applied `rewriteImageUrl(src)`.
- **`src/components/article-image.test.tsx`**:
  - Added unit tests for retry key generation, delay progression and exhaustion, fallback accessibility attributes (`role="img"`, `aria-label`), and SSR static markup.

### 3. Verification & Evidence
- **Tool Check**: MCP browser tools (`chrome-devtools-mcp` and `playwright`) do not expose dynamic network request blocking/interception APIs (e.g. `Network.setBlockedURLs`). Per requirement A2, this limitation is explicitly noted.
- **Live Dev Server Verification**:
  - Navigated to `http://localhost:3000/a/1`.
  - Inspected images via CDP: first image resolved with `complete: true, naturalWidth: 1400, naturalHeight: 698`.
  - Captured live screenshot saved to `docs/screenshots/step-06g-article-1-loaded.png`.
- **Manual DevTools Verification Steps**:
  1. Open DevTools in browser (`F12`).
  2. Press `Ctrl+Shift+P` -> type "Show Network request blocking" -> Enter.
  3. Enable blocking and add pattern `*RvxXX7wFKZRsM2Oe6F7rQw*` (or a deep image pattern).
  4. Hard reload (`Ctrl+F5`).
  5. Observe 3 requests (1 initial + 2 retries), followed by the bordered "Image unavailable" fallback box rendering cleanly.
- **Commit**: `feat: wire resilient ArticleImage into reader, handle pre-hydration failures` (`fbf9328`).

---

## Part B (Step 06h) — Subtitle Source Discovery (Discovery Only)

### 1. B1: Database-Wide Snippet Statistics (193 Articles)
- **Total Articles**: 193
- **Snippets ending with an ellipsis (`…`)**: 146 (75.6%)
- **Snippets without ellipsis**: 47 (24.4%)
- **Min length**: 21 chars | **Max length**: 55 chars | **Average length**: 48.85 chars
- **Hard cap**: Exactly 55 characters across all 193 articles.

### 2. B2: Candidate Sources for 3 Target Articles (Direct & Freedium)
Tested Article #99 (`direct`) and Articles #1 & #2 (`freedium-mirror`):
- **Direct Medium HTML**:
  - `og:description` provides the **exact, complete ground truth subtitle** for all articles.
  - `meta[name="description"]` is unreliable (contains SEO marketing copy or concatenated title+body text).
- **Freedium Mirror HTML**:
  - `meta[name="description"]` provides the **exact, complete ground truth subtitle** (Freedium mirrors Medium's `og:description` into its `meta[name="description"]`).
  - `og:description` is stripped by Freedium.
- **Combined Rule**:
  `subtitle = html.match(og:description) || html.match(meta[name="description"])`

### 3. B3: Stored Markdown First-Lines & "Lift from Body" Audit
- Tested first 5 non-blank lines of stored markdown for Articles #99, #1, and #2:
  - Article #99: Line 2 is an author epigraph/hook (`_I thought I was building a library..._`), not the subtitle.
  - Article #1: Real subtitle (*"Checklists are boring AF, and that’s exactly why they work"*) is completely absent from stored markdown.
  - Article #2: Real subtitle (*"India was always the country I wanted to visit the most"*) is completely absent from stored markdown.
- **Database-wide scan**:
  - In **78.2% of articles (151/193)**, the subtitle is completely missing from the stored body.
  - In the **21.8% (42/193)** where the first line matches the snippet, the author never wrote a subtitle—the digest email grabbed the opening sentence of the article.
  - **Verdict on "Lift from body"**: Disproven and rejected.

### 4. B5: Recommendations
- **Option (c) with Phased Backfill**:
  - Add a dedicated `subtitle` column to SQLite schema.
  - Populate during ingest from `og:description` (direct) / `meta[name="description"]` (Freedium).
  - Run a one-time backfill script across existing 193 articles (~4.8 minutes at 1.5s rate limits).

---

## Artifacts Generated
- **[`docs/notes/subtitle-source.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/notes/subtitle-source.md)**: Full subtitle source discovery report.
- **[`docs/steps/step-06g-06h.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/steps/step-06g-06h.md)**: This step summary log.
