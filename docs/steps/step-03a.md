# Step 3A: Article Fetching Discovery

We conducted discovery to determine how to detect paywalled Medium articles and how well the Freedium bypass works.

## Actions Taken
- Created `scripts/list-candidate-urls.ts` to list URLs from `digest-2026-09-25.eml`.
- Created `scripts/fetch-fixture.ts` to fetch URLs sequentially with realistic browser headers and save HTML plus metadata.
- Selected 3 URLs (1 free, 2 member-only) and fetched them via direct Medium access, `freedium.cfd`, and `freedium-mirror.cfd`.
- Analyzed the downloaded fixtures in `docs/notes/fetch-behavior.md`.
- Updated `AGENTS.md` to add a security note about the new `fixtures/html/` directory.

## Findings
- **Paywall Detection:** Medium returns a truncated HTML document for member-only articles with HTTP 200 OK. We can detect this reliably by checking for `"isLockedPreviewOnly":true` in the Apollo/Middleware state, or the presence of the `<p>Member-only story</p>` string.
- **Freedium Status:** The primary domain `freedium.cfd` is currently failing immediately (network connection failures). The fallback `freedium-mirror.cfd` works reliably and returns the full content. We will lead with the mirror for fetching.
- **Payload Shape:** Freedium includes a navigation bar and injected JS state at the bottom. The article text is full and complete.

## Next Steps
Proceed to Step 3B: build the actual fetcher logic, integrate Readability.js, and convert the content to markdown.
