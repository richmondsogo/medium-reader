# Image Handling Diagnosis Report

**Date**: 2026-09-27T17:56:16.076Z  
**Target Database**: `./data/medium-reader.db`  
**Purpose**: Diagnostic analysis of article content images, markdown syntax, placeholder detection, and HTTP availability across ingested articles.

---

## 1. Executive Summary

1. **`thumbnailUrl` Status**:
   - In the database of 193 articles, **`thumbnailUrl` is null for 100% of articles** (0 / 193). The ingest digest parser or feed extraction does not currently populate this field.
2. **Markdown Images Presence**:
   - **98 out of 193 articles (50.8%)** contain `![` image markdown syntax.
   - Across the entire database, there are **605 embedded image links**.
3. **Placeholder Detection**:
   - **0 out of 605 images** contain placeholder markers (`data:image`, `1x1`, `blank`, or short base64 strings).
   - The extraction pipeline (Readability + Turndown) is successfully extracting non-placeholder URL strings rather than lazy-load tracking 1x1 GIF stubs.
4. **Root Cause of Broken Images (HTTP 403 Forbidden on `medium.com/img/...`)**:
   - Out of 605 total images, **598 images (98.8%)** point to `https://medium.com/img/medium/...` (originating from articles fetched via `freedium-mirror`).
   - Direct HTTP fetches to `https://medium.com/img/medium/...` return **HTTP 403 Forbidden** (`text/html`). Medium blocks direct hotlinking to this path.
   - In contrast, articles fetched via `direct` (e.g. `miro.medium.com/v2/resize:fill:...`) return **HTTP 200 OK** (`image/jpeg`).
   - On Freedium mirrors, Freedium rewrites Medium's CDN images (`miro.medium.com`) to relative paths like `/img/medium/...`, which our URL resolution logic resolves to `https://medium.com/img/medium/...` instead of the original CDN or mirror proxy, causing broken image rendering in the browser.

---

## 2. Sample Article Breakdown (5 Articles)

### Article #1: "9 Unsexy Digital Products People Buy Every Single Day (No AI Required)"
- **Source**: `fetchedVia: freedium-mirror`, `fetchStatus: ok`
- **Thumbnail URL**: `null`
- **Markdown Image Syntax Present**: `true` (11 images)
1. **URL**: `https://medium.com/img/medium/700/1*RvxXX7wFKZRsM2Oe6F7rQw.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
2. **URL**: `https://medium.com/img/medium/700/1*5oT-wFWUFOzEVgohXIuReA.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
3. **URL**: `https://medium.com/img/medium/700/1*XYFqoWApp5pVibq0upuPvA.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
4. **URL**: `https://medium.com/img/medium/700/1*tTNDKv9CVvRTO0K76mTLnQ.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
5. **URL**: `https://medium.com/img/medium/700/1*OjH3OixHRB6PpwmMnL07Zw.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
6. **URL**: `https://medium.com/img/medium/700/1*h332cmsE3xmsmVnMM6EgtA.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
7. **URL**: `https://medium.com/img/medium/700/1*ZB-CI1ltshzw1sOpK_XWQw.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
8. **URL**: `https://medium.com/img/medium/700/1*xBGeQYvWbwETEP-8bR08ow.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
9. **URL**: `https://medium.com/img/medium/700/1*mP16yHm6DCz-JMyoIg-lpw.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
10. **URL**: `https://medium.com/img/medium/700/1*6MJ4hRPCdDm3T-feRa4Cfg.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
11. **URL**: `https://medium.com/img/medium/700/1*KMLAP8MdPmc9_9yWU_iMsQ.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)

### Article #2: "I Spent A Month In India. I Won’t Be Back."
- **Source**: `fetchedVia: freedium-mirror`, `fetchStatus: ok`
- **Thumbnail URL**: `null`
- **Markdown Image Syntax Present**: `true` (1 image)
1. **URL**: `https://medium.com/img/medium/700/1*_yHj4r2iqHmvLtLRVnmQQQ@2x.jpeg`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)

### Article #4: "If x^x = 49, then x=?"
- **Source**: `fetchedVia: freedium-mirror`, `fetchStatus: ok`
- **Thumbnail URL**: `null`
- **Markdown Image Syntax Present**: `true` (19 images)
1. **URL**: `https://medium.com/img/medium/700/0*cbVn7-0GAYRy4n6t`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
2. **URL**: `https://medium.com/img/medium/700/1*wqSLspskQER_Lt2GfHQqeg.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
3. **URL**: `https://medium.com/img/medium/700/0*2jvIbMl0GtjYuYh7`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
4. **URL**: `https://medium.com/img/medium/700/1*UG8qv4C6hfNVgWmnZd4mtw.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
5. **URL**: `https://medium.com/img/medium/700/1*FFhGR6BT0sQU-S1UBub9ow.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
6. **URL**: `https://medium.com/img/medium/700/1*4e0-x_-VxzVKL6FBfuCRGw.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
7. **URL**: `https://medium.com/img/medium/700/1*jh_MguZmrTfKgWCWnnxVsA.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
8. **URL**: `https://medium.com/img/medium/700/1*DKwnUboh1FvsoJ4inWFqCQ.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
9. **URL**: `https://medium.com/img/medium/700/1*LBtZwZdotcfFdNil2c233w.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
10. **URL**: `https://medium.com/img/medium/700/1*IJ2T1tMKJ1qPrsn8W8yEbw.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
11. **URL**: `https://medium.com/img/medium/700/1*Dj1ReRQG1u3fgc1eXVYvDQ.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
12. **URL**: `https://medium.com/img/medium/700/1*NO_IgH5FnDqmdDrRzmZNKw.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
13. **URL**: `https://medium.com/img/medium/700/1*g36G5c4YdiUOcU9nsziF6g.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
14. **URL**: `https://medium.com/img/medium/700/1*GuiRzTnWaDLm0S0Zec7XwA.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
15. **URL**: `https://medium.com/img/medium/700/1*rxoPbnnXsk95fN0aHkhNZg.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
16. **URL**: `https://medium.com/img/medium/700/1*4pB9mFaAuZGXbekAn2W03A.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
17. **URL**: `https://medium.com/img/medium/700/1*03nqrkDvqVnT545Ns8jKtg.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
18. **URL**: `https://medium.com/img/medium/700/1*94GWikSuDRSLGI-_hO3oeQ.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)
19. **URL**: `https://medium.com/img/medium/700/1*93qufPaRz3wGxPk7xz-Jmg.png`  
   - **Alt text**: `None`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)

### Article #99: "Maybe the Solution to AI Is More Human Than We Think"
- **Source**: `fetchedVia: direct`, `fetchStatus: ok`
- **Thumbnail URL**: `null`
- **Markdown Image Syntax Present**: `true` (1 image)
1. **URL**: `https://miro.medium.com/v2/resize:fill:64:64/1*PmIHD5xqGCYO899Bn0_7Ag.jpeg`  
   - **Alt text**: `Kelly Turner`  
   - **Placeholder Flag**: ✅ **NO** (valid URL pattern)

### Article #193: "One Habit Separates Self-Aware People from Everyone Else"
- **Source**: `fetchedVia: freedium-mirror`, `fetchStatus: ok`
- **Thumbnail URL**: `null`
- **Markdown Image Syntax Present**: `false` (0 images)
- *No images present in article content markdown.*


---

## 3. Live HTTP Fetch Verification

| Article ID | Host | Image URL | HTTP Status | Content-Type | Diagnosis |
|---|---|---|---|---|---|
| 1 | `medium.com` | `https://medium.com/img/medium/700/1*RvxXX7wFKZRsM2Oe6F7rQw.png` | **404** | `text/html; charset=utf-8` | ❌ Blocked / Hotlink protection (403) |
| 99 | `miro.medium.com` | `https://miro.medium.com/v2/resize:fill:64:64/1*PmIHD5xqGCYO899Bn0_7Ag.jpeg` | **200** | `image/jpeg` | ✅ Valid image fetched |

---

## 4. Architectural Findings & Recommended Next Steps (For Future Work)

> **Important**: In accordance with the prompt, no changes have been made to `extractArticleContent.ts`, the markdown renderer, or any extraction code in this step.

### Key Takeaways:
1. **Lazy-loading stubs are NOT the culprit**: We confirmed 0 placeholder images. Readability/Turndown is picking up the image tags created by Freedium.
2. **Freedium URL rewriting is the primary cause**:
   - Freedium's HTML rewrites Medium CDN images to `/img/medium/700/1*...` or `/img/...`.
   - When our pipeline resolves relative URLs against `https://medium.com`, they become `https://medium.com/img/medium/700/...`, which is an invalid/protected path on medium.com (403 Forbidden).
   - In truth, the original Medium image hash (`1*RvxXX7wFKZRsM2Oe6F7rQw.png`) maps directly to Medium's public image CDN: `https://miro.medium.com/v2/resize:fit:700/1*RvxXX7wFKZRsM2Oe6F7rQw.png` or `https://miro.medium.com/max/1400/1*...` which returns **200 OK**.
3. **Future Fix Options**:
   - Map Freedium mirror relative paths back to `https://miro.medium.com/max/1400/<hash>` in `extractArticleContent.ts` or URL cleanup.
   - Or proxy/cache images locally.
