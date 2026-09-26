# Fetch Behavior Discovery

During Step 3A, we ran controlled test fetches against Medium and Freedium URLs. Here are our findings:

## a. Fixture Summaries

- **`free-direct`**
  - **HTTP Status:** 200
  - **Content-Length:** ~240 KB
  - **Elapsed Time:** ~4.2s
  - **Result:** Full article text (~9500 characters).

- **`member-direct`**
  - **HTTP Status:** 200
  - **Content-Length:** ~141 KB
  - **Elapsed Time:** ~1.2s
  - **Result:** Truncated/paywalled page. The article text stops abruptly after about 1300 characters (~200 words).

- **`member-freedium`**
  - **HTTP Status:** 0 (fetch failed)
  - **Elapsed Time:** ~250ms
  - **Result:** Request failed completely (network error).

- **`member2-direct`**
  - **HTTP Status:** 200
  - **Content-Length:** ~131 KB
  - **Elapsed Time:** ~550ms
  - **Result:** Truncated/paywalled page.

- **`member2-freedium`**
  - **HTTP Status:** 0 (fetch failed)
  - **Elapsed Time:** ~200ms
  - **Result:** Request failed completely (network error).

- **`member-freedium-mirror`**
  - **HTTP Status:** 200
  - **Content-Length:** ~62 KB
  - **Elapsed Time:** ~1.3s
  - **Result:** Full article text (~1200 words).

## b. Heuristics for Truncation/Paywall (`member-direct`)

A direct fetch to a member-only URL returns a 200 OK status, but the HTML body lacks the full story. The most reliable technical indicators of this state in the HTML are:

1. **JSON State Flag:** The `window.__MIDDLEWARE_STATE__` or Apollo state contains the property `"isLockedPreviewOnly":true`. This is an extremely robust programmatic signal.
2. **Text Marker:** The presence of a `<p class="...">Member-only story</p>` tag near the top.

## c. Freedium Payload Analysis

- **Full text?** Yes, the `member-freedium-mirror` fixture contains the full article content (roughly 1200 words), avoiding the truncation seen in the direct fetch.
- **Leftover Chrome:** The page includes a Freedium top nav bar (`· Freedium beta 🎉 1.1M Toggle menu`) and a large block of injected Remix context/JSON at the bottom (`window.__remixContext = ...`). Readability will likely parse around this, but we should verify the nav isn't mistakenly extracted.

## d. Network Challenges (Rate Limits, CAPTCHA, Redirects)

- **Medium (direct):** No Cloudflare challenges, 429 rate limit statuses, or captchas were observed. Medium simply returns a truncated 200 OK page.
- **Freedium (primary):** Failed completely. Connections resulted in an immediate `fetch failed` error (DNS or connection refused) within 250ms, meaning `freedium.cfd` is inaccessible.
- **Freedium Mirror:** Returned a clean 200 OK response with no captchas or redirects.

## e. Recommendation for Freedium

Given that `freedium.cfd` immediately failed while `freedium-mirror.cfd` reliably returned the full article, **we should lead with `freedium-mirror.cfd`** as our primary bypass route.
