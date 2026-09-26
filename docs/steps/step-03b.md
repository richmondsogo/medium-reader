# Step 03B: Fetcher Chain and Content Extraction

- Created types for `FetchAttemptResult`, `ExtractedArticle`, `FetchStatus`, and `Completeness`.
- Added `FREEDIUM_BASE_URLS` to configuration.
- Implemented `assessCompleteness` to accurately detect paywalled medium articles.
- Built `httpFetch` as a 15-second timeout wrapper around Node's fetch.
- Created `fetchArticleHtml` to sequence fetch attempts (direct -> freedium mirrors).
- Added `extractArticleContent` which strips unwanted UI chrome (`Freedium beta`, `__remixContext`), runs `@mozilla/readability`, and uses `turndown` to generate Markdown content.
- Created orchestrator `fetchAndExtractArticle` to return structured results including fallback content on total failure.
- Documented fetch heuristics in `docs/adr/0008-fetcher-order-and-completeness-detection.md`.
- All features purely offline tested with injected fetch fakes and real disk fixtures.
