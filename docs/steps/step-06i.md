# Step 06i: Resilient ArticleImage Retry, Strict Mode Safety & 'None' Alt Text

## Summary

Completed **Step 06i** for `medium-reader`: made `ArticleImage`'s retry and fallback state machine idempotent under React Strict Mode, verified the reproduction test-first using jsdom and React 19 test utilities, and sanitized Freedium's placeholder `"None"` alt text across both `<img>` and `ImageFallback`.

---

## 1. Diagnosis & Root Cause Analysis

### The Failure Mode
When an image URL was blocked in Chrome DevTools and the reader page (`/a/1`) was reloaded, the browser rendered the native broken-image icon alongside the text `"None"`, instead of transitioning to the intended "Image unavailable" fallback box.

### The Root Cause: Strict Mode Guard Ref Leak
1. In Next.js dev server mode (`next dev`), React runs in **Strict Mode**, executing effects twice on mount (mount -> simulated unmount -> remount).
2. When an image request is blocked or fails before hydration, `img.complete && img.naturalWidth === 0` is true on initial mount.
3. **Mount 1**: The pre-hydration detection effect runs `handleError()`. `handledAttemptRef.current` is set to `0`, and a 300ms timer is scheduled into `timerRef.current`.
4. **Simulated Unmount**: The effect cleanup runs `clearTimeout(timerRef.current)`, cancelling the 300ms timer. However, React Refs persist across simulated unmount/remount cycles, so `handledAttemptRef.current` remained `0`.
5. **Remount (Mount 2)**: The pre-hydration effect runs again on the remounted component, detects `img.complete && img.naturalWidth === 0`, and calls `handleError()`.
6. Inside `handleError()`:
   ```ts
   if (handledAttemptRef.current === retryCount) {
     return;
   }
   ```
   Because `handledAttemptRef.current` was `0` and `retryCount` was `0`, the function returned immediately.
7. **Result**: The timer was cancelled and never rescheduled. The component remained indefinitely on attempt 0 with the native broken image icon visible.

---

## 2. Test-First Reproduction

Using `@vitest-environment jsdom`, `createRoot`, and React 19's `act` with `vi.useFakeTimers()`, 5 lifecycle scenarios were added to [`src/components/article-image.test.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/components/article-image.test.tsx):
- **Scenario a**: error -> +300ms a NEW `<img>` node exists -> error -> +800ms another NEW node -> error -> fallback box present, no `<img>`. Total `<img>` mounts = 3.
- **Scenario b**: The same sequence wrapped in `<StrictMode>`.
- **Scenario c**: Mount-time `complete: true` and `naturalWidth: 0` check under `<StrictMode>` without error events dispatched.
- **Scenario d**: Error once on attempt 0, then success (load event) on attempt 1 -> no fallback, `<img>` remains.
- **Scenario e**: Unmount while retry timer is pending -> no state update, no leaked timer.

### Pre-Fix Failure Output
Against the unpatched code, **Scenario c** failed with 100% reproducibility:
```
FAIL  src/components/article-image.test.tsx > ArticleImage retry & fallback reproduction > scenario c: pre-hydration complete & naturalWidth === 0 in StrictMode
AssertionError: expected <img alt="Test" …(3)></img> not to be <img alt="Test" …(3)></img> // Object.is equality
 ❯ scratch-repro.test.tsx:168:22
    166|     const img2 = container.querySelector("img");
    167|     expect(img2).not.toBeNull();
    168|     expect(img2).not.toBe(img1);
       |                      ^
    169|     // Advance 800ms for retry 2
```

---

## 3. Strict Mode Safety Fix (Commit 1)

In [`src/components/article-image.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/components/article-image.tsx):
- Consolidated timer and guard cleanup into the effect tied to `[retryCount, handleError]`:
  ```tsx
  React.useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      handleError();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      handledAttemptRef.current = -1;
    };
  }, [retryCount, handleError]);
  ```
- Resetting `handledAttemptRef.current = -1` in cleanup ensures that if Strict Mode simulates an unmount, the subsequent mount effect is not blocked from scheduling its retry timer.
- All 10 tests passed; `pnpm check` was clean.
- **Commit**: `fix: make ArticleImage retry/fallback Strict Mode safe` (`d14d62e`).

---

## 4. Placeholder Alt Text "None" (Commit 2)

### Database Investigation
A standalone inspection script analyzed `contentMarkdown` across all rows in `data/medium-reader.db`:
- **Total images found**: 605
- **Images with `alt === "None"`**: **445** (73.6%)
This confirmed that Freedium serializes Python's `None` as the literal string `"None"`.

### Solution
- Added `sanitizeAlt(alt?: string)`:
  ```tsx
  export function sanitizeAlt(alt?: string): string | undefined {
    if (typeof alt !== "string") return undefined;
    const trimmed = alt.trim();
    if (trimmed === "None" || trimmed === "") return undefined;
    return alt;
  }
  ```
- Used `sanitizeAlt` in:
  - `ArticleImage`: passes cleaned alt down to `ResilientImage` and `ImageFallback`.
  - `ImageFallback`: if `sanitizeAlt(alt)` is undefined, omits caption line and uses `aria-label="Image unavailable"`.
  - `ResilientImage`: sets `alt={cleanAlt ?? ""}`, producing `alt=""` for decorative or missing alts rather than `alt="None"`.
- Added unit and lifecycle tests covering `sanitizeAlt`, `<img>` rendering with `alt=""`, and `<ImageFallback />` caption omission.
- **Commit**: `fix: ignore Freedium's placeholder 'None' alt text`.

---

## 5. Browser Verification

- Inspected `/a/1` via Chrome DevTools MCP:
  - Article loaded and rendered images properly.
  - Executed script in browser:
    ```js
    document.querySelectorAll("img[alt='None']").length === 0
    ```
    Confirmed zero elements with `alt="None"`.
- **Note on Network Blocking**:
  - Automated agent tools (DevTools MCP and Playwright) do not support dynamic request interception/blocking in this environment.
  - Therefore, live blocked-request behavior is validated via the human manual DevTools acceptance test (blocking request URL pattern and hard-reloading `/a/1`).
