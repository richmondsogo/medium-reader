# Step 06f: Full First-Principles Image Handling Diagnosis Across Entire Database

## Summary
Executed Step 06f of `medium-reader` — an evidence-only empirical investigation of image handling across all 193 stored articles in `./data/medium-reader.db`. No production code was modified in this step.

Key findings:
1. **Client-Side Profile Isolation Ruled Out**:
   - Confirmed browser automation operates with a pristine test profile (`--user-data-dir="C:\Users\Richmond\.cache\chrome-devtools-mcp\chrome-profile"` with `--enable-automation`).
   - Profile `Default/Extensions` directory does not exist (`Test-Path` returned `False`).
   - DOM check: `hasChromeExtensions = false`, `window.chrome.runtime = undefined`. Browser extensions cannot interfere with image rendering in this environment.
   - Identified native browser `loading="lazy"` mechanics: offscreen images deep down long articles are legitimately deferred by Chromium until scrolled into view, which explains why unscrolled images report `complete: false` until scrolled near.
2. **Exhaustive Enumeration of Image URL Shapes**:
   - Total articles: 193 (98 contain markdown images, 95 contain 0 images).
   - Total markdown images: exactly 605 across the database.
   - Total HTML `<img ...>` tags: 0.
   - Categorized into 4 distinct URL shapes:
     - Shape 1 (`medium.com/img/medium/<size>/<hash>`): 531 images (87.77%) — matches `rewriteImageUrl` regex and rewrites to `miro.medium.com/v2/resize:fit:1400/<hash>`.
     - Shape 2 (`medium.com/img/<size>/<hash>`): 67 images (11.07%) — matches `rewriteImageUrl` regex and rewrites to `miro.medium.com/v2/resize:fit:1400/<hash>`.
     - Shape 3 (`miro.medium.com/v2/resize:.../<hash>`): 6 images (0.99%) — passes through unchanged.
     - Shape 4 (`miro.medium.com/v2/da:.../resize:.../<hash>`): 1 image (0.17%) — passes through unchanged.
     - Protocol-relative (`//...`): 0.
     - Host-less (`/img/...`): 0.
     - External non-Medium hosts: 0.
3. **Live HTTP GET Proof Per Shape & 100% Census**:
   - Raw `medium.com/img/...` URLs return HTTP 404 (`text/html; charset=utf-8`).
   - Rewritten URLs via `rewriteImageUrl()` return HTTP 200 OK with valid MIME types (`image/png`, `image/jpeg`).
   - **Full Database Census**: Probed all 605 rewritten image URLs via live HTTP GET:
     - **Status 200 OK**: 605 / 605 (100.0%)
     - **Status 4xx/5xx**: 0 / 605 (0.0%)
4. **GIF-Specific Investigation & Alternate Pattern Matrix**:
   - Discovered exactly 11 GIF images across 6 articles (Articles 7, 24, 117, 126, 168, 177).
   - When rewritten via current `rewriteImageUrl()` to `https://miro.medium.com/v2/resize:fit:1400/<hash>.gif`:
     - **All 11 out of 11 (100%) return HTTP 200 OK with `Content-Type: image/gif` and magic bytes `GIF89a`**.
     - Refuted the hypothesis that Miro resize proxy strips GIF animations: Medium explicitly serves the full animated GIF bytes when the hash includes `.gif`.
   - Tested 13 candidate CDN patterns against real GIF hashes: confirmed that `v2/resize:fit:1400`, `v2/resize:fit:700`, `v2/<hash>.gif`, `miro.medium.com/<hash>.gif`, and legacy `max/1400` all preserve `image/gif`, while omitting the `.gif` extension causes Miro to return 404 text/plain.
5. **External Host Audit**:
   - Zero external non-Medium images are embedded in markdown articles. Medium's platform re-hosts all uploaded content to its Miro CDN upon authoring.
   - 322 external domains exist in standard text hyperlinks (sources, citations, embeds) but none are broken image tags.

---

## Artifacts Generated
- **[`docs/notes/image-diagnosis-full.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/notes/image-diagnosis-full.md)**: Full first-principles diagnosis report including tables, live proof, and analysis.
- **[`docs/steps/step-06f.md`](file:///c:/Users/Richmond/Desktop/Codebase/medium-reader/docs/steps/step-06f.md)**: This step summary log.

---

## Verification & QA
- **`pnpm check`**:
  - ESLint: passed cleanly.
  - TypeScript (`tsc --noEmit`): passed cleanly.
  - Vitest: 16 test files passed (67/67 tests).
- **Code Stability**: No production or test code modified.
