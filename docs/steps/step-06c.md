# Step 06c: Rewrite Freedium Image URLs to Working CDN Pattern at Render Time

## Summary
Executed Step 06c of `medium-reader`:
1. **Empirical HTTP Pattern Verification**:
   - Before editing any project code, tested candidate `miro.medium.com` image endpoints (`max/1400`, `v2/resize:fit:700`, `v2/resize:fit:1400`, and direct hash) against representative hashes from the diagnosis report across PNGs, JPEGs with `@2x`, and extensionless hashes.
   - Discovered that `https://miro.medium.com/max/1400/<hash>` returns **HTTP 301 Moved Permanently**, redirecting to `https://miro.medium.com/v2/resize:fit:1400/<hash>`.
   - Verified that `https://miro.medium.com/v2/resize:fit:1400/<hash>` directly returns **HTTP 200 OK** with valid image content types (`image/png`, `image/jpeg`) without any redirect overhead.
   - Identified that across the SQLite database of 193 articles, 531 broken URLs follow `https://medium.com/img/medium/700/<hash>` and 67 follow `https://medium.com/img/700/<hash>` (598 total broken images), while 7 images are already valid `miro.medium.com` URLs from direct-fetched articles.
2. **URL Rewrite Module**:
   - Implemented `rewriteImageUrl(url: string): string` in `src/lib/rewriteImageUrl.ts`.
   - Matches `^https?://medium\.com/img/(?:medium/)?\d+/(.+)$` and rewrites to `https://miro.medium.com/v2/resize:fit:1400/${hash}`.
   - Passes through already-valid `miro.medium.com` URLs, external image URLs, local paths, and empty strings untouched.
   - Added unit test suite in `src/lib/rewriteImageUrl.test.ts` covering all cases (7 tests, all passing).
3. **Reader Pane Render-Time Integration**:
   - Updated `src/app/(reader)/a/[id]/page.tsx`'s `<ReactMarkdown>` components to override the `img` component:
     ```tsx
     img: ({ node, src, alt, ...props }) => (
       // eslint-disable-next-line @next/next/no-img-element
       <img
         src={typeof src === "string" ? rewriteImageUrl(src) : undefined}
         alt={alt ?? ""}
         loading="lazy"
         className="rounded-md max-w-full h-auto my-6"
         {...props}
       />
     )
     ```
   - Zero database modification was performed; the fix operates dynamically at render time and retroactively fixes all 193 articles in the database.
4. **Visual & Browser Verification**:
   - Verified in Chrome via DevTools MCP on `http://localhost:3000`:
     - **Article #1** (`/a/1`): 11 Freedium images now render with full natural dimensions (e.g. 1400x698, 1008x246) instead of broken image placeholders. Captured viewport screenshot.
     - **Article #4** (`/a/4`): 19 Freedium images (including mathematical equation formulas and Euler's portrait) load crisply with natural dimensions. Captured viewport screenshot.
     - **Article #99** (`/a/99`): Direct-fetched author avatar (`https://miro.medium.com/v2/resize:fill:64:64/...`) passes through untouched and renders normally at 64x64. Captured viewport screenshot.

---

## Changes Made

### 1. URL Rewrite Helper & Unit Tests
- **[`src/lib/rewriteImageUrl.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/rewriteImageUrl.ts)**:
  - Added pure function `rewriteImageUrl` matching both `medium.com/img/medium/<size>/<hash>` and `medium.com/img/<size>/<hash>`.
  - Maps matching hashes to `https://miro.medium.com/v2/resize:fit:1400/${hash}`.
  - Returns non-matching URLs unchanged.
- **[`src/lib/rewriteImageUrl.test.ts`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/lib/rewriteImageUrl.test.ts)**:
  - 7 unit tests testing both Freedium path shapes, extensionless hashes, `@2x.jpeg` hashes, `miro.medium.com` passthrough, external URL passthrough, and relative/empty URL handling.

### 2. Reader Pane Markdown Renderer
- **[`src/app/(reader)/a/[id]/page.tsx`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/src/app/(reader)/a/[id]/page.tsx)**:
  - Imported `rewriteImageUrl`.
  - Added `img` override to `ReactMarkdown`'s `components` map with `loading="lazy"` and clean responsive styling (`rounded-md max-w-full h-auto my-6`).
  - Safe type-check `typeof src === "string"` to adhere to Next.js strict TypeScript definitions.

---

## Verification & QA Matrix

### Test Suite (`pnpm check`)
- Ran `pnpm check` (ESLint, TypeScript `tsc --noEmit`, Vitest):
  - **ESLint**: passed cleanly with zero warnings or errors.
  - **TypeScript**: passed cleanly with zero type errors.
  - **Vitest**: all 16 test files passed (67/67 tests passed, including all 7 `rewriteImageUrl.test.ts` tests).

### Live Browser Verification
| Article ID | Source Mode | Expected Result | Verified Result | Image Details |
|---|---|---|---|---|
| #1 | `freedium-mirror` | Images rewritten from `medium.com/img/...` to `miro.medium.com/v2/resize:fit:1400/...` | ✅ **PASS** | 11 images verified; loaded with `naturalWidth: 1400`, `naturalHeight: 698`, etc. |
| #4 | `freedium-mirror` | Math formula images & portrait load without broken icon | ✅ **PASS** | 19 images verified; portrait and equations rendered with `naturalWidth > 0`. |
| #99 | `direct` | Unmodified `miro.medium.com/v2/resize:fill:64:64/...` passthrough | ✅ **PASS** | Avatar loaded cleanly with `naturalWidth: 64`, `naturalHeight: 64`. |
